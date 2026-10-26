package com.smc.controller;

import com.smc.dto.AuthRequest;
import com.smc.dto.AuthResponse;
import com.smc.dto.ForgotPasswordRequest;
import com.smc.dto.ResetPasswordRequest;
import com.smc.entity.User;
import com.smc.repository.UserRepository;
import com.smc.security.JwtService;
import com.smc.util.PhoneUtil;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,30}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Login using either username OR email address and password.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String identifier = request.getIdentifier();
        if (identifier == null || identifier.isBlank()) {
            identifier = request.getEmail() != null && !request.getEmail().isBlank()
                    ? request.getEmail()
                    : request.getUsername();
        }

        if (identifier == null || identifier.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username or email is required"));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        String trimmedId = identifier.trim();

        // Support lookup by case-insensitive email or case-insensitive username
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(trimmedId)
                .or(() -> userRepository.findByUsernameIgnoreCase(trimmedId));

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username/email or password"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username/email or password"));
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            return ResponseEntity.status(403).body(Map.of("error", "Your account has been deactivated. Please contact the Municipal Council."));
        }

        // Update last login timestamp
        user.setUpdatedAt(ZonedDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(user, token));
    }

    /**
     * Register a new citizen account with unique username, email, and normalized Sri Lankan phone number.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        // 1. Validation - Full Name
        if (request.getName() == null || request.getName().trim().length() < 2) {
            return ResponseEntity.badRequest().body(Map.of("error", "Full name must be at least 2 characters"));
        }

        // 2. Validation - Username
        if (request.getUsername() == null || request.getUsername().trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }
        String username = request.getUsername().trim().toLowerCase();
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username must be 3-30 characters long and contain only letters, numbers, and underscores"));
        }
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username '" + username + "' is already taken. Please choose another."));
        }

        // 3. Validation - Email
        if (request.getEmail() == null || request.getEmail().trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email address is required"));
        }
        String email = request.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please provide a valid email address"));
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with email '" + email + "' already exists."));
        }

        // 4. Validation - Phone Number (Sri Lankan formats)
        if (request.getPhone() == null || request.getPhone().trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
        }
        String normalizedPhone = PhoneUtil.normalizeSriLankanPhone(request.getPhone());
        if (normalizedPhone == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid Sri Lankan phone number. Use format 07XXXXXXXX, +947XXXXXXXX, or landline."));
        }
        if (userRepository.existsByPhoneNormalized(normalizedPhone)) {
            return ResponseEntity.badRequest().body(Map.of("error", "This phone number is already registered with another account."));
        }

        // 5. Validation - Password & Confirmation
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters long"));
        }
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password confirmation does not match"));
        }

        // 6. Build User Entity (Role strictly CITIZEN to prevent unauthorized privilege escalation)
        User user = new User();
        user.setUserCode("USR-KMC-" + (int)(Math.random() * 9000 + 1000));
        user.setName(request.getName().trim());
        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(request.getPhone().trim());
        user.setPhoneNormalized(normalizedPhone);
        user.setNic(request.getNic() != null && !request.getNic().isBlank() ? request.getNic().trim() : null);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("CITIZEN");
        user.setZone(request.getZone() != null ? request.getZone() : "Sainthamaruthu - Ward 03");
        user.setAddress(request.getAddress() != null ? request.getAddress() : "Beach Road, Sainthamaruthu");
        user.setAssessmentNo("KMC-TAX-2026-" + (int)(Math.random() * 9000 + 1000));
        user.setStatus("Verified Citizen");
        user.setIsActive(true);

        try {
            User savedUser = userRepository.save(user);
            String token = jwtService.generateToken(savedUser.getEmail());
            return ResponseEntity.ok(new AuthResponse(savedUser, token));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "A user with this username, email, or phone number already registered."));
        }
    }

    /**
     * Request a password reset code / token for Forgot Password.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.getIdentifier() == null || request.getIdentifier().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username or email is required"));
        }

        String trimmed = request.getIdentifier().trim();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(trimmed)
                .or(() -> userRepository.findByUsernameIgnoreCase(trimmed));

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "No user found with username or email: " + trimmed));
        }

        User user = userOpt.get();
        // Generate secure 6-digit verification code or token
        String resetToken = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(ZonedDateTime.now().plusHours(1));
        userRepository.save(user);

        // Mask email for privacy
        String maskedEmail = maskEmail(user.getEmail());

        return ResponseEntity.ok(Map.of(
                "message", "Password reset code generated successfully.",
                "resetToken", resetToken,
                "email", maskedEmail,
                "username", user.getUsername()
        ));
    }

    /**
     * Reset password using token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reset token is required"));
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "New password must be at least 6 characters long"));
        }
        if (request.getConfirmPassword() != null && !request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password confirmation does not match"));
        }

        Optional<User> userOpt = userRepository.findByResetToken(request.getToken().trim().toUpperCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or unrecognized reset token"));
        }

        User user = userOpt.get();
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(ZonedDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reset token has expired. Please request a new one."));
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(ZonedDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password has been successfully updated. You may now log in with your new password."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    @SuppressWarnings("null")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmailIgnoreCase(email).map(u -> {
            if (body.containsKey("name") && body.get("name") != null) u.setName(body.get("name").trim());
            if (body.containsKey("phone") && body.get("phone") != null) {
                String phone = body.get("phone").trim();
                String norm = PhoneUtil.normalizeSriLankanPhone(phone);
                if (norm != null) {
                    u.setPhone(phone);
                    u.setPhoneNormalized(norm);
                }
            }
            if (body.containsKey("address")) u.setAddress(body.get("address"));
            if (body.containsKey("zone")) u.setZone(body.get("zone"));
            if (body.containsKey("avatarUrl")) u.setAvatarUrl(body.get("avatarUrl"));
            if (body.containsKey("password") && body.get("password") != null && !body.get("password").isBlank()) {
                u.setPasswordHash(passwordEncoder.encode(body.get("password")));
            }
            return ResponseEntity.ok(userRepository.save(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf("@");
        String name = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (name.length() <= 2) return name.charAt(0) + "*" + domain;
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + domain;
    }
}
