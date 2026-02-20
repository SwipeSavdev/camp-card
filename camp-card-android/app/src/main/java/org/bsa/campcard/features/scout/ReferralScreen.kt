package org.bsa.campcard.features.scout

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.bsa.campcard.core.models.ReferralCode
import org.bsa.campcard.core.models.ReferralStats
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaGold
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

// ---------------------------------------------------------------------------
// QR helper (referral URL)
// ---------------------------------------------------------------------------

private fun buildReferralQrBitmap(content: String, size: Int = 400): ImageBitmap? {
    return try {
        val matrix = MultiFormatWriter().encode(content, BarcodeFormat.QR_CODE, size, size)
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bitmap.setPixel(
                    x, y,
                    if (matrix[x, y]) AndroidColor.BLACK else AndroidColor.WHITE
                )
            }
        }
        bitmap.asImageBitmap()
    } catch (e: Exception) {
        null
    }
}

// ---------------------------------------------------------------------------
// ViewModel
// ---------------------------------------------------------------------------

data class ReferralUiState(
    val isLoading: Boolean = false,
    val stats: ReferralStats? = null,
    val referralCode: ReferralCode? = null,
    val error: String? = null
)

@HiltViewModel
class ReferralViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReferralUiState())
    val uiState = _uiState.asStateFlow()

    init {
        viewModelScope.launch { load() }
    }

    fun refresh() {
        viewModelScope.launch { load() }
    }

    private suspend fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        val stats = try { api.getReferralStats() } catch (e: Exception) { null }
        val code = try { api.getReferralCode() } catch (e: Exception) { null }
        val error = if (stats == null && code == null) "Failed to load referrals" else null
        _uiState.update {
            it.copy(isLoading = false, stats = stats, referralCode = code, error = error)
        }
    }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReferralScreen(
    onNavigateBack: () -> Unit,
    viewModel: ReferralViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Build QR bitmap from referral URL or code
    val qrContent = uiState.referralCode?.url ?: uiState.referralCode?.code
    val qrBitmap = remember(qrContent) {
        qrContent?.let { buildReferralQrBitmap(it) }
    }

    // Show error snackbar
    LaunchedEffect(uiState.error) {
        uiState.error?.let { error ->
            scope.launch {
                snackbarHostState.showSnackbar(error, duration = SnackbarDuration.Short)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Referrals",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (uiState.isLoading && uiState.stats == null) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = BsaRed
                )
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Spacer(modifier = Modifier.height(8.dp))

                    // Loading bar when refreshing
                    if (uiState.isLoading) {
                        LinearProgressIndicator(
                            modifier = Modifier.fillMaxWidth(),
                            color = BsaRed
                        )
                    }

                    // Stats grid
                    uiState.stats?.let { stats ->
                        Text(
                            text = "Your Referral Stats",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.SemiBold
                            )
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            StatCard(
                                icon = Icons.Default.TouchApp,
                                label = "Link Clicks",
                                value = stats.linkClicks.toString(),
                                tint = BsaRed,
                                modifier = Modifier.weight(1f)
                            )
                            StatCard(
                                icon = Icons.Default.QrCodeScanner,
                                label = "QR Scans",
                                value = stats.qrScans.toString(),
                                tint = BsaRed,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            StatCard(
                                icon = Icons.Default.People,
                                label = "Referrals",
                                value = stats.referralCount.toString(),
                                tint = BsaRed,
                                modifier = Modifier.weight(1f)
                            )
                            StatCard(
                                icon = Icons.Default.AttachMoney,
                                label = "Earnings",
                                value = "$${String.format("%.2f", stats.totalEarnings)}",
                                tint = BsaGold,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    HorizontalDivider()

                    // Referral link section
                    uiState.referralCode?.let { code ->
                        Text(
                            text = "Your Referral Link",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.SemiBold
                            )
                        )

                        // Referral URL card
                        val displayUrl = code.url ?: code.code
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    Icons.Default.Link,
                                    contentDescription = null,
                                    tint = BsaRed,
                                    modifier = Modifier.size(20.dp)
                                )
                                Text(
                                    text = displayUrl,
                                    style = MaterialTheme.typography.bodySmall,
                                    modifier = Modifier.weight(1f),
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        // QR code
                        Text(
                            text = "Referral QR Code",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.SemiBold
                            )
                        )

                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                if (qrBitmap != null) {
                                    Image(
                                        bitmap = qrBitmap,
                                        contentDescription = "Referral QR Code",
                                        modifier = Modifier
                                            .size(200.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                    )
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .size(200.dp)
                                            .background(
                                                color = Color(0xFFF5F5F5),
                                                shape = RoundedCornerShape(8.dp)
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = code.code,
                                            style = MaterialTheme.typography.titleMedium.copy(
                                                fontWeight = FontWeight.Bold,
                                                letterSpacing = 2.sp
                                            ),
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = "Code: ${code.code}",
                                    style = MaterialTheme.typography.labelLarge.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                )
                            }
                        }

                        // Share button
                        Button(
                            onClick = {
                                val shareText = buildString {
                                    append("Join me on Camp Card - the BSA digital fundraising app!\n\n")
                                    code.url?.let { url ->
                                        append("Use my referral link: $url\n")
                                    }
                                    append("Or enter my code: ${code.code}")
                                }
                                val intent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_TEXT, shareText)
                                    putExtra(Intent.EXTRA_SUBJECT, "Join me on Camp Card!")
                                }
                                context.startActivity(
                                    Intent.createChooser(intent, "Share your referral")
                                )
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = BsaRed)
                        ) {
                            Icon(
                                Icons.Default.Share,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Share Referral Link",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    // Error state when no data loaded
                    if (uiState.stats == null && uiState.referralCode == null && !uiState.isLoading) {
                        uiState.error?.let { error ->
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Text(
                                    text = error,
                                    textAlign = TextAlign.Center,
                                    color = MaterialTheme.colorScheme.error
                                )
                                Button(
                                    onClick = { viewModel.refresh() },
                                    colors = ButtonDefaults.buttonColors(containerColor = BsaRed)
                                ) {
                                    Text("Retry")
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Stat card component
// ---------------------------------------------------------------------------

@Composable
private fun StatCard(
    icon: ImageVector,
    label: String,
    value: String,
    tint: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = tint.copy(alpha = 0.08f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = tint,
                modifier = Modifier.size(28.dp)
            )
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = tint
                )
            )
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
    }
}
