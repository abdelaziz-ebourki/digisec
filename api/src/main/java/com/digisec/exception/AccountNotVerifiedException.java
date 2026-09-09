package com.digisec.exception;

public class AccountNotVerifiedException extends RuntimeException {

    private final ErrorCode code;

    public AccountNotVerifiedException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode getCode() {
        return code;
    }
}
