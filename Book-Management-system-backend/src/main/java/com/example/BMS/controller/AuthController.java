package com.example.BMS.controller;

import com.example.BMS.dto.AuthResponseDto;
import com.example.BMS.dto.LoginDto;
import com.example.BMS.dto.RegisterDto;
import com.example.BMS.service.AuthService;
import com.example.BMS.service.JwtService;
import com.example.BMS.repository.UserRepository;
import com.example.BMS.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  @Autowired
  private AuthService authService;

  @Autowired
  private AuthenticationManager authenticationManager;

  @Autowired
  private JwtService jwtService;

  @Autowired
  private UserRepository userRepository;

  @PostMapping("/register")
  public ResponseEntity<String> registerUser(@RequestBody RegisterDto registerDto) {
    authService.register(registerDto);
    return ResponseEntity.ok("User registered successfully!");
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponseDto> loginUser(@RequestBody LoginDto loginDto) {
    try {
      // Authenticate using the user's EMAIL and password
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));

      System.out.println("Authenticated user name: " + authentication.getName()); // ADD THIS LINE

      // If successful, generate a token using the EMAIL
      String token = jwtService.generateToken(loginDto.getEmail());
      String email = authentication.getName();
      // Map email -> display name from DB (Customer.fullName)
      String displayName = userRepository.findByEmail(email)
          .map(User::getCustomer)
          .map(c -> c != null ? c.getFullName() : null)
          .filter(n -> n != null && !n.isBlank())
          .orElseGet(() -> {
            int at = email.indexOf('@');
            return at > 0 ? email.substring(0, at) : email; // nicer fallback
          });
      return ResponseEntity.ok(new AuthResponseDto(token, displayName));

    } catch (BadCredentialsException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }
  }

  @GetMapping("/me")
  public ResponseEntity<Map<String, String>> me(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    String email = authentication.getName();
    String displayName = userRepository.findByEmail(email)
        .map(User::getCustomer)
        .map(c -> c != null ? c.getFullName() : null)
        .filter(n -> n != null && !n.isBlank())
        .orElseGet(() -> {
          int at = email.indexOf('@');
          return at > 0 ? email.substring(0, at) : email; // nicer fallback
        });
    Map<String, String> body = new HashMap<>();
    body.put("username", displayName);
    return ResponseEntity.ok(body);
  }
}
