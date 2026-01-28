package com.bsa.campcard.exception;

/**
 * Exception thrown when a payment operation fails.
 */
public class PaymentException extends RuntimeException {

    /** The error code associated with this payment failure. */
    private final String errorCode;

    /**
     * Constructs a new PaymentException with the specified message.
     *
     * @param message the detail message
     */
    public PaymentException(final String message) {
        super(message);
        this.errorCode = "PAYMENT_ERROR";
    }

    /**
     * Constructs a new PaymentException with message and error code.
     *
     * @param message the detail message
     * @param errorCode the specific error code
     */
    public PaymentException(final String message, final String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    /**
     * Constructs a new PaymentException with message and cause.
     *
     * @param message the detail message
     * @param cause the underlying cause
     */
    public PaymentException(final String message, final Throwable cause) {
        super(message, cause);
        this.errorCode = "PAYMENT_ERROR";
    }

    /**
     * Constructs a new PaymentException with message, code, and cause.
     *
     * @param message the detail message
     * @param errorCode the specific error code
     * @param cause the underlying cause
     */
    public PaymentException(
            final String message,
            final String errorCode,
            final Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    /**
     * Returns the error code associated with this exception.
     *
     * @return the error code
     */
    public String getErrorCode() {
        return errorCode;
    }
}
