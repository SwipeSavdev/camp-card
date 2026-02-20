package org.bsa.campcard.features.parent

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.features.shared.ChangePasswordScreen
import org.bsa.campcard.features.shared.HelpSupportScreen
import org.bsa.campcard.features.shared.MerchantsListScreen
import org.bsa.campcard.features.shared.NotificationsScreen
import org.bsa.campcard.features.shared.OffersListScreen
import org.bsa.campcard.features.shared.PrivacyPolicyScreen
import org.bsa.campcard.features.shared.ProfileScreen
import org.bsa.campcard.features.shared.SettingsScreen
import org.bsa.campcard.features.shared.TermsOfServiceScreen
import org.bsa.campcard.ui.theme.BsaAmber
import org.bsa.campcard.ui.theme.BsaGold

private sealed class ParentTab(
    val route: String,
    val label: String,
    val icon: ImageVector
) {
    object Home : ParentTab("parent_home", "Home", Icons.Filled.Home)
    object Offers : ParentTab("parent_offers", "Offers", Icons.Filled.LocalOffer)
    object Merchants : ParentTab("parent_merchants", "Merchants", Icons.Filled.Store)
    object Notifications : ParentTab("parent_notifications", "Alerts", Icons.Filled.Notifications)
    object Profile : ParentTab("parent_profile", "Profile", Icons.Filled.Person)
}

// Sub-routes
private const val ROUTE_CHANGE_PASSWORD = "parent_change_password"
private const val ROUTE_SETTINGS = "parent_settings"
private const val ROUTE_PRIVACY_POLICY = "parent_privacy_policy"
private const val ROUTE_TERMS = "parent_terms"
private const val ROUTE_HELP = "parent_help"

private val parentTabs = listOf(
    ParentTab.Home,
    ParentTab.Offers,
    ParentTab.Merchants,
    ParentTab.Notifications,
    ParentTab.Profile
)

@Composable
fun ParentNavHost(authViewModel: AuthViewModel) {
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val navController: NavHostController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = BsaAmber,
                contentColor = Color.White
            ) {
                parentTabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selectedTabIndex == index,
                        onClick = {
                            selectedTabIndex = index
                            navController.navigate(tab.route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = BsaGold,
                            selectedTextColor = Color.White,
                            indicatorColor = Color.White.copy(alpha = 0.25f),
                            unselectedIconColor = Color.White.copy(alpha = 0.7f),
                            unselectedTextColor = Color.White.copy(alpha = 0.7f)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            NavHost(
                navController = navController,
                startDestination = ParentTab.Home.route
            ) {
                // ── Tab roots ──────────────────────────────────────────
                composable(ParentTab.Home.route) {
                    ParentHomeScreen()
                }

                composable(ParentTab.Offers.route) {
                    val offersNavController = rememberNavController()
                    OffersListScreen(
                        navController = offersNavController,
                        outerNavController = navController
                    )
                }

                composable(ParentTab.Merchants.route) {
                    val merchantsNavController = rememberNavController()
                    MerchantsListScreen(
                        navController = merchantsNavController,
                        outerNavController = navController
                    )
                }

                composable(ParentTab.Notifications.route) {
                    NotificationsScreen()
                }

                composable(ParentTab.Profile.route) {
                    ProfileScreen(
                        authViewModel = authViewModel,
                        onNavigateToChangePassword = { navController.navigate(ROUTE_CHANGE_PASSWORD) },
                        onNavigateToPrivacyPolicy = { navController.navigate(ROUTE_PRIVACY_POLICY) },
                        onNavigateToTerms = { navController.navigate(ROUTE_TERMS) }
                    )
                }

                // ── Account sub-screens ────────────────────────────────
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
}
