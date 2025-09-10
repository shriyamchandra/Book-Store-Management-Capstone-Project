package com.example.BMS.service;

import com.example.BMS.dto.RegisterDto;
import com.example.BMS.exception.UserAlreadyExistsException;
import com.example.BMS.model.Customer;
import com.example.BMS.model.Role;
import com.example.BMS.model.User;
import com.example.BMS.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(RegisterDto registerDto) {
        // Check if a user with this email already exists
        if (userRepository.findByEmail(registerDto.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("An account with this email already exists.");
        }

        // 1. Create the User object for authentication
        User newUser = new User();
        newUser.setEmail(registerDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        newUser.setRole(Role.ROLE_USER);

        // 2. Create the Customer object for personal details
        Customer newCustomer = new Customer();
        newCustomer.setFullName(registerDto.getFullName());
        newCustomer.setMobileNumber(registerDto.getMobileNumber());
        newCustomer.setRegisterOn(LocalDate.now());

        // 3. Link the User and Customer together
        newUser.setCustomer(newCustomer);
        newCustomer.setUser(newUser);

        // 4. Save the User. Thanks to cascading, the Customer will also be saved.
        return userRepository.save(newUser);
    }
}