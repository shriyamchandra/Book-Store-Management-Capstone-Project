package com.example.BMS.dto;

import lombok.Data;

@Data
public class ProfileDto {
  private String email;        // read-only for UI display
  private String fullName;
  private String mobileNumber;

  private String address;      // street + house etc
  private String city;
  private String country;
  private String pincode;
}

