#!/usr/bin/env node

/**
 * Create IAP products in App Store Connect via the API.
 * Uses native Node.js crypto for ES256 JWT — no external dependencies.
 */

import { readFileSync } from 'fs';
import { createSign } from 'crypto';

// ── Credentials ──────────────────────────────────────────────────────────────
const KEY_ID = '4R7M7YPC9Q';
const ISSUER_ID = '51541aa3-d401-43f0-9244-976dbad0ec07';
const KEY_PATH = '/Users/papajr/Downloads/AuthKey_4R7M7YPC9Q.p8';
const APP_ID = '6758056347';

// ── Product Definitions ──────────────────────────────────────────────────────
const SUBSCRIPTION_GROUP_NAME = 'Camp Card Annual';

const SUBSCRIPTIONS = [
  {
    productId: 'org.bsa.campcard.subscription.annual',
    name: 'Camp Card Annual',
    displayName: 'Camp Card Annual Subscription',
    description: 'Annual subscription to the Camp Card digital fundraising platform. Get access to exclusive offers and support your local scouts.',
    duration: 'ONE_YEAR',
    groupLevel: 1,
  },
  {
    productId: 'org.bsa.campcard.subscription.annual.scout',
    name: 'Camp Card Annual - Scout',
    displayName: 'Camp Card Annual - Scout Referral',
    description: 'Annual subscription to the Camp Card digital fundraising platform at the special scout referral price.',
    duration: 'ONE_YEAR',
    groupLevel: 2,
  },
];

const CONSUMABLES = [
  {
    productId: 'org.bsa.campcard.cards.1',
    name: '1 Camp Card',
    displayName: '1 Camp Card',
    description: 'Purchase 1 digital Camp Card to support BSA fundraising. Each card gives you access to exclusive merchant offers.',
  },
  {
    productId: 'org.bsa.campcard.cards.3',
    name: '3 Camp Cards',
    displayName: '3 Camp Cards',
    description: 'Purchase 3 digital Camp Cards to support BSA fundraising. Each card gives you access to exclusive merchant offers.',
  },
  {
    productId: 'org.bsa.campcard.cards.5',
    name: '5 Camp Cards',
    displayName: '5 Camp Cards',
    description: 'Purchase 5 digital Camp Cards to support BSA fundraising. Each card gives you access to exclusive merchant offers.',
  },
  {
    productId: 'org.bsa.campcard.cards.10',
    name: '10 Camp Cards',
    displayName: '10 Camp Cards',
    description: 'Purchase 10 digital Camp Cards to support BSA fundraising. Each card gives you access to exclusive merchant offers.',
  },
];

// ── JWT Generation ───────────────────────────────────────────────────────────

function base64url(input) {
  const str = typeof input === 'string' ? input : input.toString('base64');
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateJWT() {
  const privateKey = readFileSync(KEY_PATH, 'utf8');
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const payload = {
    iss: ISSUER_ID,
    iat: now,
    exp: now + 1200, // 20 minutes
    aud: 'appstoreconnect-v1',
  };

  const encodedHeader = base64url(Buffer.from(JSON.stringify(header)).toString('base64'));
  const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)).toString('base64'));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const sign = createSign('SHA256');
  sign.update(signingInput);
  const derSignature = sign.sign(privateKey);

  // Convert DER-encoded ECDSA signature to raw r||s format (64 bytes)
  const rawSig = derToRaw(derSignature);
  const encodedSignature = base64url(rawSig.toString('base64'));

  return `${signingInput}.${encodedSignature}`;
}

function derToRaw(derSig) {
  // DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  let offset = 2; // skip 0x30 and total length
  if (derSig[1] & 0x80) offset += (derSig[1] & 0x7f); // handle extended length

  // Read r
  if (derSig[offset] !== 0x02) throw new Error('Invalid DER signature');
  offset++;
  const rLen = derSig[offset++];
  let r = derSig.subarray(offset, offset + rLen);
  offset += rLen;

  // Read s
  if (derSig[offset] !== 0x02) throw new Error('Invalid DER signature');
  offset++;
  const sLen = derSig[offset++];
  let s = derSig.subarray(offset, offset + sLen);

  // Trim leading zeros (DER may pad with 0x00 for positive sign)
  if (r.length === 33 && r[0] === 0) r = r.subarray(1);
  if (s.length === 33 && s[0] === 0) s = s.subarray(1);

  // Pad to 32 bytes each
  const raw = Buffer.alloc(64);
  r.copy(raw, 32 - r.length);
  s.copy(raw, 64 - s.length);
  return raw;
}

// ── ASC API Helpers ──────────────────────────────────────────────────────────

const BASE_URL = 'https://api.appstoreconnect.apple.com/v1';
const BASE_URL_V2 = 'https://api.appstoreconnect.apple.com/v2';
let token = generateJWT();

async function ascFetch(url, method = 'GET', body = null) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const text = await res.text();

  if (!res.ok) {
    console.error(`\n❌ ${method} ${url}`);
    console.error(`   Status: ${res.status}`);
    try {
      const errJson = JSON.parse(text);
      for (const e of errJson.errors || []) {
        console.error(`   Error: ${e.title} — ${e.detail}`);
        if (e.source) console.error(`   Source: ${JSON.stringify(e.source)}`);
      }
    } catch {
      console.error(`   Body: ${text.substring(0, 500)}`);
    }
    return null;
  }

  return text ? JSON.parse(text) : {};
}

// ── Step 1: Get the App resource ID ──────────────────────────────────────────

async function getAppResourceId() {
  console.log('\n📱 Looking up app resource ID...');
  const data = await ascFetch(`${BASE_URL}/apps?filter[bundleId]=org.bsa.campcard`);
  if (!data || !data.data?.length) {
    // Try by app ID directly
    const data2 = await ascFetch(`${BASE_URL}/apps/${APP_ID}`);
    if (data2?.data) {
      console.log(`   Found app: ${data2.data.attributes.name} (${data2.data.id})`);
      return data2.data.id;
    }
    throw new Error('Could not find app in App Store Connect');
  }
  const app = data.data[0];
  console.log(`   Found app: ${app.attributes.name} (${app.id})`);
  return app.id;
}

// ── Step 2: Create Subscription Group ────────────────────────────────────────

async function createSubscriptionGroup(appId) {
  console.log('\n📦 Creating subscription group: "Camp Card Annual"...');

  // Check if group already exists
  const existing = await ascFetch(`${BASE_URL}/apps/${appId}/subscriptionGroups`);
  if (existing?.data) {
    const found = existing.data.find(g => g.attributes.referenceName === SUBSCRIPTION_GROUP_NAME);
    if (found) {
      console.log(`   ✅ Group already exists (${found.id})`);
      return found.id;
    }
  }

  const body = {
    data: {
      type: 'subscriptionGroups',
      attributes: {
        referenceName: SUBSCRIPTION_GROUP_NAME,
      },
      relationships: {
        app: {
          data: { type: 'apps', id: appId },
        },
      },
    },
  };

  const result = await ascFetch(`${BASE_URL}/subscriptionGroups`, 'POST', body);
  if (!result) throw new Error('Failed to create subscription group');
  console.log(`   ✅ Created subscription group (${result.data.id})`);
  return result.data.id;
}

// ── Step 3: Create Subscriptions ─────────────────────────────────────────────

async function createSubscription(groupId, sub) {
  console.log(`\n🔄 Creating subscription: ${sub.productId}...`);

  // Check if it already exists
  const existing = await ascFetch(`${BASE_URL}/subscriptionGroups/${groupId}/subscriptions`);
  if (existing?.data) {
    const found = existing.data.find(s => s.attributes.productId === sub.productId);
    if (found) {
      console.log(`   ✅ Already exists (${found.id})`);
      return found.id;
    }
  }

  const body = {
    data: {
      type: 'subscriptions',
      attributes: {
        productId: sub.productId,
        name: sub.name,
        subscriptionPeriod: sub.duration,
        groupLevel: sub.groupLevel,
        familySharable: false,
        reviewNote: 'Annual subscription for BSA Camp Card digital fundraising platform.',
      },
      relationships: {
        group: {
          data: { type: 'subscriptionGroups', id: groupId },
        },
      },
    },
  };

  const result = await ascFetch(`${BASE_URL}/subscriptions`, 'POST', body);
  if (!result) {
    console.error(`   Failed to create subscription: ${sub.productId}`);
    return null;
  }
  console.log(`   ✅ Created subscription (${result.data.id})`);
  return result.data.id;
}

// ── Step 4: Add Subscription Localization ────────────────────────────────────

async function addSubscriptionLocalization(subscriptionId, sub) {
  console.log(`   📝 Adding en-US localization for ${sub.productId}...`);

  // Check existing localizations
  const existing = await ascFetch(`${BASE_URL}/subscriptions/${subscriptionId}/subscriptionLocalizations`);
  if (existing?.data) {
    const found = existing.data.find(l => l.attributes.locale === 'en-US');
    if (found) {
      console.log(`   ✅ Localization already exists`);
      return found.id;
    }
  }

  const body = {
    data: {
      type: 'subscriptionLocalizations',
      attributes: {
        name: sub.displayName,
        description: sub.description,
        locale: 'en-US',
      },
      relationships: {
        subscription: {
          data: { type: 'subscriptions', id: subscriptionId },
        },
      },
    },
  };

  const result = await ascFetch(`${BASE_URL}/subscriptionLocalizations`, 'POST', body);
  if (!result) {
    console.error(`   Failed to add localization`);
    return null;
  }
  console.log(`   ✅ Localization added`);
  return result.data.id;
}

// ── Step 5: Create Consumable IAP ────────────────────────────────────────────

async function createConsumable(appId, product) {
  console.log(`\n🛒 Creating consumable: ${product.productId}...`);

  // Check if it already exists
  const existing = await ascFetch(`${BASE_URL_V2}/apps/${appId}/inAppPurchases`);
  if (existing?.data) {
    const found = existing.data.find(p => p.attributes.productId === product.productId);
    if (found) {
      console.log(`   ✅ Already exists (${found.id})`);
      return found.id;
    }
  }

  const body = {
    data: {
      type: 'inAppPurchases',
      attributes: {
        productId: product.productId,
        name: product.name,
        inAppPurchaseType: 'CONSUMABLE',
        reviewNote: 'Digital Camp Card purchase for BSA fundraising.',
      },
      relationships: {
        app: {
          data: { type: 'apps', id: appId },
        },
      },
    },
  };

  const result = await ascFetch(`${BASE_URL_V2}/inAppPurchases`, 'POST', body);
  if (!result) {
    console.error(`   Failed to create consumable: ${product.productId}`);
    return null;
  }
  console.log(`   ✅ Created consumable (${result.data.id})`);
  return result.data.id;
}

// ── Step 6: Add Consumable Localization ──────────────────────────────────────

async function addConsumableLocalization(iapId, product) {
  console.log(`   📝 Adding en-US localization for ${product.productId}...`);

  // Check existing
  const existing = await ascFetch(`${BASE_URL}/inAppPurchases/${iapId}/inAppPurchaseLocalizations`);
  if (existing?.data) {
    const found = existing.data.find(l => l.attributes.locale === 'en-US');
    if (found) {
      console.log(`   ✅ Localization already exists`);
      return found.id;
    }
  }

  const body = {
    data: {
      type: 'inAppPurchaseLocalizations',
      attributes: {
        name: product.displayName,
        description: product.description,
        locale: 'en-US',
      },
      relationships: {
        inAppPurchase: {
          data: { type: 'inAppPurchases', id: iapId },
        },
      },
    },
  };

  const result = await ascFetch(`${BASE_URL}/inAppPurchaseLocalizations`, 'POST', body);
  if (!result) {
    console.error(`   Failed to add localization`);
    return null;
  }
  console.log(`   ✅ Localization added`);
  return result.data.id;
}

// ── Step 7: Set Subscription Price ───────────────────────────────────────────

async function setSubscriptionPrice(subscriptionId, pricePointId) {
  console.log(`   💰 Setting price...`);

  const body = {
    data: {
      type: 'subscriptionPrices',
      attributes: {
        startDate: null, // Start immediately
        preserveCurrentPrice: false,
      },
      relationships: {
        subscription: {
          data: { type: 'subscriptions', id: subscriptionId },
        },
        subscriptionPricePoint: {
          data: { type: 'subscriptionPricePoints', id: pricePointId },
        },
      },
    },
  };

  const result = await ascFetch(`${BASE_URL}/subscriptionPrices`, 'POST', body);
  if (!result) {
    console.error(`   Failed to set price`);
    return null;
  }
  console.log(`   ✅ Price set`);
  return result.data.id;
}

async function findSubscriptionPricePoint(subscriptionId, targetPriceCents) {
  console.log(`   🔍 Looking up price point for $${(targetPriceCents / 100).toFixed(2)}...`);

  // Get price points for USD territory
  let url = `${BASE_URL}/subscriptions/${subscriptionId}/pricePoints?filter[territory]=USA&include=territory`;
  let pricePoints = [];

  while (url) {
    const data = await ascFetch(url);
    if (!data?.data) break;
    pricePoints = pricePoints.concat(data.data);
    url = data.links?.next || null;
  }

  // Find matching price point
  const match = pricePoints.find(pp => {
    const cents = Math.round(parseFloat(pp.attributes.customerPrice) * 100);
    return cents === targetPriceCents;
  });

  if (match) {
    console.log(`   Found price point: ${match.id} ($${match.attributes.customerPrice})`);
  } else {
    console.error(`   Could not find price point for $${(targetPriceCents / 100).toFixed(2)}`);
    // List some available prices for debugging
    const sample = pricePoints.slice(0, 10).map(pp => `$${pp.attributes.customerPrice}`);
    console.log(`   Available prices (sample): ${sample.join(', ')}`);
  }

  return match;
}

// ── Step 8: Set Consumable Price ─────────────────────────────────────────────

async function findConsumablePricePoint(iapId, targetPriceCents) {
  console.log(`   🔍 Looking up price point for $${(targetPriceCents / 100).toFixed(2)}...`);

  let url = `${BASE_URL}/inAppPurchases/${iapId}/pricePoints?filter[territory]=USA&include=territory`;
  let pricePoints = [];

  while (url) {
    const data = await ascFetch(url);
    if (!data?.data) break;
    pricePoints = pricePoints.concat(data.data);
    url = data.links?.next || null;
  }

  const match = pricePoints.find(pp => {
    const cents = Math.round(parseFloat(pp.attributes.customerPrice) * 100);
    return cents === targetPriceCents;
  });

  if (match) {
    console.log(`   Found price point: ${match.id} ($${match.attributes.customerPrice})`);
  } else {
    console.error(`   Could not find price point for $${(targetPriceCents / 100).toFixed(2)}`);
    const sample = pricePoints.slice(0, 10).map(pp => `$${pp.attributes.customerPrice}`);
    console.log(`   Available prices (sample): ${sample.join(', ')}`);
  }

  return match;
}

async function setConsumablePrice(iapId, pricePointId) {
  console.log(`   💰 Setting price...`);

  const body = {
    data: {
      type: 'inAppPurchasePriceSchedules',
      attributes: {},
      relationships: {
        inAppPurchase: {
          data: { type: 'inAppPurchases', id: iapId },
        },
        manualPrices: {
          data: [
            { type: 'inAppPurchasePrices', id: '${price1}' },
          ],
        },
        baseTerritory: {
          data: { type: 'territories', id: 'USA' },
        },
      },
    },
    included: [
      {
        type: 'inAppPurchasePrices',
        id: '${price1}',
        attributes: {
          startDate: null,
        },
        relationships: {
          inAppPurchasePricePoint: {
            data: { type: 'inAppPurchasePricePoints', id: pricePointId },
          },
        },
      },
    ],
  };

  const result = await ascFetch(`${BASE_URL}/inAppPurchasePriceSchedules`, 'POST', body);
  if (!result) {
    console.error(`   Failed to set price schedule`);
    return null;
  }
  console.log(`   ✅ Price schedule set`);
  return result.data.id;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const SUBSCRIPTION_PRICES = {
  'org.bsa.campcard.subscription.annual': 1499,       // $14.99
  'org.bsa.campcard.subscription.annual.scout': 999,   // $9.99
};

const CONSUMABLE_PRICES = {
  'org.bsa.campcard.cards.1': 1499,    // $14.99
  'org.bsa.campcard.cards.3': 4499,    // $44.99
  'org.bsa.campcard.cards.5': 7499,    // $74.99
  'org.bsa.campcard.cards.10': 14999,  // $149.99
};

async function main() {
  console.log('🚀 App Store Connect — IAP Product Setup');
  console.log('=========================================');

  try {
    // Step 1: Get App ID
    const appId = await getAppResourceId();

    // Step 2: Create Subscription Group
    const groupId = await createSubscriptionGroup(appId);

    // Step 3: Create Subscriptions
    for (const sub of SUBSCRIPTIONS) {
      const subId = await createSubscription(groupId, sub);
      if (!subId) continue;

      // Add localization
      await addSubscriptionLocalization(subId, sub);

      // Set price
      const targetPrice = SUBSCRIPTION_PRICES[sub.productId];
      const pricePoint = await findSubscriptionPricePoint(subId, targetPrice);
      if (pricePoint) {
        await setSubscriptionPrice(subId, pricePoint.id);
      }
    }

    // Step 4: Create Consumable IAPs
    for (const product of CONSUMABLES) {
      const iapId = await createConsumable(appId, product);
      if (!iapId) continue;

      // Add localization
      await addConsumableLocalization(iapId, product);

      // Set price
      const targetPrice = CONSUMABLE_PRICES[product.productId];
      const pricePoint = await findConsumablePricePoint(iapId, targetPrice);
      if (pricePoint) {
        await setConsumablePrice(iapId, pricePoint.id);
      }
    }

    console.log('\n=========================================');
    console.log('✅ IAP product setup complete!');
    console.log('\nNext steps:');
    console.log('1. Go to App Store Connect to review the products');
    console.log('2. Add screenshots for each product (if needed for review)');
    console.log('3. Submit the products for review with your next app update');

  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main();
