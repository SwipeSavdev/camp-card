package org.bsa.campcard.core.network

import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import org.bsa.campcard.core.models.RefreshTokenRequest
import org.bsa.campcard.core.storage.SecureStorage
import javax.inject.Inject
import javax.inject.Provider
import javax.inject.Singleton

/**
 * Attaches the Bearer access token to every request (except auth endpoints).
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val secureStorage: SecureStorage
) : Interceptor {

    private val skipPaths = setOf(
        "auth/login", "auth/register", "auth/forgot-password",
        "auth/reset-password", "auth/refresh", "auth/verify-email",
        "public/health"
    )

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val path = request.url.encodedPath

        // Skip auth header for auth endpoints
        if (skipPaths.any { path.contains(it) }) {
            return chain.proceed(request)
        }

        val token = secureStorage.accessToken
        return if (token != null) {
            chain.proceed(request.withBearerToken(token))
        } else {
            chain.proceed(request)
        }
    }
}

/**
 * Handles 401 responses by refreshing the token and replaying the original request.
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val secureStorage: SecureStorage,
    private val apiProvider: Provider<CampCardApi>
) : Authenticator {

    @Volatile
    private var isRefreshing = false

    override fun authenticate(route: Route?, response: Response): Request? {
        // Avoid infinite refresh loops
        if (response.request.header("X-Retry-After-Refresh") != null) return null

        val refreshToken = secureStorage.refreshToken ?: return null

        synchronized(this) {
            // Double-check: another thread may have already refreshed
            val newToken = secureStorage.accessToken
            if (newToken != null && response.request.header("Authorization") != "Bearer $newToken") {
                return response.request.withBearerToken(newToken)
            }

            return try {
                val refreshed = runBlocking {
                    apiProvider.get().refresh(RefreshTokenRequest(refreshToken))
                }
                secureStorage.storeTokens(refreshed.accessToken, refreshed.refreshToken)
                response.request
                    .withBearerToken(refreshed.accessToken)
                    .newBuilder()
                    .header("X-Retry-After-Refresh", "true")
                    .build()
            } catch (e: Exception) {
                secureStorage.clearAll()
                null // Signal caller to logout
            }
        }
    }
}

private fun Request.withBearerToken(token: String): Request =
    newBuilder().header("Authorization", "Bearer $token").build()
