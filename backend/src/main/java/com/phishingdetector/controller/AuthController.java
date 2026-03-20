package com.phishingdetector.controller;

import com.phishingdetector.dto.JwtResponse;
import com.phishingdetector.dto.LoginRequest;
import com.phishingdetector.dto.MessageResponse;
import com.phishingdetector.dto.SignupRequest;
import com.phishingdetector.dto.ResetPasswordRequest;
import com.phishingdetector.model.User;
import com.phishingdetector.repository.UserRepository;
import com.phishingdetector.security.JwtUtils;
import com.phishingdetector.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import com.phishingdetector.dto.GoogleAuthRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthController.class);
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Value("${google.client.id}")
    private String googleClientId;

    @PostMapping("/google")
    public ResponseEntity<?> googleSignIn(@Valid @RequestBody GoogleAuthRequest request) {
        log.info("Google Authentication attempt");
        
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                log.warn("Invalid Google ID token");
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid Google Token!"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String fullName = (String) payload.get("name");

            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;

            if (userOptional.isPresent()) {
                user = userOptional.get();
                // Ensure existing bidyasingrongpi90@gmail.com is promoted if they were ROLE_USER before
                if ("bidyasingrongpi90@gmail.com".equalsIgnoreCase(email) && !"ROLE_ADMIN".equals(user.getRole())) {
                    user.setRole("ROLE_ADMIN");
                    userRepository.save(user);
                }
                log.info("Returning Google user found: {}", user.getUsername());
            } else {
                log.info("Creating new user from Google account: {}", email);
                user = new User();
                user.setUsername(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 4));
                user.setEmail(email);
                user.setFullName(fullName);
                user.setPassword(encoder.encode(UUID.randomUUID().toString())); // Randomized password for OAuth users
                
                // Designated System Administrator Auto-Promotion
                if ("bidyasingrongpi90@gmail.com".equalsIgnoreCase(email)) {
                    user.setRole("ROLE_ADMIN");
                } else {
                    user.setRole("ROLE_USER");
                }
                
                user.setEnabled(true); // Auto-enable Google verified users
                userRepository.save(user);
            }

            // Generate JWT for the user
            String jwt = jwtUtils.generateJwtTokenFromUsername(user.getUsername());
            
            return ResponseEntity.ok(new JwtResponse(jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    List.of(user.getRole())));

        } catch (GeneralSecurityException | IOException e) {
            log.error("Google verify error: ", e);
            return ResponseEntity.internalServerError().body(new MessageResponse("Error verifying Google account"));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Authentication attempt for user: {}", loginRequest.getUsername());
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        log.info("User {} authenticated successfully", userDetails.getUsername());
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                user.getEmail(),
                user.getFullName(),
                roles));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetRequest) {
        log.info("Password reset request for user: {}", resetRequest.getUsername());
        Optional<User> userOpt = userRepository.findByUsername(resetRequest.getUsername());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        User user = userOpt.get();
        if (!user.getEmail().equals(resetRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username and Email do not match!"));
        }

        user.setPassword(encoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);
        log.info("Password updated for user: {}", user.getUsername());

        return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        log.info("Registration attempt for username: {}, email: {}", signUpRequest.getUsername(), signUpRequest.getEmail());
        
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            log.warn("Username already taken: {}", signUpRequest.getUsername());
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setFullName(signUpRequest.getFullName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole("ROLE_USER");
        user.setEnabled(false);

        userRepository.save(user);
        log.info("User {} registered successfully", user.getUsername());

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
