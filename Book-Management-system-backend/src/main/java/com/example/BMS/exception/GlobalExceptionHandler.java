package com.example.BMS.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(UserAlreadyExistsException.class)
  public ResponseEntity<String> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
    // Return a 409 Conflict status with the clean error message
    return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
  }

  // You can add more handlers for other custom exceptions here
}