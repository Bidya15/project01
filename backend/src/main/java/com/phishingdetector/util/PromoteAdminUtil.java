package com.phishingdetector.util;

import com.phishingdetector.model.User;
import com.phishingdetector.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class PromoteAdminUtil implements CommandLineRunner {
    private final UserRepository userRepository;

    public PromoteAdminUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "bidyasingrongpi90@gmail.com";
        userRepository.findByEmail(adminEmail).ifPresentOrElse(user -> {
            if (!"ROLE_ADMIN".equals(user.getRole()) || !user.isEnabled()) {
                user.setRole("ROLE_ADMIN");
                user.setEnabled(true);
                userRepository.save(user);
                System.out.println(">>> [SUCCESS] Promoted " + adminEmail + " to ROLE_ADMIN and ENABLED.");
            }
        }, () -> {
            System.out.println(">>> [INFO] Admin user " + adminEmail + " not found in database yet.");
        });
    }
}
