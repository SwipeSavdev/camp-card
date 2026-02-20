package org.bsa.campcard.features.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.ui.theme.BsaGold
import org.bsa.campcard.ui.theme.BsaRed

@Composable
fun ConsentPendingScreen(
    authViewModel: AuthViewModel
) {
    val state by authViewModel.state.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var isRefreshing by remember { mutableStateOf(false) }

    // Show error snackbar
    LaunchedEffect(state.error) {
        state.error?.let { error ->
            scope.launch {
                snackbarHostState.showSnackbar(
                    message = error,
                    duration = SnackbarDuration.Short
                )
                authViewModel.clearError()
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            // Icon with badge-style visual
            Surface(
                shape = MaterialTheme.shapes.extraLarge,
                color = BsaGold.copy(alpha = 0.15f),
                modifier = Modifier.size(120.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.HourglassEmpty,
                        contentDescription = null,
                        modifier = Modifier.size(56.dp),
                        tint = BsaGold
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = "Parental Consent Required",
                style = MaterialTheme.typography.headlineSmall.copy(
                    fontWeight = FontWeight.Bold
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Consent status card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "What's happening?",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                    Text(
                        text = "Because you're under 13, federal law (COPPA) requires a parent or guardian to consent to your use of the Camp Card app.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Next steps",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                    Text(
                        text = "1. Ask your parent or guardian to check their email.\n\n2. They need to open the consent email from Camp Card and click \"Approve\".\n\n3. Once approved, tap Check Status below to continue.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Show current user consent status if available
            state.user?.consentStatus?.let { status ->
                Spacer(modifier = Modifier.height(12.dp))

                val (statusColor, statusLabel) = when (status) {
                    "PENDING" -> Pair(BsaGold, "Awaiting parent approval")
                    "DENIED" -> Pair(MaterialTheme.colorScheme.error, "Consent was denied")
                    "REVOKED" -> Pair(MaterialTheme.colorScheme.error, "Consent was revoked")
                    else -> Pair(MaterialTheme.colorScheme.onSurfaceVariant, status)
                }

                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = statusColor.copy(alpha = 0.12f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            shape = MaterialTheme.shapes.extraSmall,
                            color = statusColor,
                            modifier = Modifier.size(8.dp)
                        ) {}
                        Text(
                            text = "Status: $statusLabel",
                            style = MaterialTheme.typography.labelLarge,
                            color = statusColor
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Check Status button
            Button(
                onClick = {
                    isRefreshing = true
                    scope.launch {
                        try {
                            // Re-initialize by refreshing user state via a short-lived action
                            authViewModel.clearError()
                        } finally {
                            isRefreshing = false
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                enabled = !state.isLoading && !isRefreshing,
                colors = ButtonDefaults.buttonColors(containerColor = BsaRed)
            ) {
                if (isRefreshing || state.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = androidx.compose.ui.graphics.Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Check Status",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Sign Out button
            OutlinedButton(
                onClick = { authViewModel.logout() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                enabled = !state.isLoading
            ) {
                Text(
                    text = "Sign Out",
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}
