package org.bsa.campcard.core.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.BuildConfig
import org.bsa.campcard.core.models.User
import org.bsa.campcard.core.models.RegisterRequest
import javax.inject.Inject

data class AuthState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val user: User? = null,
    val error: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow(AuthState())
    val state: StateFlow<AuthState> = _state.asStateFlow()

    init {
        initialize()
    }

    private fun initialize() {
        if (BuildConfig.DEBUG && !authRepository.isLoggedIn()) {
            // Debug auto-login with demo account (mirrors iOS screenshot mode)
            viewModelScope.launch {
                try {
                    val resp = authRepository.login("demo@campcard.org", "Password123")
                    _state.update { it.copy(isLoading = false, isAuthenticated = true, user = resp.user) }
                } catch (_: Exception) {}
            }
            return
        }
        if (!authRepository.isLoggedIn()) return
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            try {
                val user = authRepository.me()
                _state.update { it.copy(isLoading = false, isAuthenticated = true, user = user) }
            } catch (e: Exception) {
                authRepository.logout()
                _state.update { AuthState() }
            }
        }
    }

    fun login(email: String, password: String) {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val resp = authRepository.login(email, password)
                authRepository.storeBiometricCredentials(email, resp.refreshToken)
                _state.update { it.copy(isLoading = false, isAuthenticated = true, user = resp.user) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "Login failed") }
            }
        }
    }

    fun register(request: RegisterRequest) {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val resp = authRepository.register(request)
                _state.update { it.copy(isLoading = false, isAuthenticated = true, user = resp.user) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "Registration failed") }
            }
        }
    }

    fun loginWithBiometric(refreshToken: String) {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val resp = authRepository.refresh(refreshToken)
                _state.update { it.copy(isLoading = false, isAuthenticated = true, user = resp.user) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = "Biometric login failed") }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _state.update { AuthState() }
        }
    }

    fun updateUser(user: User) {
        _state.update { it.copy(user = user) }
    }

    fun clearError() {
        _state.update { it.copy(error = null) }
    }

    val biometricRefreshToken: String? get() = authRepository.biometricRefreshToken
    val hasBiometricCredentials: Boolean get() = authRepository.biometricRefreshToken != null
}
