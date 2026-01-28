package com.bsa.campcard.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a requested resource is not found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new ResourceNotFoundException with the specified message.
     *
     * @param message the detail message
     */
    public ResourceNotFoundException(final String message) {
        super(message);
    }

    /**
     * Constructs a new ResourceNotFoundException for a specific resource.
     *
     * @param resourceName the name of the resource type
     * @param fieldName the name of the field used to search
     * @param fieldValue the value that was not found
     */
    public ResourceNotFoundException(
            final String resourceName,
            final String fieldName,
            final Object fieldValue) {
        super(String.format(
                "%s not found with %s: '%s'",
                resourceName,
                fieldName,
                fieldValue));
    }
}
