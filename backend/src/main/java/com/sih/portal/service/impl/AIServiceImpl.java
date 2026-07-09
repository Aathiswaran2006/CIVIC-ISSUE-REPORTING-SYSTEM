package com.sih.portal.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sih.portal.dto.*;
import com.sih.portal.entity.Complaint;
import com.sih.portal.entity.ComplaintStatus;
import com.sih.portal.repository.ComplaintRepository;
import com.sih.portal.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final ComplaintRepository complaintRepository;
    private final ObjectMapper objectMapper;

    @Value("${GEMINI_API_KEY:}")
    private String geminiApiKey;

    @Override
    public AIAnalyzeResponse analyzeIssue(AIAnalyzeRequest request) {
        String description = request.getDescription();
        String title = request.getTitle() != null ? request.getTitle() : "";

        String suggestedCategory = "Other Civic Issues";
        String predictedPriority = "Medium";
        String executiveSummary = description.length() > 100 ? description.substring(0, 100) + "..." : description;
        boolean isDuplicate = false;
        String duplicateOfId = "";

        // 1. Proximity Duplicate Detection (approx. 150 meters)
        if (request.getLocation() != null && request.getLocation().getLat() != null && request.getLocation().getLng() != null) {
            double reqLat = request.getLocation().getLat();
            double reqLng = request.getLocation().getLng();

            List<Complaint> activeComplaints = complaintRepository.findAll().stream()
                    .filter(c -> c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED)
                    .toList();

            for (Complaint c : activeComplaints) {
                double latDiff = Math.abs(c.getLatitude() - reqLat);
                double lngDiff = Math.abs(c.getLongitude() - reqLng);
                if (latDiff < 0.0015 && lngDiff < 0.0015) {
                    isDuplicate = true;
                    duplicateOfId = c.getId();
                    break;
                }
            }
        }

        // 2. Query Gemini if API Key is configured
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String prompt = "Analyze this civic complaint description in India.\n" +
                        "Title: \"" + title + "\"\n" +
                        "Description: \"" + description + "\"\n\n" +
                        "Respond strictly in JSON format with the following schema:\n" +
                        "{\n" +
                        "  \"suggestedCategory\": \"One of: Road Pothole / Damage, Garbage Dump / Sanitation, Water Leakage / Pipe Burst, Sewage Overflow / Drainage, Broken Street Light, Traffic Signal Failure, Public Toilet Issue, Electricity / Live Wire Issue, Pollution / Illegal Dumping, Encroachment, Tree Fall / Drainage Block, Waterlogging / Flooding, Stray Animal Menace, Public Property Damage, Other Civic Issues\",\n" +
                        "  \"predictedPriority\": \"One of: Low, Medium, High, Critical\",\n" +
                        "  \"oneLineSummary\": \"A very short, clear 1-sentence summary of the core issue for government officials.\"\n" +
                        "}";

                // Build Gemini 2.5 Flash request body
                ObjectNode textPart = objectMapper.createObjectNode().put("text", prompt);
                ObjectNode parts = objectMapper.createObjectNode();
                parts.set("parts", objectMapper.createArrayNode().add(textPart));
                
                ObjectNode content = objectMapper.createObjectNode();
                content.set("contents", objectMapper.createArrayNode().add(parts));

                ObjectNode generationConfig = objectMapper.createObjectNode();
                generationConfig.put("responseMimeType", "application/json");
                content.set("generationConfig", generationConfig);

                String requestBody = objectMapper.writeValueAsString(content);

                HttpClient client = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(10))
                        .build();

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    JsonNode rootNode = objectMapper.readTree(response.body());
                    String responseText = rootNode.path("candidates")
                            .path(0)
                            .path("content")
                            .path("parts")
                            .path(0)
                            .path("text")
                            .asText();

                    JsonNode aiResult = objectMapper.readTree(responseText.trim());
                    suggestedCategory = aiResult.path("suggestedCategory").asText(suggestedCategory);
                    predictedPriority = aiResult.path("predictedPriority").asText(predictedPriority);
                    executiveSummary = aiResult.path("oneLineSummary").asText(executiveSummary);
                }
            } catch (Exception e) {
                System.err.println("Gemini text analysis failed. Falling back to local rules: " + e.getMessage());
                // Fall through to regex matching
                Map<String, String> local = fallbackRegex(title, description);
                suggestedCategory = local.get("category");
                predictedPriority = local.get("priority");
            }
        } else {
            // No API key - run fallback rule engine
            Map<String, String> local = fallbackRegex(title, description);
            suggestedCategory = local.get("category");
            predictedPriority = local.get("priority");
        }

        return AIAnalyzeResponse.builder()
                .suggestedCategory(suggestedCategory)
                .predictedPriority(predictedPriority)
                .executiveSummary(executiveSummary)
                .isDuplicate(isDuplicate)
                .duplicateOfId(duplicateOfId)
                .build();
    }

    @Override
    public ImageVerifyResponse verifyImage(ImageVerifyRequest request) {
        String base64Image = request.getBase64Image();
        
        // Clean base64 header if present
        String rawBase64 = base64Image.replaceAll("^data:image/\\w+;base64,", "");

        // 1. If key is missing, mock successful approval
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return ImageVerifyResponse.builder()
                    .valid(true)
                    .confidence(0.92)
                    .detectedIssue("Civic issue pattern detected")
                    .description("Visual analysis is bypassed as Gemini API Key is not configured.")
                    .build();
        }

        // 2. Query Gemini Vision
        try {
            String prompt = "You are an Indian municipal AI inspector. Analyze this uploaded picture.\n" +
                    "Determine if it shows a real civic infrastructure or sanitation issue (e.g., potholes, sewage leaks, garbage dumping, unlit streets, pipe leaks, broken public properties, tree blockages, flooding, air pollution).\n\n" +
                    "Respond strictly in JSON format with the following fields:\n" +
                    "{\n" +
                    "  \"valid\": true or false (true if it represents a real municipal civic/sanitation problem; false if it is a random selfie, empty page, document screen, spam, or clean nature),\n" +
                    "  \"confidence\": 0.0 to 1.0,\n" +
                    "  \"detectedIssue\": \"Brief label of what is detected in the image\",\n" +
                    "  \"description\": \"Short explanation of your visual analysis.\"\n" +
                    "}";

            // Build payload with inlineData image part
            ObjectNode inlineData = objectMapper.createObjectNode()
                    .put("mimeType", "image/jpeg")
                    .put("data", rawBase64);
            
            ObjectNode imagePart = objectMapper.createObjectNode();
            imagePart.set("inlineData", inlineData);

            ObjectNode textPart = objectMapper.createObjectNode()
                    .put("text", prompt);

            ObjectNode parts = objectMapper.createObjectNode();
            parts.set("parts", objectMapper.createArrayNode().add(imagePart).add(textPart));

            ObjectNode content = objectMapper.createObjectNode();
            content.set("contents", objectMapper.createArrayNode().add(parts));

            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("responseMimeType", "application/json");
            content.set("generationConfig", generationConfig);

            String requestBody = objectMapper.writeValueAsString(content);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(15))
                    .build();

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode rootNode = objectMapper.readTree(response.body());
                String responseText = rootNode.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();

                JsonNode aiResult = objectMapper.readTree(responseText.trim());
                return ImageVerifyResponse.builder()
                        .valid(aiResult.path("valid").asBoolean(true))
                        .confidence(aiResult.path("confidence").asDouble(0.85))
                        .detectedIssue(aiResult.path("detectedIssue").asText("Civic issue detected"))
                        .description(aiResult.path("description").asText("Analyzed successfully via visual model."))
                        .build();
            }
        } catch (Exception e) {
            System.err.println("Gemini vision analysis failed: " + e.getMessage());
        }

        // Fallback approve on exception
        return ImageVerifyResponse.builder()
                .valid(true)
                .confidence(0.85)
                .detectedIssue("Civic issue (Fallback Validation)")
                .description("Auto-approved via fallback due to model routing exception.")
                .build();
    }

    private Map<String, String> fallbackRegex(String title, String description) {
        String descLower = (title + " " + description).toLowerCase();
        String suggestedCategory = "Other Civic Issues";
        String predictedPriority = "Medium";

        if (descLower.contains("pothole") || descLower.contains("road") || descLower.contains("crater")) {
            suggestedCategory = "Road Pothole / Damage";
            predictedPriority = "High";
        } else if (descLower.contains("garbage") || descLower.contains("dump") || descLower.contains("waste") || descLower.contains("trash")) {
            suggestedCategory = "Garbage Dump / Sanitation";
            predictedPriority = "Medium";
        } else if (descLower.contains("leak") || descLower.contains("water pipe") || descLower.contains("burst")) {
            suggestedCategory = "Water Leakage / Pipe Burst";
            predictedPriority = "High";
        } else if (descLower.contains("sewage") || descLower.contains("drain") || descLower.contains("drainage") || descLower.contains("overflow")) {
            suggestedCategory = "Sewage Overflow / Drainage";
            predictedPriority = "High";
        } else if (descLower.contains("street light") || descLower.contains("dark") || descLower.contains("street-light")) {
            suggestedCategory = "Broken Street Light";
            predictedPriority = "Medium";
        } else if (descLower.contains("electric") || descLower.contains("wire") || descLower.contains("shock") || descLower.contains("power")) {
            suggestedCategory = "Electricity / Live Wire Issue";
            predictedPriority = "Critical";
        }

        Map<String, String> res = new HashMap<>();
        res.put("category", suggestedCategory);
        res.put("priority", predictedPriority);
        return res;
    }
}
