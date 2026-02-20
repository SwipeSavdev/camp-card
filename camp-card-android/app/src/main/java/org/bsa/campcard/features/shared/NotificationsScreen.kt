package org.bsa.campcard.features.shared

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
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
import org.bsa.campcard.core.models.AppNotification
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.components.SkeletonNotificationRow
import org.bsa.campcard.ui.theme.BsaBlue
import org.bsa.campcard.ui.theme.BsaGold
import javax.inject.Inject

// ──────────────────────────────────────────────
// ViewModel
// ──────────────────────────────────────────────

data class NotificationsState(
    val isLoading: Boolean = false,
    val notifications: List<AppNotification> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _state = MutableStateFlow(NotificationsState())
    val state: StateFlow<NotificationsState> = _state.asStateFlow()

    init {
        loadNotifications()
    }

    fun loadNotifications() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val notifications = api.getNotifications(size = 50).content
                _state.update { it.copy(isLoading = false, notifications = notifications) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "Failed to load notifications") }
            }
        }
    }

    fun markRead(notificationId: Int) {
        viewModelScope.launch {
            try {
                api.markNotificationRead(notificationId)
                _state.update { current ->
                    current.copy(
                        notifications = current.notifications.map { notification ->
                            if (notification.id == notificationId) notification.copy(isRead = true)
                            else notification
                        }
                    )
                }
            } catch (e: Exception) {
                // Silently ignore read errors
            }
        }
    }

    fun markAllRead() {
        viewModelScope.launch {
            try {
                api.markAllNotificationsRead()
                _state.update { current ->
                    current.copy(
                        notifications = current.notifications.map { it.copy(isRead = true) }
                    )
                }
            } catch (e: Exception) {
                _state.update { it.copy(error = e.message ?: "Failed to mark all read") }
            }
        }
    }
}

// ──────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    viewModel: NotificationsViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    val unreadCount = state.notifications.count { !it.isRead }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Notifications", color = Color.White, fontWeight = FontWeight.Bold)
                        if (unreadCount > 0) {
                            Text(
                                text = "$unreadCount unread",
                                style = MaterialTheme.typography.labelSmall,
                                color = BsaGold
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaBlue),
                actions = {
                    if (unreadCount > 0) {
                        IconButton(onClick = { viewModel.markAllRead() }) {
                            Icon(
                                Icons.Filled.DoneAll,
                                contentDescription = "Mark all read",
                                tint = Color.White
                            )
                        }
                    }
                }
            )
        }
    ) { innerPadding ->
        when {
            state.isLoading -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    items(count = 8) {
                        SkeletonNotificationRow()
                    }
                }
            }

            state.notifications.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Filled.Notifications,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(64.dp)
                        )
                        Text(
                            text = "No notifications yet",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 12.dp)
                        )
                    }
                }
            }

            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentPadding = PaddingValues(vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    items(state.notifications, key = { it.id }) { notification ->
                        NotificationRow(
                            notification = notification,
                            onTap = {
                                if (!notification.isRead) {
                                    viewModel.markRead(notification.id)
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationRow(
    notification: AppNotification,
    onTap: () -> Unit
) {
    val isUnread = !notification.isRead

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onTap() }
            .background(
                if (isUnread) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                else Color.Transparent
            )
            .padding(0.dp)
    ) {
        // Left colored border for unread
        if (isUnread) {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .fillMaxHeight()
                    .background(BsaBlue)
            )
        } else {
            Spacer(modifier = Modifier.width(4.dp))
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(
                    text = notification.title,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = if (isUnread) FontWeight.Bold else FontWeight.Normal,
                    color = if (isUnread) MaterialTheme.colorScheme.onSurface
                    else MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                if (isUnread) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(BsaBlue, shape = RoundedCornerShape(4.dp))
                    )
                }
            }
            Text(
                text = notification.body,
                style = MaterialTheme.typography.bodySmall,
                color = if (isUnread) MaterialTheme.colorScheme.onSurface
                else MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = if (isUnread) FontWeight.Medium else FontWeight.Normal,
                modifier = Modifier.padding(top = 2.dp),
                maxLines = 3
            )
            // Timestamp (formatted first 10 chars of ISO date)
            Text(
                text = notification.createdAt.take(10),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}
