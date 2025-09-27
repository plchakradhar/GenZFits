package com.genzfits.config;

import com.genzfits.model.User;
import com.genzfits.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminUser = new User();
            adminUser.setFullName("Administrator");
            adminUser.setUsername("admin");
            adminUser.setMobile("0000000000");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setIsAdmin(true);

            userRepository.save(adminUser);
            System.out.println("Admin user created: admin / admin123");
        }
    }
}