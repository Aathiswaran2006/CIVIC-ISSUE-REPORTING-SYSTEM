package com.sih.portal.service;

import com.sih.portal.dto.AssignmentRequest;
import com.sih.portal.dto.ComplaintRequest;
import com.sih.portal.dto.ComplaintResponse;
import com.sih.portal.dto.StatusUpdateRequest;
import com.sih.portal.entity.ArchiveComplaint;
import com.sih.portal.entity.User;
import java.util.List;

public interface ComplaintService {
    ComplaintResponse createComplaint(ComplaintRequest request, User currentUser);
    ComplaintResponse getComplaintById(String id, User currentUser);
    List<ComplaintResponse> getComplaints(
            String q, String status, String category, String priority,
            String state, String district, String pinCode, Integer limit, String citizenId);
    ComplaintResponse updateComplaintStatus(String id, StatusUpdateRequest request, User currentUser);
    ComplaintResponse assignComplaint(String id, AssignmentRequest request, User currentUser);
    void deleteComplaint(String id, User currentUser);

    ComplaintResponse markAsSeen(String id, User currentUser);
    ComplaintResponse addProgressLog(String id, String message, String officerName, User currentUser);
    ComplaintResponse updateEstimatedResolutionTime(String id, String estimatedResolutionTime, User currentUser);
    void archiveComplaint(String id, String password, User currentUser);
    List<ArchiveComplaint> getArchivedComplaints(String password, User currentUser);
}
