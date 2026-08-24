package com.digisec.controller;

import com.digisec.dto.AuthResponse;
import com.digisec.dto.LoginRequest;
import com.digisec.dto.MessageResponse;
import com.digisec.dto.RegisterRequest;
import com.digisec.dto.UserResponse;
import com.digisec.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Registration, email verification and login")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new account and send a verification email")
    public MessageResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify an account using the token sent by email")
    public MessageResponse verify(@RequestParam("token") String token) {
        return authService.verify(token);
    }

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password and receive a JWT access token")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Get the currently authenticated user's profile")
    public UserResponse me(@AuthenticationPrincipal UserDetails principal) {
        return authService.currentUser(principal.getUsername());
    }
}
