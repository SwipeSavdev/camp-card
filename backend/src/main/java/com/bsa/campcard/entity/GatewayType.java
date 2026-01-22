package com.bsa.campcard.entity;

/**
 * Supported payment gateway types.
 * Currently only Authorize.net is supported, but this enum allows for future expansion.
 */
public enum GatewayType {
    AUTHORIZE_NET("Authorize.net");

    private final String displayName;

    GatewayType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
