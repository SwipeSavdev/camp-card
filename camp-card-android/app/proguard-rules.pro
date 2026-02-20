# Keep Retrofit and kotlinx.serialization
-keepattributes Signature
-keepattributes *Annotation*
-keep class kotlinx.serialization.** { *; }
-keep class org.bsa.campcard.core.models.** { *; }

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Retrofit
-keep class retrofit2.** { *; }
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}

# Hilt
-keepclasseswithmembers class * {
    @dagger.hilt.* <methods>;
    @javax.inject.* <fields>;
    @javax.inject.* <init>(...);
}

# Firebase
-keep class com.google.firebase.** { *; }

# Play Billing
-keep class com.android.billingclient.** { *; }

# CameraX + ML Kit
-keep class androidx.camera.** { *; }
-keep class com.google.mlkit.** { *; }
