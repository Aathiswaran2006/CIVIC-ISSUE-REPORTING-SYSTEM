package com.sih.portal.service.impl;

import com.sih.portal.dto.*;
import com.sih.portal.entity.*;
import com.sih.portal.exception.BadRequestException;
import com.sih.portal.exception.ResourceNotFoundException;
import com.sih.portal.exception.UnauthorizedException;
import com.sih.portal.mapper.PortalMapper;
import com.sih.portal.repository.*;
import com.sih.portal.service.AuditLogService;
import com.sih.portal.service.ComplaintService;
import com.sih.portal.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ArchiveComplaintRepository archiveComplaintRepository;
    private final PortalMapper portalMapper;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    private static final Map<String, String> DEPARTMENT_MAPPINGS;

    static {
        Map<String, String> mappings = new HashMap<>();
        mappings.put("Road Pothole / Damage", "Roads & Highways");
        mappings.put("Garbage Dump / Sanitation", "Sanitation & Waste Management");
        mappings.put("Water Leakage / Pipe Burst", "Water Supply & Sewage Board");
        mappings.put("Sewage Overflow / Drainage", "Water Supply & Sewage Board");
        mappings.put("Broken Street Light", "Electrical & Streetlights");
        mappings.put("Traffic Signal Failure", "Traffic Police Department");
        mappings.put("Public Toilet Issue", "Sanitation & Waste Management");
        mappings.put("Electricity / Live Wire Issue", "State Electricity Board");
        mappings.put("Pollution / Illegal Dumping", "Pollution Control Board");
        mappings.put("Encroachment", "Urban Planning & Town Encroachment");
        mappings.put("Tree Fall / Drainage Block", "Forestry & Disaster Management");
        mappings.put("Waterlogging / Flooding", "Disaster Management Cell");
        mappings.put("Stray Animal Menace", "Veterinary & Animal Husbandry");
        mappings.put("Public Property Damage", "Public Works Department");
        mappings.put("Other Civic Issues", "Municipal Administration");
        DEPARTMENT_MAPPINGS = Collections.unmodifiableMap(mappings);
    }

    @Override
    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, User currentUser) {
        String complaintId = String.format("COMP-2026-%03d", complaintRepository.count() + 1);
        String citizenName = request.isAnonymous() ? null : currentUser.getName();
        String assignedDepartment = DEPARTMENT_MAPPINGS.getOrDefault(request.getCategory(), "Municipal Administration");

        Complaint complaint = Complaint.builder()
                .id(complaintId)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.SUBMITTED)
                .images(request.getImages() != null ? request.getImages() : new ArrayList<>())
                .video(request.getVideo())
                .latitude(request.getLocation().getLat())
                .longitude(request.getLocation().getLng())
                .address(request.getAddress())
                .landmark(request.getLandmark())
                .state(request.getState())
                .district(request.getDistrict())
                .pinCode(request.getPinCode())
                .anonymous(request.isAnonymous())
                .citizenId(currentUser.getId())
                .citizenName(citizenName)
                .submissionTime(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .assignedDepartment(assignedDepartment)
                .timeline(new ArrayList<>())
                .progressLogs(new ArrayList<>())
                .build();

        ComplaintTimelineEvent initialEvent = ComplaintTimelineEvent.builder()
                .id("t-" + System.currentTimeMillis() + "-1")
                .status(ComplaintStatus.SUBMITTED)
                .updatedBy(request.isAnonymous() ? "Anonymous Citizen" : currentUser.getName())
                .remarks("Complaint raised via Mobile/Web portal.")
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .complaint(complaint)
                .build();

        complaint.getTimeline().add(initialEvent);
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify admins
        notificationService.createNotification(
                "admin",
                "New Complaint Reported",
                "A new complaint regarding " + request.getCategory() + " was reported in " + request.getDistrict() + ", " + request.getState() + "."
        );

        auditLogService.log("COMPLAINT_CREATED", currentUser.getId(), currentUser.getName(),
                "Submitted complaint " + complaintId + " under " + request.getCategory());

        return portalMapper.toComplaintResponse(savedComplaint);
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(String id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        ComplaintResponse response = portalMapper.toComplaintResponse(complaint);
        
        // Mask user info if complaints are submitted anonymously and requested user is not admin
        if (complaint.isAnonymous() && (currentUser == null || currentUser.getRole() != UserRole.ADMIN)) {
            response.setCitizenName("");
            response.setCitizenId(null);
        }
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaints(
            String q, String status, String category, String priority,
            String state, String district, String pinCode, Integer limit, String citizenId) {

        Specification<Complaint> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Exclude archived complaints from main view lists
            predicates.add(cb.equal(root.get("isArchived"), false));

            if (q != null && !q.trim().isEmpty()) {
                String searchStr = "%" + q.toLowerCase() + "%";
                Predicate idPred = cb.like(cb.lower(root.get("id")), searchStr);
                Predicate titlePred = cb.like(cb.lower(root.get("title")), searchStr);
                Predicate descPred = cb.like(cb.lower(root.get("description")), searchStr);
                Predicate addrPred = cb.like(cb.lower(root.get("address")), searchStr);
                Predicate landmarkPred = cb.like(cb.lower(root.get("landmark")), searchStr);
                predicates.add(cb.or(idPred, titlePred, descPred, addrPred, landmarkPred));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), ComplaintStatus.fromValue(status)));
            }

            if (category != null && !category.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (priority != null && !priority.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("priority"), ComplaintPriority.fromValue(priority)));
            }

            if (state != null && !state.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("state"), state));
            }

            if (district != null && !district.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("district"), district));
            }

            if (pinCode != null && !pinCode.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("pinCode"), pinCode));
            }

            if (citizenId != null && !citizenId.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("citizenId"), citizenId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sortBySubmissionTimeDesc = Sort.by(Sort.Direction.DESC, "submissionTime");
        List<Complaint> complaints;

        if (limit != null && limit > 0) {
            Pageable pageable = PageRequest.of(0, limit, sortBySubmissionTimeDesc);
            complaints = complaintRepository.findAll(spec, pageable).getContent();
        } else {
            complaints = complaintRepository.findAll(spec, sortBySubmissionTimeDesc);
        }

        List<ComplaintResponse> responses = new ArrayList<>();
        for (Complaint c : complaints) {
            ComplaintResponse response = portalMapper.toComplaintResponse(c);
            if (c.isAnonymous()) {
                response.setCitizenName("");
                response.setCitizenId(null);
            }
            responses.add(response);
        }

        return responses;
    }

    @Override
    @Transactional
    public ComplaintResponse updateComplaintStatus(String id, StatusUpdateRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (currentUser.getRole() != UserRole.AUTHORITY && currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only Authorities or Administrators can update complaint status");
        }

        complaint.setStatus(request.getStatus());
        complaint.setAuthorityRemarks(request.getRemarks());
        
        if (request.getStatus() == ComplaintStatus.RESOLVED) {
            complaint.setCompletionDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        }

        if (request.getResolutionImage() != null) {
            complaint.setResolutionImage(request.getResolutionImage());
        }

        ComplaintTimelineEvent event = ComplaintTimelineEvent.builder()
                .id("t-" + System.currentTimeMillis())
                .status(request.getStatus())
                .updatedBy(currentUser.getName())
                .remarks(request.getRemarks())
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .complaint(complaint)
                .build();

        complaint.getTimeline().add(event);
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify reporter (citizen)
        notificationService.createNotification(
                complaint.getCitizenId(),
                "Complaint Update: " + request.getStatus().getValue(),
                "Your complaint " + complaint.getId() + " status is now '" + request.getStatus().getValue() + "'. Remarks: " + request.getRemarks()
        );

        auditLogService.log("STATUS_UPDATED", currentUser.getId(), currentUser.getName(),
                "Updated complaint " + complaint.getId() + " status to " + request.getStatus());

        return portalMapper.toComplaintResponse(savedComplaint);
    }

    @Override
    @Transactional
    public ComplaintResponse assignComplaint(String id, AssignmentRequest request, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only administrators can assign departments");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (request.getAssignedDepartment() != null) {
            complaint.setAssignedDepartment(request.getAssignedDepartment());
            complaint.setStatus(ComplaintStatus.ASSIGNED);

            ComplaintTimelineEvent event = ComplaintTimelineEvent.builder()
                    .id("t-" + System.currentTimeMillis())
                    .status(ComplaintStatus.ASSIGNED)
                    .updatedBy(currentUser.getName())
                    .remarks("Assigned department re-mapped to: " + request.getAssignedDepartment())
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                    .complaint(complaint)
                    .build();

            complaint.getTimeline().add(event);
        }

        if (request.getPriority() != null) {
            complaint.setPriority(request.getPriority());
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        auditLogService.log("COMPLAINT_ASSIGNED", currentUser.getId(), currentUser.getName(),
                "Assigned complaint " + complaint.getId() + " to " + request.getAssignedDepartment());

        return portalMapper.toComplaintResponse(savedComplaint);
    }

    @Override
    @Transactional
    public void deleteComplaint(String id, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Access denied. Admin only.");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        complaintRepository.delete(complaint);

        auditLogService.log("REMOVED_SPAM", currentUser.getId(), currentUser.getName(),
                "Removed complaint ID: " + complaint.getId() + " ('" + complaint.getTitle() + "') as spam");
    }

    @Override
    @Transactional
    public ComplaintResponse markAsSeen(String id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (!complaint.isSeenByAuthority()) {
            complaint.setSeenByAuthority(true);
            complaint.setSeenTime(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            if (complaint.getStatus() == ComplaintStatus.SUBMITTED || complaint.getStatus() == ComplaintStatus.ASSIGNED) {
                complaint.setStatus(ComplaintStatus.SEEN_BY_AUTHORITY);
                
                ComplaintTimelineEvent event = ComplaintTimelineEvent.builder()
                        .id("t-" + System.currentTimeMillis())
                        .status(ComplaintStatus.SEEN_BY_AUTHORITY)
                        .updatedBy(currentUser.getName())
                        .remarks("Complaint opened and seen by Authority.")
                        .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                        .complaint(complaint)
                        .build();
                complaint.getTimeline().add(event);
            }
            complaintRepository.save(complaint);
            auditLogService.log("COMPLAINT_SEEN", currentUser.getId(), currentUser.getName(),
                    "Authority viewed and marked complaint " + id + " as seen.");
        }

        return portalMapper.toComplaintResponse(complaint);
    }

    @Override
    @Transactional
    public ComplaintResponse addProgressLog(String id, String message, String officerName, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (currentUser.getRole() != UserRole.AUTHORITY && currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only Authorities or Admins can add progress updates");
        }

        LocalDateTime now = LocalDateTime.now();
        String dateStr = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String timeStr = now.format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        ComplaintProgress progress = ComplaintProgress.builder()
                .id("prog-" + System.currentTimeMillis())
                .complaint(complaint)
                .date(dateStr)
                .time(timeStr)
                .officerName(officerName != null && !officerName.trim().isEmpty() ? officerName : currentUser.getName())
                .message(message)
                .build();

        complaint.getProgressLogs().add(progress);
        
        if (complaint.getStatus() != ComplaintStatus.RESOLVED && complaint.getStatus() != ComplaintStatus.CLOSED) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        }

        ComplaintTimelineEvent event = ComplaintTimelineEvent.builder()
                .id("t-" + System.currentTimeMillis())
                .status(complaint.getStatus())
                .updatedBy(currentUser.getName())
                .remarks("Progress update added: " + message)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .complaint(complaint)
                .build();
        complaint.getTimeline().add(event);

        complaintRepository.save(complaint);
        
        auditLogService.log("PROGRESS_LOG_ADDED", currentUser.getId(), currentUser.getName(),
                "Added daily progress log for complaint " + id);

        return portalMapper.toComplaintResponse(complaint);
    }

    @Override
    @Transactional
    public ComplaintResponse updateEstimatedResolutionTime(String id, String estimatedResolutionTime, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (currentUser.getRole() != UserRole.AUTHORITY && currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only Authorities or Admins can update resolution time");
        }

        complaint.setEstimatedResolutionTime(estimatedResolutionTime);
        if (complaint.getStatus() != ComplaintStatus.RESOLVED && complaint.getStatus() != ComplaintStatus.CLOSED) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        }

        ComplaintTimelineEvent event = ComplaintTimelineEvent.builder()
                .id("t-" + System.currentTimeMillis())
                .status(complaint.getStatus())
                .updatedBy(currentUser.getName())
                .remarks("Estimated resolution time set to: " + estimatedResolutionTime)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .complaint(complaint)
                .build();
        complaint.getTimeline().add(event);

        complaintRepository.save(complaint);

        auditLogService.log("RESOLUTION_TIME_SET", currentUser.getId(), currentUser.getName(),
                "Set estimated resolution time for complaint " + id + " to " + estimatedResolutionTime);

        return portalMapper.toComplaintResponse(complaint);
    }

    @Override
    @Transactional
    public void archiveComplaint(String id, String password, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only administrators can archive complaints");
        }
        if (!"7102006".equals(password)) {
            throw new UnauthorizedException("Invalid archive password");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (complaint.getStatus() != ComplaintStatus.RESOLVED && complaint.getStatus() != ComplaintStatus.CLOSED) {
            throw new BadRequestException("Only completed (resolved) complaints can be archived");
        }

        complaint.setArchived(true);
        complaintRepository.save(complaint);

        // Snap JSON
        ComplaintResponse response = portalMapper.toComplaintResponse(complaint);
        String json = "{"
            + "\"id\":\"" + response.getId() + "\","
            + "\"title\":\"" + response.getTitle().replace("\"", "\\\"") + "\","
            + "\"description\":\"" + response.getDescription().replace("\"", "\\\"") + "\","
            + "\"category\":\"" + response.getCategory() + "\","
            + "\"status\":\"" + response.getStatus() + "\","
            + "\"pinCode\":\"" + response.getPinCode() + "\","
            + "\"citizenName\":\"" + response.getCitizenName() + "\","
            + "\"submissionTime\":\"" + response.getSubmissionTime() + "\","
            + "\"completionDate\":\"" + (response.getCompletionDate() != null ? response.getCompletionDate() : LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)) + "\""
            + "}";

        ArchiveComplaint archive = ArchiveComplaint.builder()
                .id(complaint.getId())
                .complaintJson(json)
                .completionDate(complaint.getCompletionDate() != null ? complaint.getCompletionDate() : LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .authorityName(complaint.getAssignedDepartment())
                .citizenName(complaint.getCitizenName())
                .pinCode(complaint.getPinCode())
                .build();

        archiveComplaintRepository.save(archive);

        auditLogService.log("COMPLAINT_ARCHIVED", currentUser.getId(), currentUser.getName(),
                "Archived completed complaint ID: " + id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArchiveComplaint> getArchivedComplaints(String password, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only administrators can access the archives");
        }
        if (!"7102006".equals(password)) {
            throw new UnauthorizedException("Invalid archive access password");
        }
        return archiveComplaintRepository.findAll();
    }
}
