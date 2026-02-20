package org.bsa.campcard.features.shared

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material3.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.bsa.campcard.ui.theme.BsaBlue

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TermsOfServiceScreen(onNavigateBack: () -> Unit) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Terms of Service", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.campcardapp.org/terms"))
                        context.startActivity(intent)
                    }) {
                        Icon(Icons.AutoMirrored.Filled.OpenInNew, "Open in browser", tint = Color.White)
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
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                "Last Updated: February 2026",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            PolicySection(
                title = "1. Acceptance of Terms",
                body = "By downloading or using Camp Card, you agree to these Terms of Service. If you do not agree, do not use the app."
            )

            PolicySection(
                title = "2. Account Registration",
                body = "You must create an account to use Camp Card. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account."
            )

            PolicySection(
                title = "3. In-App Purchases",
                body = "Camp Card offers digital camp card purchases and subscription plans through Google Play. All purchases are final and non-refundable unless otherwise required by law. Subscription plans automatically renew at the stated price unless cancelled at least 24 hours before the renewal date."
            )

            PolicySection(
                title = "4. Subscription Cancellation",
                body = "You may cancel your subscription at any time through Google Play → Subscriptions. Cancellation takes effect at the end of the current billing period. You will retain access to subscription features through the end of the paid period."
            )

            PolicySection(
                title = "5. Offer Redemption",
                body = "Camp Card offers are valid at participating merchant locations only. Offers are subject to merchant availability and may have usage limits. Camp Card is not responsible for merchant refusal to honor offers."
            )

            PolicySection(
                title = "6. Permitted Use",
                body = "Camp Card is intended for Boy Scouts of America fundraising activities. Users may not use the platform for commercial resale, fraud, or any purpose inconsistent with BSA guidelines."
            )

            PolicySection(
                title = "7. Intellectual Property",
                body = "The Camp Card name, logo, and software are owned by or licensed to BSA. You may not reproduce, distribute, or create derivative works without written permission."
            )

            PolicySection(
                title = "8. Limitation of Liability",
                body = "Camp Card is provided 'as is'. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the app."
            )

            PolicySection(
                title = "9. Changes to Terms",
                body = "We may update these terms from time to time. Continued use of Camp Card after changes constitutes acceptance of the new terms. We will notify you of material changes via the app or email."
            )

            PolicySection(
                title = "10. Contact",
                body = "Questions about these Terms? Contact us at:\nlegal@campcardapp.org\nwww.campcardapp.org/terms"
            )

            Spacer(Modifier.height(16.dp))
        }
    }
}
