package com.genzfits.controller;

import com.genzfits.model.User;
import com.genzfits.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user, HttpServletRequest request) {
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
            
            // Create session
            HttpSession session = request.getSession();
            session.setAttribute("user", savedUser);
            session.setMaxInactiveInterval(600); // 10 minutes
            
            response.put("status", "success");
            response.put("message", "User registered successfully!");
            response.put("data", savedUser);
            response.put("sessionId", session.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Server error, try again later.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
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
                    // Create session
                    HttpSession session = request.getSession();
                    session.setAttribute("user", userOptional.get());
                    session.setMaxInactiveInterval(600); // 10 minutes
                    
                    response.put("status", "success");
                    response.put("message", "Login successful");
                    response.put("data", userOptional.get());
                    response.put("sessionId", session.getId());
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

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            response.put("status", "success");
            response.put("message", "Logged out successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error during logout");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            User user = (User) session.getAttribute("user");
            response.put("status", "active");
            response.put("user", user);
            response.put("sessionId", session.getId());
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "inactive");
            return ResponseEntity.status(401).body(response);
        }
    }
}