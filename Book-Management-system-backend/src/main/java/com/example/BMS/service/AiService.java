package com.example.BMS.service;

import com.example.BMS.model.Book;
import com.example.BMS.repository.BookRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

  private final RestClient restClient;
  private final String apiKey;
  private final BookRepository bookRepository;

  private static final String MODEL = "gemini-1.5-flash-latest";
  private static final String GENERATE_URL = "/v1beta/models/" + MODEL + ":generateContent";

  public AiService(
      @Value("${gemini.api.base:https://generativelanguage.googleapis.com}") String baseUrl,
      @Value("${gemini.api.key:}") String apiKey,
      BookRepository bookRepository) {
    this.apiKey = apiKey;
    this.bookRepository = bookRepository;
    this.restClient = RestClient.builder()
        .baseUrl(baseUrl)
        .build();
  }

  public String chat(List<Message> history, Optional<Long> bookIdOpt) {
    // Build lightweight catalog context to help Gemini answer from our DB
    String catalog = buildCatalogContext(bookIdOpt, history);

    StringBuilder sb = new StringBuilder();
    sb.append("You are a helpful bookstore assistant for our site.\n")
      .append("You can:\n")
      .append("- Find books in the catalog\n")
      .append("- Summarize books\n")
      .append("- Recommend books from the provided catalog only\n\n")
      .append("Format your responses as concise Markdown with short headings and bullet points.\n")
      .append("Keep answers focused, scannable, and under ~8 lines unless asked otherwise.\n\n")
      .append("When recommending, pick from the catalog list and keep answers concise.\n\n");

    if (!catalog.isEmpty()) {
      sb.append("Catalog (id | title | author | category):\n")
        .append(catalog)
        .append("\n\n");
    }

    // Concatenate prior turns to a single prompt for simplicity
    for (Message m : history) {
      sb.append(m.role.toUpperCase()).append(": ").append(m.content).append("\n\n");
    }

    String prompt = sb.toString();
    return generateText(prompt);
  }

  public String summarizeBook(Long bookId) {
    Book book = bookRepository.findById(bookId).orElse(null);
    if (book == null) return "Sorry, I couldn't find that book.";

    String desc = Optional.ofNullable(book.getDescription()).orElse("");
    String prompt = "Summarize the following book for a shopper in 120-150 words.\n" +
        "Focus on tone, themes, and who might enjoy it.\n\n" +
        "Title: " + safe(book.getTitle()) + "\n" +
        "Author: " + safe(book.getAuthor()) + "\n\n" +
        (desc.isBlank() ? "No description available; infer from title/author in a neutral way." : ("Description:\n" + desc));
    return generateText(prompt);
  }

  public List<Recommendation> recommend(Long seedBookId, Optional<String> queryOpt) {
    // Use our current catalog as the only candidate pool
    List<Book> all = bookRepository.findAll();
    if (all.isEmpty()) return List.of();

    String catalog = all.stream()
        .map(b -> "%d | %s | %s | %s".formatted(
            b.getBookId(), safe(b.getTitle()), safe(b.getAuthor()),
            b.getCategory() != null ? safe(b.getCategory().getCategoryName()) : "Uncategorized"))
        .collect(Collectors.joining("\n"));

    StringBuilder sb = new StringBuilder();
    sb.append("From the catalog below, pick 5 recommended bookIds and a short reason.\n")
      .append("Return ONLY strict JSON in this shape: {\"recommendations\":[{\"bookId\":123,\"reason\":\"...\"}]}\n")
      .append("If the seed book is present, prefer same author/category with diversity.\n\n");

    if (seedBookId != null) {
      sb.append("SeedBookId: ").append(seedBookId).append("\n");
    }
    queryOpt.ifPresent(q -> sb.append("UserPreference: ").append(q).append("\n"));

    sb.append("\nCatalog:\n").append(catalog);

    String raw = generateText(sb.toString());
    // Try to parse extremely defensively to extract IDs
    try {
      Map<?,?> parsed = Json.minParseObject(raw);
      Object list = parsed.get("recommendations");
      if (list instanceof List<?> items) {
        List<Recommendation> recs = new ArrayList<>();
        for (Object o : items) {
          if (o instanceof Map<?,?> m) {
            Object idObj = m.get("bookId");
            Object reasonObj = m.get("reason");
            Long id = Json.toLong(idObj);
            if (id != null) {
              String reason = Objects.toString(reasonObj, "A good match from the catalog.");
              // ensure the id exists
              if (all.stream().anyMatch(b -> Objects.equals(b.getBookId(), id))) {
                recs.add(new Recommendation(id, reason));
              }
            }
          }
        }
        if (!recs.isEmpty()) return recs;
      }
    } catch (Exception ignore) {}

    // Fallback: simple heuristic by same category or author
    Optional<Book> seed = all.stream().filter(b -> Objects.equals(b.getBookId(), seedBookId)).findFirst();
    List<Book> candidates = new ArrayList<>(all);
    seed.ifPresent(b -> candidates.sort(Comparator.comparingInt(x -> scoreSimilarity(b, x))));
    return candidates.stream()
        .filter(b -> !Objects.equals(b.getBookId(), seedBookId))
        .limit(5)
        .map(b -> new Recommendation(b.getBookId(), "Similar to your interests."))
        .collect(Collectors.toList());
  }

  private int scoreSimilarity(Book seed, Book other) {
    int s = 0;
    if (safe(seed.getAuthor()).equalsIgnoreCase(safe(other.getAuthor()))) s -= 2;
    if (seed.getCategory() != null && other.getCategory() != null &&
        safe(seed.getCategory().getCategoryName()).equalsIgnoreCase(safe(other.getCategory().getCategoryName()))) s -= 1;
    return s;
  }

  private String buildCatalogContext(Optional<Long> bookIdOpt, List<Message> history) {
    List<Book> items;
    if (bookIdOpt.isPresent()) {
      items = bookRepository.findById(bookIdOpt.get()).map(List::of).orElse(List.of());
    } else {
      // Try to infer a keyword from the latest user message
      String q = history.isEmpty() ? "" : history.get(history.size() - 1).content;
      if (q == null) q = "";
      items = bookRepository.searchBooks(q);
      if (items == null || items.isEmpty()) items = bookRepository.findAll();
    }
    return items.stream()
        .limit(25)
        .map(b -> "%d | %s | %s | %s".formatted(
            b.getBookId(), safe(b.getTitle()), safe(b.getAuthor()),
            b.getCategory() != null ? safe(b.getCategory().getCategoryName()) : "Uncategorized"))
        .collect(Collectors.joining("\n"));
  }

  private String generateText(String prompt) {
    if (apiKey == null || apiKey.isBlank()) {
      return "AI is not configured. Please set GEMINI_API_KEY.";
    }

    Map<String, Object> body = Map.of(
        "contents", List.of(Map.of(
            "role", "user",
            "parts", List.of(Map.of("text", prompt))
        ))
    );

    Map<?, ?> response;
    try {
      response = restClient.post()
          .uri(uriBuilder -> uriBuilder.path(GENERATE_URL)
              .queryParam("key", apiKey)
              .build())
          .contentType(MediaType.APPLICATION_JSON)
          .accept(MediaType.APPLICATION_JSON)
          .body(body)
          .retrieve()
          .body(Map.class);
    } catch (Exception e) {
      String msg = e.getMessage() == null ? "Unknown error" : e.getMessage();
      return "AI request failed: " + msg;
    }

    // Extract first candidate text
    try {
      Object candidatesObj = response.get("candidates");
      if (candidatesObj instanceof List<?> candidates && !candidates.isEmpty()) {
        Object first = candidates.get(0);
        if (first instanceof Map<?,?> cand) {
          Object content = cand.get("content");
          if (content instanceof Map<?,?> cont) {
            Object parts = cont.get("parts");
            if (parts instanceof List<?> plist && !plist.isEmpty()) {
              Object p0 = plist.get(0);
              if (p0 instanceof Map<?,?> pmap) {
                Object txt = pmap.get("text");
                if (txt != null) return Objects.toString(txt);
              }
            }
          }
        }
      }
    } catch (Exception ignored) {}

    return "Sorry, I couldn’t generate a response.";
  }

  private static String safe(String s) {
    return s == null ? "" : s.replace('\n', ' ').replace('\r', ' ').trim();
  }

  // --- Simple DTOs used by controller ---
  public record Message(String role, String content) {}
  public record Recommendation(Long bookId, String reason) {}

  // --- Tiny JSON helper to avoid adding libs ---
  static class Json {
    @SuppressWarnings("unchecked")
    static Map<String, Object> minParseObject(String raw) {
      // Extremely defensive, minimal JSON object parser for the expected flat shape.
      // This is NOT a general JSON parser; it only handles our expected output.
      Map<String, Object> out = new LinkedHashMap<>();
      if (raw == null) return out;
      String s = raw.trim();
      int i = s.indexOf('{');
      int j = s.lastIndexOf('}');
      if (i < 0 || j <= i) return out;
      s = s.substring(i + 1, j);
      // only look for "recommendations":[{...}]
      int k = s.indexOf("\"recommendations\"");
      if (k < 0) return out;
      int colon = s.indexOf(':', k);
      int start = s.indexOf('[', colon);
      int end = s.indexOf(']', start);
      if (start < 0 || end < 0) return out;
      String arr = s.substring(start + 1, end);
      List<Map<String, Object>> list = new ArrayList<>();
      for (String item : arr.split("\\},\\s*\\{")) {
        String it = item.replaceAll("^[\\s\\{]*", "").replaceAll("[\\s\\}]*$", "");
        Map<String, Object> m = new LinkedHashMap<>();
        for (String pair : it.split(",")) {
          String[] kv = pair.split(":", 2);
          if (kv.length == 2) {
            String key = kv[0].replaceAll("[\\\"\\s]", "");
            String val = kv[1].trim();
            if (val.matches("^[0-9]+$")) m.put(key, Long.parseLong(val));
            else m.put(key, val.replaceAll("^[\\\"]|[\\\"]$", ""));
          }
        }
        list.add(m);
      }
      out.put("recommendations", list);
      return out;
    }

    static Long toLong(Object o) {
      if (o instanceof Number n) return n.longValue();
      try { return o == null ? null : Long.parseLong(o.toString()); } catch (Exception e) { return null; }
    }
  }
}
