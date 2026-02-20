package org.bsa.campcard.features.shared

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import org.bsa.campcard.ui.theme.BsaBlue

private data class FaqItem(val question: String, val answer: String)

private val faqItems = listOf(
    FaqItem(
        "How do I redeem an offer?",
        "Open the Offers tab, tap on an offer, and show the QR code or offer details to the merchant at checkout. The merchant will apply the discount to your purchase."
    ),
    FaqItem(
        "How do I gift a card to someone?",
        "Go to My Wallet, tap on a card, and select 'Gift Card'. Enter the recipient's email address and an optional message. They'll receive an email with a claim link."
    ),
    FaqItem(
        "Can I get a refund on a card purchase?",
        "Camp Card purchases are generally non-refundable as per Google Play's policy. For billing issues, contact Google Play Support or visit play.google.com/store/account."
    ),
    FaqItem(
        "How do I cancel my subscription?",
        "Open Google Play → tap your profile → Payments & Subscriptions → Subscriptions → Camp Card → Cancel. You'll retain access through the end of your billing period."
    ),
    FaqItem(
        "Why can't I log in?",
        "Check that your email and password are correct. If you've forgotten your password, use 'Forgot Password' on the sign-in screen. Contact support if the issue persists."
    ),
    FaqItem(
        "How does my affiliate QR code work?",
        "Your QR code tracks card purchases made through your referral link. Share it with friends and family to build your referral stats and earn recognition."
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpSupportScreen(onNavigateBack: () -> Unit) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Help & Support", color = Color.White, fontWeight = FontWeight.Bold) },
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
            // Contact section
            SectionHeader("Contact Us")
            HelpActionRow(
                icon = Icons.Default.Email,
                label = "Email Support",
                subtitle = "support@campcardapp.org",
                onClick = {
                    val intent = Intent(Intent.ACTION_SENDTO).apply {
                        data = Uri.parse("mailto:support@campcardapp.org")
                        putExtra(Intent.EXTRA_SUBJECT, "Camp Card Support Request")
                    }
                    context.startActivity(intent)
                }
            )
            HorizontalDivider(modifier = Modifier.padding(horizontal = 20.dp), color = MaterialTheme.colorScheme.outlineVariant)
            HelpActionRow(
                icon = Icons.Default.Public,
                label = "Help Center",
                subtitle = "www.campcardapp.org/help",
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.campcardapp.org/help"))
                    context.startActivity(intent)
                }
            )

            Spacer(Modifier.height(8.dp))

            // Purchases & Billing
            SectionHeader("Purchases & Billing")
            HelpActionRow(
                icon = Icons.Default.BugReport,
                label = "Report a Purchase Issue",
                subtitle = "via Google Play",
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/account"))
                    context.startActivity(intent)
                }
            )
            HorizontalDivider(modifier = Modifier.padding(horizontal = 20.dp), color = MaterialTheme.colorScheme.outlineVariant)
            HelpActionRow(
                icon = Icons.Default.Star,
                label = "Manage Subscription",
                subtitle = "Google Play Subscriptions",
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/account/subscriptions"))
                    context.startActivity(intent)
                }
            )

            Spacer(Modifier.height(8.dp))

            // FAQ
            SectionHeader("Frequently Asked Questions")
            faqItems.forEach { faq ->
                FaqRow(faq = faq)
                HorizontalDivider(modifier = Modifier.padding(horizontal = 20.dp), color = MaterialTheme.colorScheme.outlineVariant)
            }

            Spacer(Modifier.height(8.dp))

            // App Info
            SectionHeader("App Information")
            HelpInfoRow(label = "BSA Camp Card", value = "Digital Fundraising Platform")
            HorizontalDivider(modifier = Modifier.padding(horizontal = 20.dp), color = MaterialTheme.colorScheme.outlineVariant)
            HelpInfoRow(label = "Developed by", value = "BSA Technology")
            HorizontalDivider(modifier = Modifier.padding(horizontal = 20.dp), color = MaterialTheme.colorScheme.outlineVariant)
            HelpInfoRow(label = "Website", value = "www.campcardapp.org")
        }
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(start = 20.dp, top = 20.dp, bottom = 6.dp)
    )
}

@Composable
private fun HelpActionRow(
    icon: ImageVector,
    label: String,
    subtitle: String,
    onClick: () -> Unit
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
        Icon(icon, null, tint = BsaBlue, modifier = Modifier.size(22.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(label, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Icon(Icons.Default.ChevronRight, null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(20.dp))
    }
}

@Composable
private fun HelpInfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        Text(value, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun FaqRow(faq: FaqItem) {
    var expanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded }
            .padding(horizontal = 20.dp, vertical = 14.dp)
            .semantics {
                contentDescription = faq.question
                role = Role.Button
            }
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                faq.question,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
            Icon(
                if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = if (expanded) "Collapse" else "Expand",
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(20.dp)
            )
        }
        AnimatedVisibility(visible = expanded) {
            Text(
                faq.answer,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}
