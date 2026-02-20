package org.bsa.campcard

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.google.firebase.FirebaseApp
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class CampCardApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)

            val offersChannel = NotificationChannel(
                CHANNEL_OFFERS,
                "Offers & Deals",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "New offers and deals from merchants"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250)
            }

            val paymentsChannel = NotificationChannel(
                CHANNEL_PAYMENTS,
                "Payments",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Payment confirmations and receipts"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250)
            }

            val referralsChannel = NotificationChannel(
                CHANNEL_REFERRALS,
                "Referrals",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Referral rewards and updates"
            }

            manager.createNotificationChannels(
                listOf(offersChannel, paymentsChannel, referralsChannel)
            )
        }
    }

    companion object {
        const val CHANNEL_OFFERS = "offers"
        const val CHANNEL_PAYMENTS = "payments"
        const val CHANNEL_REFERRALS = "referrals"
    }
}
