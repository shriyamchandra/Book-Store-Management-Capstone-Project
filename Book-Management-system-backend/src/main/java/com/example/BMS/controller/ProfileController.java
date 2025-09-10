package com.example.BMS.controller;

import com.example.BMS.dto.ProfileDto;
import com.example.BMS.model.Address;
import com.example.BMS.model.Customer;
import com.example.BMS.model.User;
import com.example.BMS.repository.CustomerRepository;
import com.example.BMS.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CustomerRepository customerRepository;

  @GetMapping
  public ResponseEntity<ProfileDto> getProfile(Authentication authentication) {
    String email = authentication.getName();
    Optional<User> opt = userRepository.findByEmail(email);
    if (opt.isEmpty()) return ResponseEntity.notFound().build();

    User user = opt.get();
    Customer customer = ensureCustomer(user);
    ProfileDto dto = mapToDto(user, customer);
    return ResponseEntity.ok(dto);
  }

  @PutMapping
  public ResponseEntity<ProfileDto> updateProfile(@RequestBody ProfileDto incoming, Authentication authentication) {
    String email = authentication.getName();
    User user = userRepository.findByEmail(email).orElseThrow();
    Customer customer = ensureCustomer(user);

    customer.setFullName(incoming.getFullName());
    customer.setMobileNumber(incoming.getMobileNumber());

    Address address = customer.getAddress();
    if (address == null) address = new Address();
    address.setAddress(incoming.getAddress());
    address.setCity(incoming.getCity());
    address.setCountry(incoming.getCountry());
    address.setPincode(incoming.getPincode());
    customer.setAddress(address);

    customerRepository.save(customer); // cascades to Address
    return ResponseEntity.ok(mapToDto(user, customer));
  }

  private Customer ensureCustomer(User user) {
    Customer c = user.getCustomer();
    if (c == null) {
      c = new Customer();
      c.setUser(user);
      user.setCustomer(c);
      c = customerRepository.save(c);
    }
    if (c.getAddress() == null) c.setAddress(new Address());
    return c;
  }

  private ProfileDto mapToDto(User user, Customer customer) {
    ProfileDto dto = new ProfileDto();
    dto.setEmail(user.getEmail());
    dto.setFullName(customer.getFullName());
    dto.setMobileNumber(customer.getMobileNumber());
    if (customer.getAddress() != null) {
      dto.setAddress(customer.getAddress().getAddress());
      dto.setCity(customer.getAddress().getCity());
      dto.setCountry(customer.getAddress().getCountry());
      dto.setPincode(customer.getAddress().getPincode());
    }
    return dto;
  }
}

