package org.bsa.campcard.features.troopLeader

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.Person
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
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.features.shared.ChangePasswordScreen
import org.bsa.campcard.features.shared.HelpSupportScreen
import org.bsa.campcard.features.shared.OffersListScreen
import org.bsa.campcard.features.shared.PrivacyPolicyScreen
import org.bsa.campcard.features.shared.ProfileScreen
import org.bsa.campcard.features.shared.SettingsScreen
import org.bsa.campcard.features.shared.TermsOfServiceScreen
import org.bsa.campcard.ui.theme.BsaBlue

private sealed class TroopLeaderTab(
    val route: String,
    val label: String,
    val icon: ImageVector
) {
    object Home : TroopLeaderTab("tl_home", "Home", Icons.Filled.Home)
    object Offers : TroopLeaderTab("tl_offers", "Offers", Icons.Filled.LocalOffer)
    object Scouts : TroopLeaderTab("tl_scouts", "Scouts", Icons.Filled.Group)
    object Stats : TroopLeaderTab("tl_stats", "Stats", Icons.Filled.BarChart)
    object Profile : TroopLeaderTab("tl_profile", "Profile", Icons.Filled.Person)
}

// Sub-routes
private const val ROUTE_INVITE_SCOUT = "invite_scout"
private const val ROUTE_SELECT_SCOUT_FOR_SUB = "select_scout_for_subscription"
private const val ROUTE_CHANGE_PASSWORD = "tl_change_password"
private const val ROUTE_SETTINGS = "tl_settings"
private const val ROUTE_PRIVACY_POLICY = "tl_privacy_policy"
private const val ROUTE_TERMS = "tl_terms"
private const val ROUTE_HELP = "tl_help"

@Composable
fun TroopLeaderNavHost(authViewModel: AuthViewModel) {
    val authState by authViewModel.state.collectAsState()
    val user = authState.user
    val hasActiveSubscription = user?.hasActiveSubscription == true

    val troopIdInt = user?.troopId?.toIntOrNull() ?: 0

    val baseTabs = listOf(
        TroopLeaderTab.Home,
        TroopLeaderTab.Scouts,
        TroopLeaderTab.Stats,
        TroopLeaderTab.Profile
    )
    val allTabs = if (hasActiveSubscription) {
        listOf(
            TroopLeaderTab.Home,
            TroopLeaderTab.Offers,
            TroopLeaderTab.Scouts,
            TroopLeaderTab.Stats,
            TroopLeaderTab.Profile
        )
    } else {
        baseTabs
    }

    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val navController: NavHostController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = BsaBlue,
                contentColor = Color.White
            ) {
                allTabs.forEachIndexed { index, tab ->
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
                            selectedIconColor = BsaBlue,
                            selectedTextColor = Color.White,
                            indicatorColor = Color.White,
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
                startDestination = TroopLeaderTab.Home.route
            ) {
                // ── Tab roots ──────────────────────────────────────────
                composable(TroopLeaderTab.Home.route) {
                    TroopLeaderHomeScreen()
                }

                if (hasActiveSubscription) {
                    composable(TroopLeaderTab.Offers.route) {
                        val offersNavController = rememberNavController()
                        OffersListScreen(
                            navController = offersNavController,
                            outerNavController = navController
                        )
                    }
                }

                composable(TroopLeaderTab.Scouts.route) {
                    ManageScoutsScreen(
                        onNavigateToInvite = { navController.navigate(ROUTE_INVITE_SCOUT) }
                    )
                }

                composable(TroopLeaderTab.Stats.route) {
                    TroopStatsScreen()
                }

                composable(TroopLeaderTab.Profile.route) {
                    ProfileScreen(
                        authViewModel = authViewModel,
                        onNavigateToChangePassword = { navController.navigate(ROUTE_CHANGE_PASSWORD) },
                        onNavigateToPrivacyPolicy = { navController.navigate(ROUTE_PRIVACY_POLICY) },
                        onNavigateToTerms = { navController.navigate(ROUTE_TERMS) }
                    )
                }

                // ── Troop management ──────────────────────────────────
                composable(ROUTE_INVITE_SCOUT) {
                    InviteScoutScreen(
                        troopId = troopIdInt,
                        onSuccess = { navController.popBackStack() },
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                composable(ROUTE_SELECT_SCOUT_FOR_SUB) {
                    SelectScoutForSubscriptionScreen(
                        onScoutSelected = { _ ->
                            // Navigate to subscription purchase for selected scout
                            navController.popBackStack()
                        },
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                // ── Account ───────────────────────────────────────────
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
