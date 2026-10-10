package com.smc.controller;

import com.smc.dto.AuthRequest;
import com.smc.dto.AuthResponse;
import com.smc.entity.User;
import com.smc.repository.UserRepository;
import com.smc.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        User user = new User();
        user.setUserCode("USR-SMC-" + (int)(Math.random() * 9000 + 1000));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setNic(request.getNic());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setZone("Sainthamaruthu - Ward 03");
        user.setAddress("Beach Road, Sainthamaruthu");
        user.setAssessmentNo("KMC-TAX-2026-9041");

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser.getEmail());

        return ResponseEntity.ok(new AuthResponse(savedUser, token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        var userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error", "User not found"));

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }

        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(user, token));
    }
}