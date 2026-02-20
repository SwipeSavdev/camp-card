package org.bsa.campcard.features.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.core.models.RegisterRequest
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.core.storage.SecureStorage
import org.bsa.campcard.features.iap.BillingService
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

// ---------------------------------------------------------------------------
// ViewModel
// ---------------------------------------------------------------------------

data class AccountCreationUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false
)

@HiltViewModel
class AccountCreationViewModel @Inject constructor(
    private val api: CampCardApi,
    private val secureStorage: SecureStorage,
    private val billingService: BillingService
) : ViewModel() {

    private val _uiState = MutableStateFlow(AccountCreationUiState())
    val uiState = _uiState.asStateFlow()

    fun register(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        role: String,
        authViewModel: AuthViewModel
    ) {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val resp = api.register(
                    RegisterRequest(
                        email = email.trim().lowercase(),
                        password = password,
                        firstName = firstName.trim(),
                        lastName = lastName.trim(),
                        role = role
                    )
                )
                // Persist tokens
                secureStorage.storeTokens(resp.accessToken, resp.refreshToken)
                secureStorage.accountCreated = true
                secureStorage.pendingPurchaseProductId = null
                // Clear BillingService publisher
                billingService.clearPostPurchaseProductId()
                // Update shared auth state → AppNavHost routes to home
                authViewModel.updateUser(resp.user)
                _uiState.update { it.copy(isLoading = false, success = true) }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(isLoading = false, error = e.message ?: "Registration failed")
                }
            }
        }
    }

    fun clearError() { _uiState.update { it.copy(error = null) } }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountCreationScreen(
    preselectedRole: String,
    pendingProductId: String,
    authViewModel: AuthViewModel,
    onNavigateToLogin: () -> Unit,
    viewModel: AccountCreationViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    val isValid = firstName.isNotBlank() && lastName.isNotBlank() &&
            email.contains("@") && password.length >= 8 &&
            password == confirmPassword

    // Show error in snackbar
    LaunchedEffect(uiState.error) {
        uiState.error?.let { err ->
            scope.launch {
                snackbarHostState.showSnackbar(err, duration = SnackbarDuration.Short)
                viewModel.clearError()
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(title = { Text("Create Account") })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Purchase confirmed banner
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF4CAF50))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("✓", color = Color.White, style = MaterialTheme.typography.titleLarge)
                Column {
                    Text(
                        "Purchase Confirmed!",
                        color = Color.White,
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold)
                    )
                    Text(
                        "Create your free account to access your cards.",
                        color = Color.White.copy(alpha = 0.9f),
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }

            Column(
                modifier = Modifier.padding(horizontal = 24.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    "Create Your Account",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold)
                )

                // Name row
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = firstName,
                        onValueChange = { firstName = it },
                        label = { Text("First Name") },
                        leadingIcon = { Icon(Icons.Default.Person, null) },
                        singleLine = true,
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                        keyboardActions = KeyboardActions(
                            onNext = { focusManager.moveFocus(FocusDirection.Right) }
                        ),
                        enabled = !uiState.isLoading
                    )
                    OutlinedTextField(
                        value = lastName,
                        onValueChange = { lastName = it },
                        label = { Text("Last Name") },
                        singleLine = true,
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                        keyboardActions = KeyboardActions(
                            onNext = { focusManager.moveFocus(FocusDirection.Down) }
                        ),
                        enabled = !uiState.isLoading
                    )
                }

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address") },
                    leadingIcon = { Icon(Icons.Default.Email, null) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    ),
                    enabled = !uiState.isLoading
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password (min 8 characters)") },
                    leadingIcon = { Icon(Icons.Default.Lock, null) },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                if (passwordVisible) "Hide password" else "Show password"
                            )
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None
                                          else PasswordVisualTransformation(),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Next
                    ),
                    keyboardActions = KeyboardActions(
                        onNext = { focusManager.moveFocus(FocusDirection.Down) }
                    ),
                    enabled = !uiState.isLoading
                )

                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label = { Text("Confirm Password") },
                    leadingIcon = { Icon(Icons.Default.Lock, null) },
                    visualTransformation = if (passwordVisible) VisualTransformation.None
                                          else PasswordVisualTransformation(),
                    singleLine = true,
                    isError = confirmPassword.isNotEmpty() && password != confirmPassword,
                    supportingText = {
                        if (confirmPassword.isNotEmpty() && password != confirmPassword) {
                            Text("Passwords do not match", color = MaterialTheme.colorScheme.error)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = { focusManager.clearFocus() }
                    ),
                    enabled = !uiState.isLoading
                )

                // Role display (read-only)
                OutlinedTextField(
                    value = preselectedRole.replace("_", " ").lowercase()
                        .replaceFirstChar { it.uppercase() },
                    onValueChange = {},
                    label = { Text("Account Role") },
                    readOnly = true,
                    modifier = Modifier.fillMaxWidth(),
                    enabled = false
                )

                Spacer(modifier = Modifier.height(4.dp))

                Button(
                    onClick = {
                        focusManager.clearFocus()
                        viewModel.register(firstName, lastName, email, password, preselectedRole, authViewModel)
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    enabled = isValid && !uiState.isLoading,
                    colors = ButtonDefaults.buttonColors(containerColor = BsaRed)
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text("Create Account", fontWeight = FontWeight.SemiBold)
                    }
                }

                HorizontalDivider()

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Already have an account?",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    TextButton(onClick = onNavigateToLogin, enabled = !uiState.isLoading) {
                        Text("Sign In Instead", color = BsaRed, fontWeight = FontWeight.SemiBold)
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}
