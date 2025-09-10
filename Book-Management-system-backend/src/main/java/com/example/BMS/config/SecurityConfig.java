package com.example.BMS.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Autowired
  private JwtAuthFilter jwtAuthFilter;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // 1. Add CORS configuration
        .cors(Customizer.withDefaults())

        // 2. Disable CSRF
        .csrf(AbstractHttpConfigurer::disable)

        // 3. Define authorization rules
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/reviews").permitAll()
            .requestMatchers("/api/ai/**").permitAll()
            .requestMatchers("/api/orders/**").authenticated() // ✅ Only logged-in users can access orders
            .requestMatchers(HttpMethod.POST, "/api/categories").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/books").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/books/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/books/**").hasRole("ADMIN")
            .anyRequest().authenticated())

        // 4. Set session management to stateless
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        // 5. Disable default login page and http basic auth
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)

        // 6. Add our custom JWT filter
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  // Bean to define the CORS configuration
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    // Allow requests from any origin
    configuration.setAllowedOrigins(Arrays.asList("*"));
    // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    configuration.setAllowedMethods(Arrays.asList("*"));
    // Allow all headers
    configuration.setAllowedHeaders(Arrays.asList("*"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    // Apply this configuration to all paths
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
