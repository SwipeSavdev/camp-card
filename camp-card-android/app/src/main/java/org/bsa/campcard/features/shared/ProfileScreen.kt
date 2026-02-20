package org.bsa.campcard.features.shared

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Policy
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.core.models.UserRole
import org.bsa.campcard.ui.theme.BsaBlue
import org.bsa.campcard.ui.theme.BsaGold

// ──────────────────────────────────────────────
// Data models for menu items
// ──────────────────────────────────────────────

private data class ProfileMenuItem(
    val icon: ImageVector,
    val label: String,
    val onClick: () -> Unit,
    val isDestructive: Boolean = false
)

// ──────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    authViewModel: AuthViewModel,
    onNavigateToEditProfile: () -> Unit = {},
    onNavigateToChangePassword: () -> Unit = {},
    onNavigateToSubscription: () -> Unit = {},
    onNavigateToMyQrCode: () -> Unit = {},
    onNavigateToReferrals: () -> Unit = {},
    onNavigateToNotifications: () -> Unit = {},
    onNavigateToPrivacyPolicy: () -> Unit = {},
    onNavigateToTerms: () -> Unit = {}
) {
    val authState by authViewModel.state.collectAsState()
    val user = authState.user
    var showSignOutDialog by remember { mutableStateOf(false) }

    val userRole = user?.userRole ?: UserRole.PARENT
    val showQrCode = userRole == UserRole.SCOUT || userRole == UserRole.PARENT
    val showReferrals = userRole == UserRole.SCOUT || userRole == UserRole.PARENT

    val menuItems = buildList {
        add(
            ProfileMenuItem(
                icon = Icons.Filled.Person,
                label = "Edit Profile",
                onClick = onNavigateToEditProfile
            )
        )
        add(
            ProfileMenuItem(
                icon = Icons.Filled.Lock,
                label = "Change Password",
                onClick = onNavigateToChangePassword
            )
        )
        add(
            ProfileMenuItem(
                icon = Icons.Filled.Star,
                label = "Subscription",
                onClick = onNavigateToSubscription
            )
        )
        if (showQrCode) {
            add(
                ProfileMenuItem(
                    icon = Icons.Filled.QrCode,
                    label = "My QR Code",
                    onClick = onNavigateToMyQrCode
                )
            )
        }
        if (showReferrals) {
            add(
                ProfileMenuItem(
                    icon = Icons.Filled.Share,
                    label = "Referrals",
                    onClick = onNavigateToReferrals
                )
            )
        }
        add(
            ProfileMenuItem(
                icon = Icons.Filled.Notifications,
                label = "Notifications",
                onClick = onNavigateToNotifications
            )
        )
        add(
            ProfileMenuItem(
                icon = Icons.Filled.Policy,
                label = "Privacy Policy",
                onClick = onNavigateToPrivacyPolicy
            )
        )
        add(
            ProfileMenuItem(
                icon = Icons.Filled.Description,
                label = "Terms of Service",
                onClick = onNavigateToTerms
            )
        )
        add(
            ProfileMenuItem(
                icon = Icons.AutoMirrored.Filled.ExitToApp,
                label = "Sign Out",
                onClick = { showSignOutDialog = true },
                isDestructive = true
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Profile", color = Color.White, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaBlue)
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // Avatar + user info
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Initials circle
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(BsaBlue, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    val initials = buildString {
                        user?.firstName?.firstOrNull()?.let { append(it) }
                        user?.lastName?.firstOrNull()?.let { append(it) }
                    }.uppercase()
                    if (initials.isNotEmpty()) {
                        Text(
                            text = initials,
                            style = MaterialTheme.typography.headlineMedium,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    } else {
                        Icon(
                            Icons.Filled.Person,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = user?.fullName ?: "User",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Text(
                    text = user?.email ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                )

                // Role badge
                Spacer(modifier = Modifier.height(8.dp))
                RoleBadge(role = userRole)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Menu items card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column {
                    menuItems.forEachIndexed { index, item ->
                        ProfileMenuRow(item = item)
                        if (index < menuItems.lastIndex) {
                            // No divider before "Sign Out" group
                            if (!item.isDestructive && !menuItems[index + 1].isDestructive) {
                                HorizontalDivider(
                                    modifier = Modifier.padding(horizontal = 16.dp),
                                    color = MaterialTheme.colorScheme.outlineVariant
                                )
                            } else if (!item.isDestructive && menuItems[index + 1].isDestructive) {
                                HorizontalDivider(
                                    modifier = Modifier.padding(horizontal = 16.dp),
                                    color = MaterialTheme.colorScheme.outlineVariant
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }

    // Sign out confirmation dialog
    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            icon = { Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Sign Out", fontWeight = FontWeight.Bold) },
            text = { Text("Are you sure you want to sign out?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        authViewModel.logout()
                        showSignOutDialog = false
                    }
                ) {
                    Text("Sign Out", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSignOutDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun RoleBadge(role: UserRole) {
    val (label, bgColor) = when (role) {
        UserRole.SCOUT -> Pair("Scout", BsaBlue)
        UserRole.TROOP_LEADER -> Pair("Troop Leader", BsaBlue)
        UserRole.PARENT -> Pair("Parent", BsaBlue)
        UserRole.COUNCIL_ADMIN -> Pair("Council Admin", BsaGold)
        UserRole.NATIONAL_ADMIN -> Pair("National Admin", BsaGold)
    }

    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = Color.White,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
        )
    }
}

@Composable
private fun ProfileMenuRow(item: ProfileMenuItem) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { item.onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Icon(
            imageVector = item.icon,
            contentDescription = null,
            tint = if (item.isDestructive) MaterialTheme.colorScheme.error else BsaBlue,
            modifier = Modifier.size(22.dp)
        )
        Text(
            text = item.label,
            style = MaterialTheme.typography.bodyMedium,
            color = if (item.isDestructive) MaterialTheme.colorScheme.error
            else MaterialTheme.colorScheme.onSurface,
            fontWeight = if (item.isDestructive) FontWeight.Medium else FontWeight.Normal,
            modifier = Modifier.weight(1f)
        )
        if (!item.isDestructive) {
            Icon(
                Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
