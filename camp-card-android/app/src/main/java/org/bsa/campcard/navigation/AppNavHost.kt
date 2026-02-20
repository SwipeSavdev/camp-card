package org.bsa.campcard.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import org.bsa.campcard.core.auth.AuthViewModel
import org.bsa.campcard.core.models.UserRole
import org.bsa.campcard.features.auth.ConsentPendingScreen
import org.bsa.campcard.features.auth.ForgotPasswordScreen
import org.bsa.campcard.features.auth.LoginScreen
import org.bsa.campcard.features.auth.SignupScreen
import org.bsa.campcard.features.onboarding.AccountCreationScreen
import org.bsa.campcard.features.onboarding.OnboardingGateScreen
import org.bsa.campcard.features.onboarding.PlanSelectionScreen
import org.bsa.campcard.features.onboarding.RoleSelectionScreen
import org.bsa.campcard.features.parent.ParentNavHost
import org.bsa.campcard.features.scout.ScoutNavHost
import org.bsa.campcard.features.troopLeader.TroopLeaderNavHost

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    // Auth
    object Login : Screen("login")
    object Signup : Screen("signup")
    object ForgotPassword : Screen("forgot_password")
    object ConsentPending : Screen("consent_pending")
    // Onboarding funnel (new users)
    object OnboardingGate : Screen("onboarding_gate")
    object RoleSelection : Screen("role_selection")
    object PlanSelection : Screen("plan_selection/{role}") {
        fun withRole(role: String) = "plan_selection/$role"
    }
    object AccountCreation : Screen("account_creation/{role}/{productId}") {
        fun withArgs(role: String, productId: String) = "account_creation/$role/$productId"
    }
    // Role homes (handled by nested NavHosts)
    object ScoutHome : Screen("scout_home")
    object TroopLeaderHome : Screen("troop_leader_home")
    object ParentHome : Screen("parent_home")
}

@Composable
fun AppNavHost(
    navController: NavHostController = rememberNavController(),
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val state by authViewModel.state.collectAsState()

    when {
        state.isLoading -> {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }

        !state.isAuthenticated -> {
            NavHost(navController = navController, startDestination = Screen.OnboardingGate.route) {

                // Onboarding funnel
                composable(Screen.OnboardingGate.route) {
                    OnboardingGateScreen(
                        onGetStarted = { navController.navigate(Screen.RoleSelection.route) },
                        onSignIn = { navController.navigate(Screen.Login.route) },
                        onResumeAccountCreation = { productId ->
                            navController.navigate(
                                Screen.AccountCreation.withArgs("parent", productId)
                            )
                        }
                    )
                }

                composable(Screen.RoleSelection.route) {
                    RoleSelectionScreen(
                        onRoleSelected = { role ->
                            navController.navigate(Screen.PlanSelection.withRole(role))
                        },
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                composable(Screen.PlanSelection.route) { backStack ->
                    val role = backStack.arguments?.getString("role") ?: "scout"
                    PlanSelectionScreen(
                        role = role,
                        onPurchaseSuccess = { productId ->
                            navController.navigate(Screen.AccountCreation.withArgs(role, productId)) {
                                popUpTo(Screen.PlanSelection.route) { inclusive = true }
                            }
                        },
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                composable(Screen.AccountCreation.route) { backStack ->
                    val role = backStack.arguments?.getString("role") ?: "parent"
                    val productId = backStack.arguments?.getString("productId") ?: ""
                    AccountCreationScreen(
                        preselectedRole = role,
                        pendingProductId = productId,
                        authViewModel = authViewModel,
                        onNavigateToLogin = { navController.navigate(Screen.Login.route) }
                    )
                }

                // Standard auth screens
                composable(Screen.Login.route) {
                    LoginScreen(
                        authViewModel = authViewModel,
                        onNavigateToSignup = { navController.navigate(Screen.Signup.route) },
                        onNavigateToForgotPassword = { navController.navigate(Screen.ForgotPassword.route) }
                    )
                }

                composable(Screen.Signup.route) {
                    SignupScreen(
                        authViewModel = authViewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                composable(Screen.ForgotPassword.route) {
                    ForgotPasswordScreen(
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }
        }

        state.user?.needsConsentBlock == true -> {
            ConsentPendingScreen(authViewModel = authViewModel)
        }

        else -> {
            val user = state.user
            when (user?.userRole) {
                UserRole.SCOUT -> ScoutNavHost(authViewModel = authViewModel)
                UserRole.TROOP_LEADER -> TroopLeaderNavHost(authViewModel = authViewModel)
                else -> ParentNavHost(authViewModel = authViewModel)
            }
        }
    }
}
