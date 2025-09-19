package com.genzfits.service;

import com.genzfits.model.User;
import com.genzfits.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User saveUser(User user) {
        // encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean mobileExists(String mobile) {
        return userRepository.existsByMobile(mobile);
    }

    public Optional<User> findByIdentifier(String identifier) {
        return userRepository.findByIdentifier(identifier);
    }

    public boolean validateUser(String identifier, String password) {
        Optional<User> userOptional = userRepository.findByIdentifier(identifier);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }

    public Optional<User> getUserByIdentifier(String identifier) {
        return userRepository.findByIdentifier(identifier);
    }

    // Admin methods
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}
