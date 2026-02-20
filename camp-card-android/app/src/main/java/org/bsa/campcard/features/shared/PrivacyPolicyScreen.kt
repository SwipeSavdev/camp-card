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
fun PrivacyPolicyScreen(onNavigateBack: () -> Unit) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Privacy Policy", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.campcardapp.org/privacy"))
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
                title = "1. Information We Collect",
                body = "We collect information you provide when creating an account, including your name, email address, and role. We also collect transaction and usage data related to your use of the Camp Card platform."
            )

            PolicySection(
                title = "2. How We Use Your Information",
                body = "We use your information to provide and improve the Camp Card service, process transactions, send account-related communications, and for analytics to improve our platform."
            )

            PolicySection(
                title = "3. Children's Privacy (COPPA)",
                body = "For users under 13, we require verifiable parental consent before collecting personal information. Parents may review, modify, or delete their child's information at any time by contacting us at privacy@campcardapp.org."
            )

            PolicySection(
                title = "4. Data Sharing",
                body = "We do not sell your personal information. We may share data with service providers who help us operate the platform, including payment processors and notification services, under strict data protection agreements."
            )

            PolicySection(
                title = "5. In-App Purchases",
                body = "Purchases are processed through Google Play. Camp Card does not store your payment card details. All transactions are subject to Google Play's terms and privacy policy."
            )

            PolicySection(
                title = "6. Your Rights",
                body = "You may request access to, correction, or deletion of your personal data by contacting us at privacy@campcardapp.org. California residents have additional rights under CCPA."
            )

            PolicySection(
                title = "7. Data Retention",
                body = "We retain your data for as long as your account is active. Upon account deletion, we remove your personal information within 30 days, except where required by law."
            )

            PolicySection(
                title = "8. Security",
                body = "We use industry-standard encryption (TLS/HTTPS) for data in transit and AES-256 encryption for sensitive stored data. Access to personal data is restricted to authorized personnel."
            )

            PolicySection(
                title = "9. Contact Us",
                body = "For privacy-related inquiries, contact:\nPrivacy Officer\nCamp Card / BSA Digital Fundraising\nEmail: privacy@campcardapp.org\nWebsite: www.campcardapp.org/privacy"
            )

            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
internal fun PolicySection(title: String, body: String) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            title,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            body,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
