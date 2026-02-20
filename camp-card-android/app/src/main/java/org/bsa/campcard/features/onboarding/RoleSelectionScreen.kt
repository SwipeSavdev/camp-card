package org.bsa.campcard.features.onboarding

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.bsa.campcard.ui.theme.BsaAmber
import org.bsa.campcard.ui.theme.BsaBlue
import org.bsa.campcard.ui.theme.BsaRed

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

enum class OnboardingRole(
    val key: String,
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val color: Color
) {
    SCOUT(
        key = "SCOUT",
        title = "Scout",
        subtitle = "Sell camp cards to earn funds for your troop",
        icon = Icons.Default.Star,
        color = BsaRed
    ),
    TROOP_LEADER(
        key = "TROOP_LEADER",
        title = "Troop / Unit Leader",
        subtitle = "Manage your unit's fundraising campaign",
        icon = Icons.Default.Person,
        color = BsaBlue
    ),
    PARENT(
        key = "PARENT",
        title = "Parent or Supporter",
        subtitle = "Support a scout's fundraising efforts",
        icon = Icons.Default.Favorite,
        color = BsaAmber
    )
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoleSelectionScreen(
    onRoleSelected: (roleKey: String) -> Unit,
    onNavigateBack: () -> Unit
) {
    var selected by remember { mutableStateOf<OnboardingRole?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Get Started") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = androidx.compose.material.icons.Icons.Default.Person,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Who are you?",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Choose your role to see the right plan.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(28.dp))

            OnboardingRole.entries.forEach { role ->
                RoleCard(
                    role = role,
                    isSelected = selected == role,
                    onTap = { selected = role }
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = { selected?.let { onRoleSelected(it.key) } },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                enabled = selected != null,
                colors = ButtonDefaults.buttonColors(containerColor = BsaRed)
            ) {
                Text(
                    text = if (selected != null) "Continue as ${selected!!.title}" else "Select a Role",
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

// ---------------------------------------------------------------------------
// Role Card
// ---------------------------------------------------------------------------

@Composable
private fun RoleCard(
    role: OnboardingRole,
    isSelected: Boolean,
    onTap: () -> Unit
) {
    Card(
        onClick = onTap,
        modifier = Modifier
            .fillMaxWidth()
            .semantics {
                this.role = Role.RadioButton
                this.selected = isSelected
            },
        border = BorderStroke(
            width = if (isSelected) 2.dp else 1.dp,
            color = if (isSelected) role.color else MaterialTheme.colorScheme.outlineVariant
        ),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected)
                role.color.copy(alpha = 0.06f)
            else
                MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = role.color.copy(alpha = if (isSelected) 1f else 0.12f),
                modifier = Modifier.size(52.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = role.icon,
                        contentDescription = null,
                        tint = if (isSelected) Color.White else role.color,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = role.title,
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold)
                )
                Text(
                    text = role.subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            RadioButton(
                selected = isSelected,
                onClick = null,
                colors = RadioButtonDefaults.colors(selectedColor = role.color)
            )
        }
    }
}
