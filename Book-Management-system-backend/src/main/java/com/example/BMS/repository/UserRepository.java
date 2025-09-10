package com.example.BMS.repository;

import com.example.BMS.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Update the method to find by email instead of username
    Optional<User> findByEmail(String email);
}