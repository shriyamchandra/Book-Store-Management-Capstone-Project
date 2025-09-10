package com.example.BMS.controller;

import com.example.BMS.service.AiService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
public class AiController {

  private final AiService aiService;

  public AiController(AiService aiService) {
    this.aiService = aiService;
  }

  @PostMapping(path = "/chat", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Map<String, Object>> chat(@RequestBody ChatRequest req) {
    String reply = aiService.chat(req.messages(), Optional.ofNullable(req.bookId()));
    return ResponseEntity.ok(Map.of(
        "reply", reply
    ));
  }

  @PostMapping(path = "/summarize", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Map<String, Object>> summarize(@RequestBody SummarizeRequest req) {
    String summary = aiService.summarizeBook(req.bookId());
    return ResponseEntity.ok(Map.of("summary", summary));
  }

  @GetMapping(path = "/recommendations", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Map<String, Object>> recommend(
      @RequestParam(name = "seedBookId", required = false) Long seedBookId,
      @RequestParam(name = "q", required = false) String q) {
    var recs = aiService.recommend(seedBookId, Optional.ofNullable(q));
    return ResponseEntity.ok(Map.of("recommendations", recs));
  }

  // --- DTOs ---
  public record ChatRequest(List<AiService.Message> messages, Long bookId) {}
  public record SummarizeRequest(Long bookId) {}
}

