package com.digisec.exception;

public class InvalidFileException extends RuntimeException {

    private final ErrorCode code;

    public InvalidFileException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode getCode() {
        return code;
    }
}
