package org.bsa.campcard.features.shared

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.HelpOutline
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.bsa.campcard.BuildConfig
import org.bsa.campcard.ui.theme.BsaBlue

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToEditProfile: () -> Unit = {},
    onNavigateToChangePassword: () -> Unit = {},
    onNavigateToSubscription: () -> Unit = {},
    onNavigateToPrivacyPolicy: () -> Unit = {},
    onNavigateToTerms: () -> Unit = {},
    onNavigateToHelp: () -> Unit = {},
    onDeleteAccount: () -> Unit = {}
) {
    val context = LocalContext.current
    var showDeleteDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BsaBlue)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 32.dp)
        ) {
            // ACCOUNT section
            SettingsSectionHeader("Account")
            SettingsItem(
                icon = Icons.Default.Person,
                label = "Edit Profile",
                onClick = onNavigateToEditProfile
            )
            SettingsDivider()
            SettingsItem(
                icon = Icons.Default.Lock,
                label = "Change Password",
                onClick = onNavigateToChangePassword
            )

            Spacer(Modifier.height(8.dp))

            // SUBSCRIPTION section
            SettingsSectionHeader("Subscription")
            SettingsItem(
                icon = Icons.Default.Star,
                label = "Manage Subscription",
                onClick = onNavigateToSubscription
            )

            Spacer(Modifier.height(8.dp))

            // NOTIFICATIONS section
            SettingsSectionHeader("Notifications")
            SettingsItem(
                icon = Icons.Default.Notifications,
                label = "Notification Settings",
                onClick = {
                    val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                    }
                    context.startActivity(intent)
                }
            )

            Spacer(Modifier.height(8.dp))

            // LEGAL section
            SettingsSectionHeader("Legal & Support")
            SettingsItem(
                icon = Icons.Default.Policy,
                label = "Privacy Policy",
                onClick = onNavigateToPrivacyPolicy
            )
            SettingsDivider()
            SettingsItem(
                icon = Icons.Default.Description,
                label = "Terms of Service",
                onClick = onNavigateToTerms
            )
            SettingsDivider()
            SettingsItem(
                icon = Icons.AutoMirrored.Filled.HelpOutline,
                label = "Help & Support",
                onClick = onNavigateToHelp
            )
            SettingsDivider()
            SettingsItem(
                icon = Icons.Default.BugReport,
                label = "Report a Problem",
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.campcardapp.org/support"))
                    context.startActivity(intent)
                }
            )

            Spacer(Modifier.height(8.dp))

            // ABOUT section
            SettingsSectionHeader("About")
            SettingsInfoRow(label = "Version", value = "${BuildConfig.APP_VERSION} (${BuildConfig.VERSION_CODE})")

            Spacer(Modifier.height(16.dp))

            // DANGER ZONE
            SettingsSectionHeader("Account Actions")
            SettingsItem(
                icon = Icons.Default.DeleteForever,
                label = "Delete Account",
                onClick = { showDeleteDialog = true },
                isDestructive = true
            )
        }
    }

    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            icon = {
                Icon(Icons.Default.DeleteForever, null, tint = MaterialTheme.colorScheme.error)
            },
            title = { Text("Delete Account", fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "This action is permanent and cannot be undone. All your data, cards, and history will be deleted.",
                    style = MaterialTheme.typography.bodyMedium
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDeleteDialog = false
                        onDeleteAccount()
                    }
                ) {
                    Text("Delete", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun SettingsSectionHeader(title: String) {
    Text(
        text = title.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(start = 20.dp, top = 20.dp, bottom = 6.dp)
    )
}

@Composable
private fun SettingsItem(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit,
    isDestructive: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 14.dp)
            .semantics {
                contentDescription = label
                role = Role.Button
            },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Icon(
            icon,
            null,
            tint = if (isDestructive) MaterialTheme.colorScheme.error else BsaBlue,
            modifier = Modifier.size(22.dp)
        )
        Text(
            label,
            style = MaterialTheme.typography.bodyMedium,
            color = if (isDestructive) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1f)
        )
        if (!isDestructive) {
            Icon(
                Icons.Default.ChevronRight,
                null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun SettingsInfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            Icons.Default.Info,
            null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(22.dp)
        )
        Spacer(Modifier.width(14.dp))
        Text(
            label,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f)
        )
        Text(
            value,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun SettingsDivider() {
    HorizontalDivider(
        modifier = Modifier.padding(horizontal = 20.dp),
        color = MaterialTheme.colorScheme.outlineVariant
    )
}
