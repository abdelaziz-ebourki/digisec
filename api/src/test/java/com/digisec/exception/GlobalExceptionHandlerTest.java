package com.digisec.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.ProblemDetail;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void everyBranchEmitsACodeAndNoStackTrace() {
        assertBranch(handler.handleNotFound(
                new ResourceNotFoundException(ErrorCode.POST_NOT_FOUND, "Post not found: 1")),
                404, "POST_NOT_FOUND");
        assertBranch(handler.handleDuplicate(
                new DuplicateResourceException(ErrorCode.EMAIL_ALREADY_EXISTS, "dup")),
                409, "EMAIL_ALREADY_EXISTS");
        assertBranch(handler.handleConflict(
                new ConflictException(ErrorCode.USER_HAS_CONTENT, "has content")),
                409, "USER_HAS_CONTENT");
        assertBranch(handler.handleInvalidToken(
                new InvalidVerificationTokenException(ErrorCode.INVALID_VERIFICATION_LINK, "bad")),
                400, "INVALID_VERIFICATION_LINK");
        assertBranch(handler.handleInvalidFile(
                new InvalidFileException(ErrorCode.INVALID_IMAGE_TYPE, "bad type")),
                400, "INVALID_IMAGE_TYPE");
        assertBranch(handler.handleUnauthorized(
                new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS, "bad creds")),
                401, "INVALID_CREDENTIALS");
        assertBranch(handler.handleAccountNotVerified(
                new AccountNotVerifiedException(ErrorCode.EMAIL_NOT_VERIFIED, "unverified")),
                403, "EMAIL_NOT_VERIFIED");
        assertBranch(handler.handleForbidden(
                new ForbiddenException(ErrorCode.CANNOT_DELETE_SELF, "self")),
                403, "CANNOT_DELETE_SELF");
        assertBranch(handler.handleAccessDenied(
                new org.springframework.security.access.AccessDeniedException("denied")),
                403, "FORBIDDEN");
    }

    private static void assertBranch(ProblemDetail problem, int status, String code) {
        assertThat(problem.getStatus()).isEqualTo(status);
        assertThat(problem.getProperties()).containsEntry("code", code);
        // No stack traces, exception class names, or cause chains leak to clients.
        assertThat(problem.getProperties()).doesNotContainKeys("stackTrace", "stacktrace", "exception", "cause");
        assertThat(problem.getDetail()).doesNotContain(" at ");
    }
}
