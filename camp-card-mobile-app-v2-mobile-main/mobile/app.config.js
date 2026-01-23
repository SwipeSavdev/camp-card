module.exports = {
  expo: {
    name: "Camp Card",
    slug: "camp-card",
    version: "1.0.0",
    orientation: "portrait",
    description: "BSA Camp Card - Digital discount subscriptions supporting Scout fundraising. Access exclusive merchant offers, track redemptions, and support your local Scout troop.",
    sdkVersion: "54.0.0",
    platforms: ["ios", "android"],
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "campcard",
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#003F87"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "org.bsa.campcard",
      buildNumber: "14",
      supportsTablet: true,
      requireFullScreen: false,
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        NSCameraUsageDescription: "Camp Card needs camera access to scan QR codes for offer redemptions and merchant verification.",
        NSPhotoLibraryUsageDescription: "Camp Card needs photo library access to upload profile pictures and share achievements.",
        NSLocationWhenInUseUsageDescription: "Camp Card needs your location to find nearby merchants and offers in your area.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Camp Card uses your location to notify you of nearby merchant offers.",
        NSFaceIDUsageDescription: "Camp Card uses Face ID for secure authentication.",
        UIBackgroundModes: ["remote-notification", "fetch"],
        ITSAppUsesNonExemptEncryption: false
      },
      entitlements: {
        "aps-environment": "production"
      },
      associatedDomains: [
        "applinks:campcardapp.org",
        "applinks:www.campcardapp.org"
      ]
    },
    android: {
      package: "org.bsa.campcard",
      versionCode: 13,
      // Use environment variable if available (EAS Build), otherwise fall back to local file
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#003F87"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "campcardapp.org",
              pathPrefix: "/app"
            },
            {
              scheme: "https",
              host: "www.campcardapp.org",
              pathPrefix: "/app"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        },
        {
          action: "VIEW",
          data: [
            {
              scheme: "campcard"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    plugins: [
      [
        "expo-notifications",
        {
          color: "#003F87"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Camp Card uses your location to find nearby merchants with exclusive offers.",
          locationAlwaysPermission: "Camp Card uses your location to notify you of nearby deals even when the app is closed.",
          locationWhenInUsePermission: "Camp Card uses your location to show nearby merchants and offers."
        }
      ],
      "expo-secure-store",
      "expo-font"
    ],
    runtimeVersion: {
      policy: "sdkVersion"
    },
    extra: {
      eas: {
        projectId: "b4af49da-5fe8-402f-8339-92131b27ff3e"
      }
    },
    owner: "swipesavvy2026"
  }
};
