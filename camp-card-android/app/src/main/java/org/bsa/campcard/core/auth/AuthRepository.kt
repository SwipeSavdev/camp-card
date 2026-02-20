package org.bsa.campcard.core.auth

import org.bsa.campcard.core.models.*
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.core.storage.SecureStorage
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: CampCardApi,
    private val secureStorage: SecureStorage
) {
    suspend fun login(email: String, password: String): AuthResponse {
        val resp = api.login(LoginRequest(email, password))
        secureStorage.storeTokens(resp.accessToken, resp.refreshToken)
        return resp
    }

    suspend fun register(request: RegisterRequest): AuthResponse {
        val resp = api.register(request)
        secureStorage.storeTokens(resp.accessToken, resp.refreshToken)
        return resp
    }

    suspend fun refresh(refreshToken: String): AuthResponse {
        val resp = api.refresh(RefreshTokenRequest(refreshToken))
        secureStorage.storeTokens(resp.accessToken, resp.refreshToken)
        return resp
    }

    suspend fun logout() {
        try { api.logout() } catch (_: Exception) {}
        secureStorage.clearAll()
    }

    suspend fun me(): User = api.me()

    suspend fun forgotPassword(email: String) = api.forgotPassword(ForgotPasswordRequest(email))

    suspend fun resetPassword(token: String, password: String) =
        api.resetPassword(ResetPasswordRequest(token, password))

    fun isLoggedIn(): Boolean = secureStorage.accessToken != null

    fun storeBiometricCredentials(email: String, refreshToken: String) =
        secureStorage.storeBiometricCredentials(email, refreshToken)

    val biometricRefreshToken: String? get() = secureStorage.biometricRefreshToken
    val biometricEmail: String? get() = secureStorage.biometricEmail
}
