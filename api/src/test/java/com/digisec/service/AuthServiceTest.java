package com.digisec.service;

import com.digisec.dto.AuthResponse;
import com.digisec.dto.LoginRequest;
import com.digisec.dto.MessageResponse;
import com.digisec.dto.RegisterRequest;
import com.digisec.entity.Role;
import com.digisec.entity.User;
import com.digisec.entity.VerificationToken;
import com.digisec.exception.AccountNotVerifiedException;
import com.digisec.exception.DuplicateResourceException;
import com.digisec.exception.InvalidVerificationTokenException;
import com.digisec.exception.UnauthorizedException;
import com.digisec.repository.UserRepository;
import com.digisec.repository.VerificationTokenRepository;
import com.digisec.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private VerificationTokenRepository tokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private MailService mailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, tokenRepository, passwordEncoder,
                authenticationManager, jwtService, mailService);
    }

    private RegisterRequest registerRequest() {
        return new RegisterRequest(
                "Ayoub", "Hmida", "1900123", "ayoub@digisec.local", "+212600000001", "password123");
    }

    private User user(boolean verified) {
        return User.builder()
                .id(1L)
                .firstName("Ayoub")
                .lastName("Hmida")
                .codeApoge("1900123")
                .email("ayoub@digisec.local")
                .phoneNumber("+212600000001")
                .passwordHash("hashed")
                .role(Role.USER)
                .verified(verified)
                .build();
    }

    private String sha256(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    @Test
    void registersUserAndSendsVerificationEmail() {
        RegisterRequest request = registerRequest();
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByCodeApoge(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");

        MessageResponse response = authService.register(request);

        assertThat(response.message()).contains("Registration successful");
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("hashed");
        assertThat(userCaptor.getValue().isVerified()).isFalse();

        ArgumentCaptor<VerificationToken> tokenCaptor = ArgumentCaptor.forClass(VerificationToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getToken()).hasSize(64);
        assertThat(tokenCaptor.getValue().getExpiresAt()).isAfter(LocalDateTime.now());
        verify(mailService).sendVerificationEmail(any(User.class), anyString());
    }

    @Test
    void normalizesEmailToLowercaseOnRegistration() {
        RegisterRequest request = new RegisterRequest(
                "Ayoub", "Hmida", "1900123", "AYOUB@DIGISEC.LOCAL", "+212600000001", "password123");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByCodeApoge(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("ayoub@digisec.local");
    }

    @Test
    void rejectsDuplicateEmail() {
        when(userRepository.existsByEmail("ayoub@digisec.local")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("email");

        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsDuplicateCodeApoge() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByCodeApoge("1900123")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("code apogée");
    }

    @Test
    void rejectsDuplicatePhoneNumber() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByCodeApoge(anyString())).thenReturn(false);
        when(userRepository.existsByPhoneNumber("+212600000001")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("phone number");
    }

    @Test
    void verifiesAccountWithValidToken() {
        String rawToken = "raw-token-value";
        VerificationToken token = VerificationToken.builder()
                .token(sha256(rawToken))
                .user(user(false))
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        when(tokenRepository.findByToken(sha256(rawToken))).thenReturn(Optional.of(token));

        MessageResponse response = authService.verify(rawToken);

        assertThat(response.message()).contains("verified");
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isVerified()).isTrue();
        verify(tokenRepository).delete(token);
    }

    @Test
    void rejectsExpiredVerificationToken() {
        String rawToken = "raw-token-value";
        VerificationToken expired = VerificationToken.builder()
                .token(sha256(rawToken))
                .user(user(false))
                .expiresAt(LocalDateTime.now().minusMinutes(5))
                .build();
        when(tokenRepository.findByToken(sha256(rawToken))).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.verify(rawToken))
                .isInstanceOf(InvalidVerificationTokenException.class)
                .hasMessageContaining("expired");

        verify(tokenRepository).delete(expired);
        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsUnknownVerificationToken() {
        when(tokenRepository.findByToken(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verify("bogus"))
                .isInstanceOf(InvalidVerificationTokenException.class);
    }

    @Test
    void logsInVerifiedUserAndReturnsJwt() {
        LoginRequest request = new LoginRequest("ayoub@digisec.local", "password123");
        User verified = user(true);
        when(userRepository.findByEmail("ayoub@digisec.local")).thenReturn(Optional.of(verified));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(Authentication.class));
        when(jwtService.generate("ayoub@digisec.local", "USER")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("ayoub@digisec.local");
        assertThat(response.user().role()).isEqualTo("USER");
    }

    @Test
    void rejectsLoginOfUnverifiedAccount() {
        when(userRepository.findByEmail("ayoub@digisec.local")).thenReturn(Optional.of(user(false)));

        assertThatThrownBy(() -> authService.login(new LoginRequest("ayoub@digisec.local", "password123")))
                .isInstanceOf(AccountNotVerifiedException.class)
                .hasMessageContaining("verify");

        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void rejectsUnknownEmailOnLogin() {
        when(userRepository.findByEmail("ghost@digisec.local")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("ghost@digisec.local", "password123")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void rejectsWrongPasswordOnLogin() {
        when(userRepository.findByEmail("ayoub@digisec.local")).thenReturn(Optional.of(user(true)));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("ayoub@digisec.local", "wrong")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
