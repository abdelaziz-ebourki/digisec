package com.digisec.service;

import com.digisec.dto.AuthResponse;
import com.digisec.dto.LoginRequest;
import com.digisec.dto.MessageResponse;
import com.digisec.dto.RegisterRequest;
import com.digisec.dto.UserResponse;
import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.entity.VerificationToken;
import com.digisec.exception.AccountNotVerifiedException;
import com.digisec.exception.DuplicateResourceException;
import com.digisec.exception.InvalidVerificationTokenException;
import com.digisec.exception.ResourceNotFoundException;
import com.digisec.exception.UnauthorizedException;
import com.digisec.repository.UserRepository;
import com.digisec.repository.VerificationTokenRepository;
import com.digisec.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class AuthService {

    private static final long TOKEN_VALIDITY_HOURS = 24;

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       VerificationTokenRepository tokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }
        if (userRepository.existsByCodeApoge(request.codeApoge())) {
            throw new DuplicateResourceException("An account with this code apogée already exists");
        }
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new DuplicateResourceException("An account with this phone number already exists");
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .codeApoge(request.codeApoge())
                .email(request.email().toLowerCase())
                .phoneNumber(request.phoneNumber())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .verified(false)
                .build();
        userRepository.save(user);

        String rawToken = generateRawToken();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(hash(rawToken))
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(TOKEN_VALIDITY_HOURS))
                .build();
        tokenRepository.save(verificationToken);

        mailService.sendVerificationEmail(user, rawToken);
        return new MessageResponse("Registration successful. Please check your email to verify your account.");
    }

    @Transactional
    public MessageResponse verify(String rawToken) {
        VerificationToken token = tokenRepository.findByToken(hash(rawToken))
                .orElseThrow(() -> new InvalidVerificationTokenException("Invalid or expired verification link"));

        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new InvalidVerificationTokenException("This verification link has expired. Please register again.");
        }

        User user = token.getUser();
        user.setVerified(true);
        userRepository.save(user);
        tokenRepository.delete(token);
        return new MessageResponse("Your account has been verified. You can now log in.");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isVerified()) {
            throw new AccountNotVerifiedException("Please verify your email address before logging in");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email().toLowerCase(), request.password()));
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtService.generate(user.getEmail(), user.getRole().name());
        return new AuthResponse(accessToken, toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(String email) {
        return userRepository.findByEmail(email)
                .map(AuthService::toUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name());
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
