package com.example.BMS.config;

import com.example.BMS.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  @Autowired
  private JwtService jwtService;

  @Autowired
  private UserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    // 1. Get the Authorization header from the request
    final String authHeader = request.getHeader("Authorization");

    // 2. If the header is null or doesn't start with "Bearer ", pass the request to
    // the next filter
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    // 3. Extract the JWT from the header
    final String jwt = authHeader.substring(7); // "Bearer ".length() is 7
    final String username = jwtService.extractUsername(jwt);

    // 4. If we have a username and the user is not already authenticated
    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      // Load user details from the database
      UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

      // 5. If the token is valid, create an authentication token and set it in the
      // security context
      if (jwtService.validateToken(jwt, userDetails)) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
      }
    }
    // 6. Pass the request to the next filter in the chain
    filterChain.doFilter(request, response);
  }
}