package org.bsa.campcard.features.scout

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.LocalOffer
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Wallet
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.features.shared.ChangePasswordScreen
import org.bsa.campcard.features.shared.HelpSupportScreen
import org.bsa.campcard.features.shared.NearbyMerchantsScreen
import org.bsa.campcard.features.shared.OffersListScreen
import org.bsa.campcard.features.shared.PrivacyPolicyScreen
import org.bsa.campcard.features.shared.ProfileScreen
import org.bsa.campcard.features.shared.QRScannerScreen
import org.bsa.campcard.features.shared.SettingsScreen
import org.bsa.campcard.features.shared.TermsOfServiceScreen
import org.bsa.campcard.ui.theme.BsaRed

// ──────────────────────────────────────────────────────────────────────────
// Route constants
// ──────────────────────────────────────────────────────────────────────────

private const val ROUTE_SCOUT_HOME = "scout_home"
private const val ROUTE_SCOUT_WALLET = "scout_wallet"
private const val ROUTE_OFFERS_LIST = "offers_list"
private const val ROUTE_PROFILE = "profile"

// Sub-routes (pushed on top of tabs)
private const val ROUTE_SCOUT_QR = "scout_qr"
private const val ROUTE_REFERRAL = "referral"
private const val ROUTE_CARD_INVENTORY = "card_inventory"
private const val ROUTE_REDEMPTION_HISTORY = "redemption_history"
private const val ROUTE_REDEMPTION_SUCCESS = "redemption_success?title={title}&merchant={merchant}&discount={discount}"
private const val ROUTE_GIFT_CARD = "gift_card/{cardId}"
private const val ROUTE_CLAIM_GIFT = "claim_gift/{token}"
private const val ROUTE_REPLENISH_CARD = "replenish_card/{cardId}"
private const val ROUTE_QR_SCANNER = "qr_scanner"
private const val ROUTE_CHANGE_PASSWORD = "change_password"
private const val ROUTE_NEARBY_MERCHANTS = "nearby_merchants"
private const val ROUTE_SETTINGS = "settings"
private const val ROUTE_PRIVACY_POLICY = "privacy_policy"
private const val ROUTE_TERMS = "terms"
private const val ROUTE_HELP = "help"

// ──────────────────────────────────────────────────────────────────────────
// Tab definition
// ──────────────────────────────────────────────────────────────────────────

private data class ScoutTab(
    val route: String,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

private val scoutTabs = listOf(
    ScoutTab(ROUTE_SCOUT_HOME, "Home", Icons.Filled.Home, Icons.Outlined.Home),
    ScoutTab(ROUTE_SCOUT_WALLET, "Wallet", Icons.Filled.Wallet, Icons.Outlined.Wallet),
    ScoutTab(ROUTE_OFFERS_LIST, "Offers", Icons.Filled.LocalOffer, Icons.Outlined.LocalOffer),
    ScoutTab(ROUTE_PROFILE, "Profile", Icons.Filled.Person, Icons.Outlined.Person)
)

// ──────────────────────────────────────────────────────────────────────────
// NavHost
// ──────────────────────────────────────────────────────────────────────────

@Composable
fun ScoutNavHost(authViewModel: AuthViewModel) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Only show bottom bar on root tab routes
    val tabRoutes = scoutTabs.map { it.route }
    val showBottomBar = tabRoutes.any { currentRoute == it }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 4.dp
                ) {
                    scoutTabs.forEach { tab ->
                        val isSelected = currentRoute == tab.route
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                if (!isSelected) {
                                    navController.navigate(tab.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    if (isSelected) tab.selectedIcon else tab.unselectedIcon,
                                    contentDescription = tab.label,
                                    tint = if (isSelected) BsaRed else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            },
                            label = {
                                Text(
                                    tab.label,
                                    color = if (isSelected) BsaRed else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                indicatorColor = BsaRed.copy(alpha = 0.12f)
                            )
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = ROUTE_SCOUT_HOME,
            modifier = Modifier.padding(paddingValues)
        ) {
            // ── Tab roots ──────────────────────────────────────────────
            composable(ROUTE_SCOUT_HOME) {
                ScoutHomeScreen(
                    authViewModel = authViewModel,
                    onNavigateToQrCode = { navController.navigate(ROUTE_SCOUT_QR) },
                    onNavigateToWallet = {
                        navController.navigate(ROUTE_SCOUT_WALLET) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true; restoreState = true
                        }
                    },
                    onNavigateToReferral = { navController.navigate(ROUTE_REFERRAL) }
                )
            }

            composable(ROUTE_SCOUT_WALLET) {
                WalletScreen(
                    onNavigateToQrCode = { navController.navigate(ROUTE_SCOUT_QR) },
                    onNavigateToCardInventory = { navController.navigate(ROUTE_CARD_INVENTORY) },
                    onNavigateToRedemptionHistory = { navController.navigate(ROUTE_REDEMPTION_HISTORY) },
                    onNavigateToNearbyMerchants = { navController.navigate(ROUTE_NEARBY_MERCHANTS) }
                )
            }

            composable(ROUTE_OFFERS_LIST) {
                val offersNavController = rememberNavController()
                OffersListScreen(
                    navController = offersNavController,
                    outerNavController = navController
                )
            }

            composable(ROUTE_PROFILE) {
                ProfileScreen(
                    authViewModel = authViewModel,
                    onNavigateToChangePassword = { navController.navigate(ROUTE_CHANGE_PASSWORD) },
                    onNavigateToMyQrCode = { navController.navigate(ROUTE_SCOUT_QR) },
                    onNavigateToReferrals = { navController.navigate(ROUTE_REFERRAL) },
                    onNavigateToPrivacyPolicy = { navController.navigate(ROUTE_PRIVACY_POLICY) },
                    onNavigateToTerms = { navController.navigate(ROUTE_TERMS) }
                )
            }

            // ── Scout QR + Referral ────────────────────────────────────
            composable(ROUTE_SCOUT_QR) {
                ScoutQrCodeScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable(ROUTE_REFERRAL) {
                ReferralScreen(onNavigateBack = { navController.popBackStack() })
            }

            // ── Card Inventory + Gift + Claim + Activate ───────────────
            composable(ROUTE_CARD_INVENTORY) {
                CardInventoryScreen(
                    onGiftCard = { cardId -> navController.navigate("gift_card/$cardId") },
                    onReplenishCard = { cardId -> navController.navigate("replenish_card/$cardId") },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(
                route = ROUTE_GIFT_CARD,
                arguments = listOf(navArgument("cardId") { type = NavType.IntType })
            ) { backStack ->
                val cardId = backStack.arguments?.getInt("cardId") ?: 0
                GiftCardScreen(
                    cardId = cardId,
                    onSuccess = { navController.popBackStack() },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(
                route = ROUTE_REPLENISH_CARD,
                arguments = listOf(navArgument("cardId") { type = NavType.IntType })
            ) { backStack ->
                val cardId = backStack.arguments?.getInt("cardId") ?: 0
                ReplenishCardScreen(
                    cardId = cardId,
                    onSuccess = { navController.popBackStack() },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(
                route = ROUTE_CLAIM_GIFT,
                arguments = listOf(navArgument("token") { type = NavType.StringType })
            ) { backStack ->
                val token = backStack.arguments?.getString("token") ?: ""
                ClaimGiftScreen(
                    token = token,
                    onSuccess = { navController.popBackStack() },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // ── Redemption History + Success ───────────────────────────
            composable(ROUTE_REDEMPTION_HISTORY) {
                RedemptionHistoryScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable(
                route = ROUTE_REDEMPTION_SUCCESS,
                arguments = listOf(
                    navArgument("title") { type = NavType.StringType; defaultValue = "Offer" },
                    navArgument("merchant") { type = NavType.StringType; defaultValue = "" },
                    navArgument("discount") { type = NavType.StringType; defaultValue = "" }
                )
            ) { backStack ->
                val title = backStack.arguments?.getString("title") ?: "Offer"
                val merchant = backStack.arguments?.getString("merchant") ?: ""
                val discount = backStack.arguments?.getString("discount") ?: ""
                RedemptionSuccessScreen(
                    offerTitle = title,
                    merchantName = merchant,
                    discount = discount,
                    onDone = {
                        navController.popBackStack(ROUTE_SCOUT_HOME, inclusive = false)
                    }
                )
            }

            // ── QR Scanner ────────────────────────────────────────────
            composable(ROUTE_QR_SCANNER) {
                QRScannerScreen(
                    title = "Scan QR Code",
                    onResult = { code ->
                        // Navigate to claim gift if it looks like a claim token
                        if (code.contains("claim") || code.length == 36) {
                            val token = code.substringAfterLast("/")
                            navController.navigate("claim_gift/$token") {
                                popUpTo(ROUTE_QR_SCANNER) { inclusive = true }
                            }
                        } else {
                            navController.popBackStack()
                        }
                    },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // ── Nearby Merchants ──────────────────────────────────────
            composable(ROUTE_NEARBY_MERCHANTS) {
                NearbyMerchantsScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // ── Account / Settings ─────────────────────────────────────
            composable(ROUTE_CHANGE_PASSWORD) {
                ChangePasswordScreen(
                    onSuccess = { navController.popBackStack() },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(ROUTE_SETTINGS) {
                SettingsScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToChangePassword = { navController.navigate(ROUTE_CHANGE_PASSWORD) },
                    onNavigateToPrivacyPolicy = { navController.navigate(ROUTE_PRIVACY_POLICY) },
                    onNavigateToTerms = { navController.navigate(ROUTE_TERMS) },
                    onNavigateToHelp = { navController.navigate(ROUTE_HELP) }
                )
            }

            composable(ROUTE_PRIVACY_POLICY) {
                PrivacyPolicyScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable(ROUTE_TERMS) {
                TermsOfServiceScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable(ROUTE_HELP) {
                HelpSupportScreen(onNavigateBack = { navController.popBackStack() })
            }
        }
    }
}
