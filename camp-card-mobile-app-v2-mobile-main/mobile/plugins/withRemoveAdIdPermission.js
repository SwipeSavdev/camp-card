const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to remove the com.google.android.gms.permission.AD_ID
 * permission that Firebase injects via its manifest merger.
 *
 * Camp Card does not use the Advertising ID. Firebase injects this permission
 * automatically, but Google Play requires an explicit declaration if it is
 * present. Using tools:node="remove" tells the manifest merger to strip it.
 */
module.exports = function withRemoveAdIdPermission(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Ensure the tools namespace is declared on the root <manifest> element
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    // Remove any existing AD_ID entry to avoid duplicates
    manifest['uses-permission'] = manifest['uses-permission'].filter(
      (p) => p.$?.['android:name'] !== 'com.google.android.gms.permission.AD_ID'
    );

    // Add a removal directive — the manifest merger will strip it from all sources
    manifest['uses-permission'].push({
      $: {
        'android:name': 'com.google.android.gms.permission.AD_ID',
        'tools:node': 'remove',
      },
    });

    return config;
  });
};
