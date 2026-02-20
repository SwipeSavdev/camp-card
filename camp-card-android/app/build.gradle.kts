import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
    alias(libs.plugins.google.services)
}

val keyPropsFile = rootProject.file("key.properties")
val keyProps = Properties().apply {
    if (keyPropsFile.exists()) load(keyPropsFile.inputStream())
}

android {
    namespace = "org.bsa.campcard"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.bsa.campcard"
        minSdk = 26
        targetSdk = 35
        versionCode = 66
        versionName = "2.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        buildConfigField("String", "API_BASE_URL", "\"https://api.campcardapp.org/api/v1/\"")
        buildConfigField("String", "APP_VERSION", "\"2.0.0\"")
    }

    signingConfigs {
        if (keyPropsFile.exists()) {
            create("release") {
                storeFile = file(keyProps["storeFile"] as String)
                storePassword = keyProps["storePassword"] as String
                keyAlias = keyProps["keyAlias"] as String
                keyPassword = keyProps["keyPassword"] as String
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            if (keyPropsFile.exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
        debug {
            buildConfigField("String", "API_BASE_URL", "\"https://api.campcardapp.org/api/v1/\"")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)

    // Compose
    val composeBom = platform(libs.compose.bom)
    implementation(composeBom)
    implementation(libs.compose.ui)
    implementation(libs.compose.ui.graphics)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.compose.material3)
    implementation(libs.compose.material.icons.extended)
    debugImplementation(libs.compose.ui.tooling)

    // Navigation
    implementation(libs.navigation.compose)

    // Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.android.compiler)
    implementation(libs.hilt.navigation.compose)

    // Retrofit + OkHttp
    implementation(libs.retrofit)
    implementation(libs.retrofit.kotlin.serialization)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.kotlin.serialization.json)

    // Coroutines
    implementation(libs.coroutines.android)

    // Google Play Billing v7
    implementation(libs.billing)

    // Firebase
    val firebaseBom = platform(libs.firebase.bom)
    implementation(firebaseBom)
    implementation(libs.firebase.messaging)
    implementation(libs.firebase.analytics)

    // Biometric
    implementation(libs.biometric)

    // CameraX + ML Kit
    implementation(libs.camerax.core)
    implementation(libs.camerax.camera2)
    implementation(libs.camerax.lifecycle)
    implementation(libs.camerax.view)
    implementation(libs.mlkit.barcode)

    // Coil image loading
    implementation(libs.coil.compose)

    // Encrypted SharedPreferences
    implementation(libs.encrypted.prefs)

    // DataStore
    implementation(libs.datastore.prefs)

    // Accompanist Permissions
    implementation(libs.accompanist.permissions)

    // ZXing QR generation
    implementation(libs.zxing.core)

    // Tests
    testImplementation("junit:junit:4.13.2")
}
