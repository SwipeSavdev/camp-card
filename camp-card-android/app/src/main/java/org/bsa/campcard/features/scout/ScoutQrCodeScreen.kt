package org.bsa.campcard.features.scout

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
import org.bsa.campcard.core.models.QRCodeResponse
import org.bsa.campcard.core.network.CampCardApi
import org.bsa.campcard.ui.theme.BsaRed
import javax.inject.Inject

// ---------------------------------------------------------------------------
// QR helper
// ---------------------------------------------------------------------------

private fun buildQrImageBitmap(content: String, size: Int = 512): ImageBitmap? {
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

data class ScoutQrUiState(
    val isLoading: Boolean = false,
    val qrCode: QRCodeResponse? = null,
    val error: String? = null
)

@HiltViewModel
class ScoutQrCodeViewModel @Inject constructor(
    private val api: CampCardApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScoutQrUiState())
    val uiState = _uiState.asStateFlow()

    init {
        viewModelScope.launch { load() }
    }

    fun refresh() {
        viewModelScope.launch { load() }
    }

    private suspend fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        try {
            val qrCode = api.getQrCode()
            _uiState.update { it.copy(isLoading = false, qrCode = qrCode) }
        } catch (e: Exception) {
            _uiState.update {
                it.copy(isLoading = false, error = e.message ?: "Failed to load QR code")
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScoutQrCodeScreen(
    onNavigateBack: () -> Unit,
    viewModel: ScoutQrCodeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // Build QR bitmap when uniqueCode is available
    val qrBitmap = remember(uiState.qrCode?.uniqueCode) {
        uiState.qrCode?.uniqueCode?.let { buildQrImageBitmap(it) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My QR Code") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    uiState.qrCode?.uniqueCode?.let { code ->
                        IconButton(
                            onClick = {
                                val shareText = buildString {
                                    append("Scan my Camp Card QR code: $code")
                                    uiState.qrCode?.qrCodeUrl?.let { url ->
                                        append("\n$url")
                                    }
                                }
                                val intent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_TEXT, shareText)
                                }
                                context.startActivity(
                                    Intent.createChooser(intent, "Share QR Code")
                                )
                            }
                        ) {
                            Icon(Icons.Default.Share, contentDescription = "Share")
                        }
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                uiState.isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = BsaRed
                    )
                }

                uiState.error != null -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = uiState.error!!,
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

                uiState.qrCode != null -> {
                    // White background improves QR readability when displayed in bright environments
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.White)
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Camp Card QR",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = BsaRed
                            )
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Merchants scan this to apply your discount",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.Gray,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(32.dp))

                        if (qrBitmap != null) {
                            // QR code image on white card
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                shadowElevation = 4.dp,
                                color = Color.White
                            ) {
                                Image(
                                    bitmap = qrBitmap,
                                    contentDescription = "QR Code",
                                    modifier = Modifier
                                        .size(260.dp)
                                        .padding(16.dp)
                                )
                            }
                        } else {
                            Box(
                                modifier = Modifier
                                    .size(260.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Color(0xFFF5F5F5)),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(
                                        Icons.Default.QrCode,
                                        contentDescription = null,
                                        modifier = Modifier.size(80.dp),
                                        tint = Color.Gray
                                    )
                                    Text(
                                        text = "QR unavailable",
                                        color = Color.Gray,
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Unique code text display
                        Surface(
                            color = Color(0xFFF5F5F5),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = uiState.qrCode!!.uniqueCode,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 2.sp,
                                    color = Color.DarkGray
                                ),
                                textAlign = TextAlign.Center
                            )
                        }

                        Spacer(modifier = Modifier.height(32.dp))

                        // Share button
                        Button(
                            onClick = {
                                val shareText = buildString {
                                    append("Scan my Camp Card QR code: ${uiState.qrCode!!.uniqueCode}")
                                    uiState.qrCode!!.qrCodeUrl?.let { url ->
                                        append("\n$url")
                                    }
                                }
                                val intent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_TEXT, shareText)
                                }
                                context.startActivity(Intent.createChooser(intent, "Share QR Code"))
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
                                text = "Share QR Code",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }
    }
}
