package org.bsa.campcard.features.troopLeader

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.models.InviteScoutRequest
import org.bsa.campcard.core.models.Scout
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaBlue
import java.util.Locale
import javax.inject.Inject

// ──────────────────────────────────────────────
// ViewModel
// ──────────────────────────────────────────────

data class ManageScoutsState(
    val isLoading: Boolean = false,
    val scouts: List<Scout> = emptyList(),
    val isInviting: Boolean = false,
    val inviteSuccess: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ManageScoutsViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _state = MutableStateFlow(ManageScoutsState())
    val state: StateFlow<ManageScoutsState> = _state.asStateFlow()

    init {
        loadScouts()
    }

    fun loadScouts() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val troop = api.getMyTroop()
                val scoutsPage = api.getTroopScouts(troopId = troop.id)
                _state.update { it.copy(isLoading = false, scouts = scoutsPage.content) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "Failed to load scouts") }
            }
        }
    }

    fun inviteScout(email: String, firstName: String, lastName: String) {
        if (email.isBlank() || firstName.isBlank() || lastName.isBlank()) return
        _state.update { it.copy(isInviting = true, error = null) }
        viewModelScope.launch {
            try {
                // troopId 0 means backend resolves from authenticated user's troop
                api.inviteScout(InviteScoutRequest(email = email, firstName = firstName, lastName = lastName, troopId = 0))
                _state.update { it.copy(isInviting = false, inviteSuccess = true) }
                loadScouts()
            } catch (e: Exception) {
                _state.update { it.copy(isInviting = false, error = e.message ?: "Failed to invite scout") }
            }
        }
    }

    fun removeScout(userId: String) {
        viewModelScope.launch {
            try {
                api.removeScout(userId)
                _state.update { prev ->
                    prev.copy(scouts = prev.scouts.filter { it.userId != userId })
                }
            } catch (e: Exception) {
                _state.update { it.copy(error = e.message ?: "Failed to remove scout") }
            }
        }
    }

    fun clearInviteSuccess() {
        _state.update { it.copy(inviteSuccess = false) }
    }
}

// ──────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ManageScoutsScreen(
    onNavigateToInvite: () -> Unit = {},
    viewModel: ManageScoutsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var showInviteDialog by remember { mutableStateOf(false) }
    var confirmRemoveScout by remember { mutableStateOf<Scout?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Manage Scouts", color = Color.White, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaBlue)
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showInviteDialog = true },
                containerColor = BsaBlue,
                contentColor = Color.White,
                icon = { Icon(Icons.Filled.PersonAdd, contentDescription = null) },
                text = { Text("Invite Scout") }
            )
        }
    ) { innerPadding ->
        when {
            state.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = BsaBlue)
                }
            }

            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (state.error != null) {
                        item {
                            Text(
                                text = state.error ?: "",
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }

                    if (state.scouts.isEmpty()) {
                        item {
                            Text(
                                text = "No scouts yet. Tap 'Invite Scout' to add one.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(top = 16.dp)
                            )
                        }
                    } else {
                        items(
                            items = state.scouts,
                            key = { it.userId }
                        ) { scout ->
                            SwipeableScoutItem(
                                scout = scout,
                                onRemove = { confirmRemoveScout = scout }
                            )
                        }
                    }
                }
            }
        }
    }

    // Invite dialog
    if (showInviteDialog) {
        InviteScoutDialog(
            isLoading = state.isInviting,
            onDismiss = { showInviteDialog = false },
            onConfirm = { email, firstName, lastName ->
                viewModel.inviteScout(email, firstName, lastName)
                showInviteDialog = false
            }
        )
    }

    // Confirm removal dialog
    confirmRemoveScout?.let { scout ->
        AlertDialog(
            onDismissRequest = { confirmRemoveScout = null },
            title = { Text("Remove Scout") },
            text = {
                Text("Remove ${scout.fullName} from your troop? This cannot be undone.")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.removeScout(scout.userId)
                        confirmRemoveScout = null
                    }
                ) {
                    Text("Remove", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { confirmRemoveScout = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SwipeableScoutItem(scout: Scout, onRemove: () -> Unit) {
    val dismissState = rememberSwipeToDismissBoxState(
        confirmValueChange = { value ->
            if (value == SwipeToDismissBoxValue.EndToStart) {
                onRemove()
                false
            } else false
        }
    )

    SwipeToDismissBox(
        state = dismissState,
        enableDismissFromStartToEnd = false,
        enableDismissFromEndToStart = true,
        backgroundContent = {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.error, RoundedCornerShape(10.dp))
                    .padding(end = 16.dp),
                contentAlignment = Alignment.CenterEnd
            ) {
                Icon(Icons.Filled.Delete, contentDescription = "Remove", tint = Color.White)
            }
        }
    ) {
        ScoutRowCard(scout = scout)
    }
}

@Composable
private fun ScoutRowCard(scout: Scout) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize(),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Initials avatar
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(BsaBlue, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "${scout.firstName.firstOrNull() ?: ""}${scout.lastName.firstOrNull() ?: ""}",
                    color = Color.White,
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = scout.fullName,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = scout.email,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                scout.rank?.let { rank ->
                    Text(
                        text = rank,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "$${String.format(Locale.US, "%.2f", scout.totalSales ?: 0.0)}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = BsaBlue
                )
                Text(
                    text = "${scout.cardsSold ?: 0} sold",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun InviteScoutDialog(
    isLoading: Boolean,
    onDismiss: () -> Unit,
    onConfirm: (email: String, firstName: String, lastName: String) -> Unit
) {
    var email by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        icon = { Icon(Icons.Filled.Add, contentDescription = null, tint = BsaBlue) },
        title = { Text("Invite Scout", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = firstName,
                    onValueChange = { firstName = it },
                    label = { Text("First Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = lastName,
                    onValueChange = { lastName = it },
                    label = { Text("Last Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onConfirm(email, firstName, lastName) },
                enabled = !isLoading && email.isNotBlank() && firstName.isNotBlank() && lastName.isNotBlank()
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                } else {
                    Text("Invite", color = BsaBlue, fontWeight = FontWeight.Bold)
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
