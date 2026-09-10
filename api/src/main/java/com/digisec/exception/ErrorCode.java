package com.digisec.exception;

/**
 * Stable API error identifiers. The frontend keys its French user-facing
 * messages off these codes; the human-readable detail stays English for
 * developers and logs. Never rename or reuse a code.
 */
public enum ErrorCode {

    INVALID_CREDENTIALS,
    SESSION_INVALID,
    EMAIL_NOT_VERIFIED,
    EMAIL_ALREADY_EXISTS,
    CODE_APOGEE_ALREADY_EXISTS,
    PHONE_ALREADY_EXISTS,
    INVALID_VERIFICATION_LINK,
    VERIFICATION_LINK_EXPIRED,
    TITLE_REQUIRED,
    ACTIVITY_DATE_REQUIRED,
    MESSAGE_REQUIRED,
    MESSAGE_TOO_LONG,
    FILE_REQUIRED,
    FILE_TOO_LARGE,
    INVALID_IMAGE_TYPE,
    INVALID_FILE_PATH,
    IMAGE_NOT_FOUND,
    ACTIVITY_HAS_NO_IMAGE,
    POST_NOT_FOUND,
    ACTIVITY_NOT_FOUND,
    COMMENT_NOT_FOUND,
    USER_NOT_FOUND,
    DELETE_NOT_ALLOWED,
    CANNOT_DELETE_SELF,
    CANNOT_DELETE_ADMIN,
    USER_HAS_CONTENT,
    FORBIDDEN,
    // Bean Validation codes (emitted as field-error values, mapped by the
    // same frontend table; kept here so the enum is the full vocabulary).
    EMAIL_REQUIRED,
    EMAIL_INVALID,
    PASSWORD_REQUIRED,
    PASSWORD_LENGTH,
    FIRST_NAME_REQUIRED,
    FIRST_NAME_TOO_LONG,
    LAST_NAME_REQUIRED,
    LAST_NAME_TOO_LONG,
    CODE_APOGEE_REQUIRED,
    CODE_APOGEE_TOO_LONG,
    PHONE_REQUIRED,
    PHONE_INVALID,
    TITLE_TOO_LONG,
    CONTENT_REQUIRED,
    COMMENT_REQUIRED,
    VALIDATION_FAILED,
    RATE_LIMITED
}
