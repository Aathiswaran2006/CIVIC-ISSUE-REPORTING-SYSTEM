package com.sih.portal.controller;

import com.sih.portal.dto.AIAnalyzeRequest;
import com.sih.portal.dto.AIAnalyzeResponse;
import com.sih.portal.dto.ImageVerifyRequest;
import com.sih.portal.dto.ImageVerifyResponse;
import com.sih.portal.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Helpers", description = "Endpoints for Google Gemini smart predictions and image sanitization")
public class AIController {

    private final AIService aiService;

    @PostMapping("/analyze-issue")
    @Operation(summary = "Analyze civic issues to suggest categories, evaluate priority and scan for duplicates")
    public ResponseEntity<AIAnalyzeResponse> analyzeIssue(@Valid @RequestBody AIAnalyzeRequest request) {
        AIAnalyzeResponse response = aiService.analyzeIssue(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-image")
    @Operation(summary = "Analyze image data to verify whether it depicts an actual municipal infrastructure or sanitation issue")
    public ResponseEntity<ImageVerifyResponse> verifyImage(@Valid @RequestBody ImageVerifyRequest request) {
        ImageVerifyResponse response = aiService.verifyImage(request);
        return ResponseEntity.ok(response);
    }
}
