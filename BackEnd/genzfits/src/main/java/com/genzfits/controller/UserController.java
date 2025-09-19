package com.genzfits.controller;

import com.genzfits.model.User;
import com.genzfits.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (userService.usernameExists(user.getUsername())) {
                response.put("status", "error");
                response.put("message", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }
            if (userService.mobileExists(user.getMobile())) {
                response.put("status", "error");
                response.put("message", "Mobile number already exists");
                return ResponseEntity.badRequest().body(response);
            }
            User savedUser = userService.saveUser(user);
            response.put("status", "success");
            response.put("message", "User registered successfully!");
            response.put("data", savedUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Server error, try again later.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        Map<String, Object> response = new HashMap<>();
        try {
            String identifier = loginRequest.get("identifier");
            String password = loginRequest.get("password");
            if (identifier == null || identifier.isEmpty() || password == null || password.isEmpty()) {
                response.put("status", "error");
                response.put("message", "Identifier and password are required");
                return ResponseEntity.badRequest().body(response);
            }
            boolean isValid = userService.validateUser(identifier, password);
            if (isValid) {
                Optional<User> userOptional = userService.getUserByIdentifier(identifier);
                if (userOptional.isPresent()) {
                    response.put("status", "success");
                    response.put("message", "Login successful");
                    response.put("data", userOptional.get());
                    return ResponseEntity.ok(response);
                }
            }
            response.put("status", "error");
            response.put("message", "Invalid credentials");
            return ResponseEntity.status(401).body(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Server error, try again later.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
