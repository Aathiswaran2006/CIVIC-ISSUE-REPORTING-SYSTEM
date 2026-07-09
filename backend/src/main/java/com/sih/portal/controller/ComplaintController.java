package com.sih.portal.controller;

import com.sih.portal.dto.*;
import com.sih.portal.entity.ArchiveComplaint;
import com.sih.portal.security.UserPrincipal;
import com.sih.portal.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Endpoints for creating, managing, searching, and re-routing citizen complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @Operation(summary = "Raise/file a new complaint")
    public ResponseEntity<ComplaintResponse> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.createComplaint(request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Search and filter through civic complaints dynamically")
    public ResponseEntity<List<ComplaintResponse>> getComplaints(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String pinCode,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String citizenId) {
        
        List<ComplaintResponse> list = complaintService.getComplaints(
                q, status, category, priority, state, district, pinCode, limit, citizenId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch a specific complaint by ID")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.getComplaintById(id, principal != null ? principal.getUser() : null);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PutMapping("/{id}/status")
    @Operation(summary = "Update status and log remarks for a complaint")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.updateComplaintStatus(id, request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/assign")
    @PutMapping("/{id}/assign")
    @Operation(summary = "Re-assign complaint to a different department")
    public ResponseEntity<ComplaintResponse> assignComplaint(
            @PathVariable String id,
            @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.assignComplaint(id, request, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete spam or invalid complaints")
    public ResponseEntity<Map<String, String>> deleteComplaint(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        complaintService.deleteComplaint(id, principal.getUser());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Complaint deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/seen")
    @Operation(summary = "Mark a complaint as seen by an authority")
    public ResponseEntity<ComplaintResponse> markAsSeen(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.markAsSeen(id, principal.getUser());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/progress")
    @Operation(summary = "Add a progress log entry to a complaint")
    public ResponseEntity<ComplaintResponse> addProgressLog(
            @PathVariable String id,
            @RequestBody ProgressLogRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.addProgressLog(id, request.getMessage(), request.getOfficerName(), principal.getUser());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/resolution-time")
    @Operation(summary = "Update estimated resolution time of a complaint")
    public ResponseEntity<ComplaintResponse> updateResolutionTime(
            @PathVariable String id,
            @RequestBody ResolutionTimeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ComplaintResponse response = complaintService.updateEstimatedResolutionTime(id, request.getEstimatedResolutionTime(), principal.getUser());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive a completed complaint")
    public ResponseEntity<Map<String, String>> archiveComplaint(
            @PathVariable String id,
            @RequestBody ArchiveRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        complaintService.archiveComplaint(id, request.getPassword(), principal.getUser());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Complaint archived successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/archive")
    @Operation(summary = "Get list of all archived complaints")
    public ResponseEntity<List<ArchiveComplaint>> getArchivedComplaints(
            @RequestParam String password,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ArchiveComplaint> archives = complaintService.getArchivedComplaints(password, principal.getUser());
        return ResponseEntity.ok(archives);
    }

    @Data
    public static class ProgressLogRequest {
        private String message;
        private String officerName;
    }

    @Data
    public static class ResolutionTimeRequest {
        private String estimatedResolutionTime;
    }

    @Data
    public static class ArchiveRequest {
        private String password;
    }
}
