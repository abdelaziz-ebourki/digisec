package com.digisec.exception;

public class DuplicateResourceException extends RuntimeException {

    private final ErrorCode code;

    public DuplicateResourceException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode getCode() {
        return code;
    }
}
