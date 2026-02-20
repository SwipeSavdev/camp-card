package org.bsa.campcard.features.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.core.models.UpdateProfileRequest
import org.bsa.campcard.core.network.CampCardApi
import androidx.compose.material3.MaterialTheme
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import javax.inject.Inject

data class EditProfileState(
    val firstName: String = "",
    val lastName: String = "",
    val email: String = "",
    val isLoading: Boolean = false,
    val success: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class EditProfileViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _state = MutableStateFlow(EditProfileState())
    val state = _state.asStateFlow()

    fun initWithUser(firstName: String, lastName: String, email: String) {
        _state.value = _state.value.copy(firstName = firstName, lastName = lastName, email = email)
    }

    fun setFirstName(value: String) { _state.value = _state.value.copy(firstName = value) }
    fun setLastName(value: String) { _state.value = _state.value.copy(lastName = value) }

    fun save(onSuccess: () -> Unit) {
        _state.value = _state.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            try {
                val updated = api.updateProfile(
                    UpdateProfileRequest(
                        firstName = _state.value.firstName.trim(),
                        lastName = _state.value.lastName.trim()
                    )
                )
                _state.value = _state.value.copy(isLoading = false, success = true)
                onSuccess()
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    authViewModel: AuthViewModel,
    onNavigateBack: () -> Unit,
    viewModel: EditProfileViewModel = hiltViewModel()
) {
    val authState by authViewModel.state.collectAsState()
    val state by viewModel.state.collectAsState()

    LaunchedEffect(authState.user) {
        authState.user?.let { user ->
            viewModel.initWithUser(user.firstName, user.lastName, user.email)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Profile") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary, titleContentColor = Color.White, navigationIconContentColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = state.firstName,
                onValueChange = viewModel::setFirstName,
                label = { Text("First Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = state.lastName,
                onValueChange = viewModel::setLastName,
                label = { Text("Last Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
            OutlinedTextField(
                value = state.email,
                onValueChange = {},
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                enabled = false,
                singleLine = true
            )

            state.error?.let { error ->
                Text(error, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }

            Button(
                onClick = { viewModel.save { onNavigateBack() } },
                modifier = Modifier.fillMaxWidth(),
                enabled = !state.isLoading && state.firstName.isNotBlank() && state.lastName.isNotBlank(),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                if (state.isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text("Save Changes")
                }
            }
        }
    }
}

// ChangePasswordScreen

@HiltViewModel
class ChangePasswordViewModel @Inject constructor(private val api: CampCardApi) : ViewModel() {
    private val _state = MutableStateFlow<Triple<Boolean, Boolean, String?>>(Triple(false, false, null))
    val state = _state.asStateFlow() // (isLoading, success, error)

    fun changePassword(current: String, newPass: String, onSuccess: () -> Unit) {
        _state.value = Triple(true, false, null)
        viewModelScope.launch {
            try {
                api.changePassword(org.bsa.campcard.core.models.ChangePasswordRequest(current, newPass))
                _state.value = Triple(false, true, null)
                onSuccess()
            } catch (e: Exception) {
                _state.value = Triple(false, false, e.message)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChangePasswordScreen(
    onNavigateBack: () -> Unit,
    viewModel: ChangePasswordViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    val isLoading = state.first
    val error = state.third

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Change Password") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.primary, titleContentColor = Color.White, navigationIconContentColor = Color.White)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = currentPassword,
                onValueChange = { currentPassword = it },
                label = { Text("Current Password") },
                visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = newPassword,
                onValueChange = { newPassword = it },
                label = { Text("New Password (min 8 chars)") },
                visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                label = { Text("Confirm New Password") },
                visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth()
            )

            if (confirmPassword.isNotEmpty() && newPassword != confirmPassword) {
                Text("Passwords do not match", color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }
            error?.let { Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }

            Button(
                onClick = { viewModel.changePassword(currentPassword, newPassword) { onNavigateBack() } },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading && currentPassword.isNotEmpty() && newPassword.length >= 8 && newPassword == confirmPassword,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                if (isLoading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                else Text("Change Password")
            }
        }
    }
}
