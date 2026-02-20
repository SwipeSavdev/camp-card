package org.bsa.campcard.core.storage

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SecureStorage @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val prefs: SharedPreferences by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            "campcard_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    var accessToken: String?
        get() = prefs.getString(KEY_ACCESS_TOKEN, null)
        set(value) = prefs.edit().apply {
            if (value != null) putString(KEY_ACCESS_TOKEN, value)
            else remove(KEY_ACCESS_TOKEN)
        }.apply()

    var refreshToken: String?
        get() = prefs.getString(KEY_REFRESH_TOKEN, null)
        set(value) = prefs.edit().apply {
            if (value != null) putString(KEY_REFRESH_TOKEN, value)
            else remove(KEY_REFRESH_TOKEN)
        }.apply()

    var biometricEmail: String?
        get() = prefs.getString(KEY_BIOMETRIC_EMAIL, null)
        set(value) = prefs.edit().apply {
            if (value != null) putString(KEY_BIOMETRIC_EMAIL, value)
            else remove(KEY_BIOMETRIC_EMAIL)
        }.apply()

    var biometricRefreshToken: String?
        get() = prefs.getString(KEY_BIOMETRIC_REFRESH_TOKEN, null)
        set(value) = prefs.edit().apply {
            if (value != null) putString(KEY_BIOMETRIC_REFRESH_TOKEN, value)
            else remove(KEY_BIOMETRIC_REFRESH_TOKEN)
        }.apply()

    /** Set to true once the user completes account creation post-purchase. */
    var accountCreated: Boolean
        get() = prefs.getBoolean(KEY_ACCOUNT_CREATED, false)
        set(value) = prefs.edit().putBoolean(KEY_ACCOUNT_CREATED, value).apply()

    /** Product ID of an IAP completed before account creation; survives app restarts. */
    var pendingPurchaseProductId: String?
        get() = prefs.getString(KEY_PENDING_PURCHASE_PRODUCT_ID, null)
        set(value) = prefs.edit().apply {
            if (value != null) putString(KEY_PENDING_PURCHASE_PRODUCT_ID, value)
            else remove(KEY_PENDING_PURCHASE_PRODUCT_ID)
        }.apply()

    fun storeTokens(access: String, refresh: String) {
        prefs.edit()
            .putString(KEY_ACCESS_TOKEN, access)
            .putString(KEY_REFRESH_TOKEN, refresh)
            .apply()
    }

    fun storeBiometricCredentials(email: String, refreshToken: String) {
        prefs.edit()
            .putString(KEY_BIOMETRIC_EMAIL, email)
            .putString(KEY_BIOMETRIC_REFRESH_TOKEN, refreshToken)
            .apply()
    }

    fun clearAll() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_BIOMETRIC_EMAIL = "biometric_email"
        private const val KEY_BIOMETRIC_REFRESH_TOKEN = "biometric_refresh_token"
        private const val KEY_ACCOUNT_CREATED = "account_created"
        private const val KEY_PENDING_PURCHASE_PRODUCT_ID = "pending_purchase_product_id"
    }
}
