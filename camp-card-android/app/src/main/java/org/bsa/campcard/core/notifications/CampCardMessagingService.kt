package org.bsa.campcard.core.notifications

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.bsa.campcard.CampCardApplication
import org.bsa.campcard.MainActivity
import org.bsa.campcard.R
import org.bsa.campcard.core.models.DeviceTokenRequest
import org.bsa.campcard.core.network.CampCardApi
import javax.inject.Inject

@AndroidEntryPoint
class CampCardMessagingService : FirebaseMessagingService() {

    @Inject lateinit var api: CampCardApi

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        scope.launch {
            try {
                api.registerDeviceToken(
                    DeviceTokenRequest(
                        token = token,
                        deviceType = "ANDROID",
                        deviceModel = "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}",
                        osVersion = android.os.Build.VERSION.RELEASE,
                        appVersion = "2.0.0"
                    )
                )
            } catch (e: Exception) {
                // Retry on next app launch
            }
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        val title = message.notification?.title ?: message.data["title"] ?: "Camp Card"
        val body = message.notification?.body ?: message.data["body"] ?: ""
        val type = message.data["type"] ?: "general"
        val deepLink = buildDeepLink(type, message.data)

        showNotification(title, body, deepLink, channelForType(type))
    }

    private fun channelForType(type: String): String = when (type) {
        "NEW_OFFER", "OFFER_EXPIRING" -> CampCardApplication.CHANNEL_OFFERS
        "PAYMENT_SUCCESS", "SUBSCRIPTION_RENEWED" -> CampCardApplication.CHANNEL_PAYMENTS
        "REFERRAL_REWARD", "REFERRAL_SIGNUP" -> CampCardApplication.CHANNEL_REFERRALS
        else -> CampCardApplication.CHANNEL_OFFERS
    }

    private fun buildDeepLink(type: String, data: Map<String, String>): String? = when (type) {
        "NEW_OFFER" -> data["offerId"]?.let { "campcard://offers/$it" }
        "PAYMENT_SUCCESS" -> "campcard://subscription"
        "REFERRAL_REWARD" -> "campcard://referral/${data["code"] ?: ""}"
        else -> null
    }

    private fun showNotification(
        title: String,
        body: String,
        deepLink: String?,
        channelId: String
    ) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            deepLink?.let { data = android.net.Uri.parse(it) }
        }

        val pendingIntent = PendingIntent.getActivity(
            this, System.currentTimeMillis().toInt(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_dialog_info) // Replace with actual icon
            .setColor(0xFF003F87.toInt())
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
