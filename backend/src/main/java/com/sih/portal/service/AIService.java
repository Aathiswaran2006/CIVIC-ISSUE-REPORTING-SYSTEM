package com.sih.portal.service;

import com.sih.portal.dto.AIAnalyzeRequest;
import com.sih.portal.dto.AIAnalyzeResponse;
import com.sih.portal.dto.ImageVerifyRequest;
import com.sih.portal.dto.ImageVerifyResponse;

public interface AIService {
    AIAnalyzeResponse analyzeIssue(AIAnalyzeRequest request);
    ImageVerifyResponse verifyImage(ImageVerifyRequest request);
}
