#!/usr/bin/env node

/**
 * Fix IAP localizations and pricing.
 * Products already exist — this adds localizations (short descriptions) and sets prices.
 */

import { readFileSync } from 'fs';
import { createSign } from 'crypto';

// ── Credentials ──────────────────────────────────────────────────────────────
const KEY_ID = '4R7M7YPC9Q';
const ISSUER_ID = '51541aa3-d401-43f0-9244-976dbad0ec07';
const KEY_PATH = '/Users/papajr/Downloads/AuthKey_4R7M7YPC9Q.p8';
const APP_ID = '6758056347';

// ── Product IDs (from creation step) ─────────────────────────────────────────
const SUBSCRIPTION_IDS = {
  'org.bsa.campcard.subscription.annual': '6758740925',
  'org.bsa.campcard.subscription.annual.scout': '6758740950',
};

const CONSUMABLE_IDS = {
  'org.bsa.campcard.cards.1': '6758740951',
  'org.bsa.campcard.cards.3': '6758740850',
  'org.bsa.campcard.cards.5': '6758740985',
  'org.bsa.campcard.cards.10': '6758741061',
};

// ── Localizations (descriptions max 55 chars for subscriptions) ──────────────
const SUBSCRIPTION_LOCALIZATIONS = {
  'org.bsa.campcard.subscription.annual': {
    name: 'Camp Card Annual Subscription',
    description: 'Annual BSA Camp Card digital fundraising access',  // 47 chars
  },
  'org.bsa.campcard.subscription.annual.scout': {
    name: 'Camp Card Annual - Scout Referral',
    description: 'Annual Camp Card access at scout referral price',  // 48 chars
  },
};

const CONSUMABLE_LOCALIZATIONS = {
  'org.bsa.campcard.cards.1': {
    name: '1 Camp Card',
    description: 'Purchase 1 digital Camp Card for BSA fundraising with access to exclusive merchant offers.',
  },
  'org.bsa.campcard.cards.3': {
    name: '3 Camp Cards',
    description: 'Purchase 3 digital Camp Cards for BSA fundraising with access to exclusive merchant offers.',
  },
  'org.bsa.campcard.cards.5': {
    name: '5 Camp Cards',
    description: 'Purchase 5 digital Camp Cards for BSA fundraising with access to exclusive merchant offers.',
  },
  'org.bsa.campcard.cards.10': {
    name: '10 Camp Cards',
    description: 'Purchase 10 digital Camp Cards for BSA fundraising with access to exclusive merchant offers.',
  },
};

// ── Prices ───────────────────────────────────────────────────────────────────
const SUBSCRIPTION_PRICES = {
  'org.bsa.campcard.subscription.annual': 1499,
  'org.bsa.campcard.subscription.annual.scout': 999,
};

const CONSUMABLE_PRICES = {
  'org.bsa.campcard.cards.1': 1499,
  'org.bsa.campcard.cards.3': 4499,
  'org.bsa.campcard.cards.5': 7499,
  'org.bsa.campcard.cards.10': 14999,
};

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
    exp: now + 1200,
    aud: 'appstoreconnect-v1',
  };

  const encodedHeader = base64url(Buffer.from(JSON.stringify(header)).toString('base64'));
  const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)).toString('base64'));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const sign = createSign('SHA256');
  sign.update(signingInput);
  const derSignature = sign.sign(privateKey);

  const rawSig = derToRaw(derSignature);
  const encodedSignature = base64url(rawSig.toString('base64'));

  return `${signingInput}.${encodedSignature}`;
}

function derToRaw(derSig) {
  let offset = 2;
  if (derSig[1] & 0x80) offset += (derSig[1] & 0x7f);

  if (derSig[offset] !== 0x02) throw new Error('Invalid DER signature');
  offset++;
  const rLen = derSig[offset++];
  let r = derSig.subarray(offset, offset + rLen);
  offset += rLen;

  if (derSig[offset] !== 0x02) throw new Error('Invalid DER signature');
  offset++;
  const sLen = derSig[offset++];
  let s = derSig.subarray(offset, offset + sLen);

  if (r.length === 33 && r[0] === 0) r = r.subarray(1);
  if (s.length === 33 && s[0] === 0) s = s.subarray(1);

  const raw = Buffer.alloc(64);
  r.copy(raw, 32 - r.length);
  s.copy(raw, 64 - s.length);
  return raw;
}

// ── ASC API Helpers ──────────────────────────────────────────────────────────

const BASE = 'https://api.appstoreconnect.apple.com';
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
    console.error(`\n  ❌ ${method} ${url}`);
    console.error(`     Status: ${res.status}`);
    try {
      const errJson = JSON.parse(text);
      for (const e of errJson.errors || []) {
        console.error(`     Error: ${e.title} — ${e.detail}`);
      }
    } catch {
      console.error(`     Body: ${text.substring(0, 500)}`);
    }
    return null;
  }

  return text ? JSON.parse(text) : {};
}

// ── Fix Subscription Localizations ───────────────────────────────────────────

async function fixSubscriptionLocalizations() {
  console.log('\n📝 Fixing subscription localizations...');

  for (const [productId, subId] of Object.entries(SUBSCRIPTION_IDS)) {
    const loc = SUBSCRIPTION_LOCALIZATIONS[productId];
    console.log(`\n   ${productId}:`);

    // Check existing localizations
    const existing = await ascFetch(`${BASE}/v1/subscriptions/${subId}/subscriptionLocalizations`);
    if (existing?.data?.length) {
      const enUS = existing.data.find(l => l.attributes.locale === 'en-US');
      if (enUS) {
        // Update existing localization
        console.log(`   Updating existing en-US localization (${enUS.id})...`);
        const result = await ascFetch(`${BASE}/v1/subscriptionLocalizations/${enUS.id}`, 'PATCH', {
          data: {
            type: 'subscriptionLocalizations',
            id: enUS.id,
            attributes: {
              name: loc.name,
              description: loc.description,
            },
          },
        });
        if (result) console.log(`   ✅ Updated localization`);
        continue;
      }
    }

    // Create new localization
    const result = await ascFetch(`${BASE}/v1/subscriptionLocalizations`, 'POST', {
      data: {
        type: 'subscriptionLocalizations',
        attributes: {
          name: loc.name,
          description: loc.description,
          locale: 'en-US',
        },
        relationships: {
          subscription: {
            data: { type: 'subscriptions', id: subId },
          },
        },
      },
    });
    if (result) console.log(`   ✅ Created localization`);
  }
}

// ── Fix Consumable Localizations (use inAppPurchaseV2 relationship) ──────────

async function fixConsumableLocalizations() {
  console.log('\n📝 Fixing consumable localizations...');

  for (const [productId, iapId] of Object.entries(CONSUMABLE_IDS)) {
    const loc = CONSUMABLE_LOCALIZATIONS[productId];
    console.log(`\n   ${productId}:`);

    // Check existing using v2 endpoint
    const existing = await ascFetch(`${BASE}/v2/inAppPurchases/${iapId}/inAppPurchaseLocalizations`);
    if (existing?.data?.length) {
      const enUS = existing.data.find(l => l.attributes.locale === 'en-US');
      if (enUS) {
        console.log(`   Updating existing en-US localization (${enUS.id})...`);
        const result = await ascFetch(`${BASE}/v1/inAppPurchaseLocalizations/${enUS.id}`, 'PATCH', {
          data: {
            type: 'inAppPurchaseLocalizations',
            id: enUS.id,
            attributes: {
              name: loc.name,
              description: loc.description,
            },
          },
        });
        if (result) console.log(`   ✅ Updated localization`);
        continue;
      }
    }

    // Create new localization with inAppPurchaseV2 relationship
    const result = await ascFetch(`${BASE}/v1/inAppPurchaseLocalizations`, 'POST', {
      data: {
        type: 'inAppPurchaseLocalizations',
        attributes: {
          name: loc.name,
          description: loc.description,
          locale: 'en-US',
        },
        relationships: {
          inAppPurchaseV2: {
            data: { type: 'inAppPurchases', id: iapId },
          },
        },
      },
    });
    if (result) console.log(`   ✅ Created localization`);
  }
}

// ── Set Subscription Prices ──────────────────────────────────────────────────

async function setSubscriptionPrices() {
  console.log('\n💰 Setting subscription prices...');

  for (const [productId, subId] of Object.entries(SUBSCRIPTION_IDS)) {
    const targetCents = SUBSCRIPTION_PRICES[productId];
    console.log(`\n   ${productId} → $${(targetCents / 100).toFixed(2)}:`);

    // Check if price already set
    const existingPrices = await ascFetch(`${BASE}/v1/subscriptions/${subId}/prices?include=subscriptionPricePoint`);
    if (existingPrices?.data?.length) {
      console.log(`   Price already set (${existingPrices.data.length} price entries)`);
      continue;
    }

    // Find the matching price point
    let pricePoint = null;
    let url = `${BASE}/v1/subscriptions/${subId}/pricePoints?filter[territory]=USA`;
    let attempts = 0;

    while (url && !pricePoint && attempts < 20) {
      attempts++;
      const data = await ascFetch(url);
      if (!data?.data) break;

      for (const pp of data.data) {
        const cents = Math.round(parseFloat(pp.attributes.customerPrice) * 100);
        if (cents === targetCents) {
          pricePoint = pp;
          break;
        }
      }

      url = data.links?.next || null;
    }

    if (!pricePoint) {
      console.error(`   Could not find price point for $${(targetCents / 100).toFixed(2)}`);
      continue;
    }

    console.log(`   Found price point: ${pricePoint.id}`);

    // Set the price using subscription price schedule
    const result = await ascFetch(`${BASE}/v1/subscriptionPrices`, 'POST', {
      data: {
        type: 'subscriptionPrices',
        attributes: {
          startDate: null,
          preserveCurrentPrice: false,
        },
        relationships: {
          subscription: {
            data: { type: 'subscriptions', id: subId },
          },
          subscriptionPricePoint: {
            data: { type: 'subscriptionPricePoints', id: pricePoint.id },
          },
        },
      },
    });

    if (result) {
      console.log(`   ✅ Price set to $${(targetCents / 100).toFixed(2)}`);
    }
  }
}

// ── Set Consumable Prices ────────────────────────────────────────────────────

async function setConsumablePrices() {
  console.log('\n💰 Setting consumable prices...');

  for (const [productId, iapId] of Object.entries(CONSUMABLE_IDS)) {
    const targetCents = CONSUMABLE_PRICES[productId];
    console.log(`\n   ${productId} → $${(targetCents / 100).toFixed(2)}:`);

    // Check if price schedule already exists
    const existingSchedule = await ascFetch(`${BASE}/v2/inAppPurchases/${iapId}/iapPriceSchedule`);
    if (existingSchedule?.data) {
      console.log(`   Price schedule already exists`);
      continue;
    }

    // Find the matching price point using v2 endpoint
    let pricePoint = null;
    let url = `${BASE}/v2/inAppPurchases/${iapId}/pricePoints?filter[territory]=USA`;
    let attempts = 0;

    while (url && !pricePoint && attempts < 20) {
      attempts++;
      const data = await ascFetch(url);
      if (!data?.data) break;

      for (const pp of data.data) {
        const cents = Math.round(parseFloat(pp.attributes.customerPrice) * 100);
        if (cents === targetCents) {
          pricePoint = pp;
          break;
        }
      }

      url = data.links?.next || null;
    }

    if (!pricePoint) {
      console.error(`   Could not find price point for $${(targetCents / 100).toFixed(2)}`);
      continue;
    }

    console.log(`   Found price point: ${pricePoint.id}`);

    // Create price schedule with inline price
    const result = await ascFetch(`${BASE}/v1/inAppPurchasePriceSchedules`, 'POST', {
      data: {
        type: 'inAppPurchasePriceSchedules',
        relationships: {
          inAppPurchase: {
            data: { type: 'inAppPurchases', id: iapId },
          },
          baseTerritory: {
            data: { type: 'territories', id: 'USA' },
          },
          manualPrices: {
            data: [
              { type: 'inAppPurchasePrices', id: '${price1}' },
            ],
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
              data: { type: 'inAppPurchasePricePoints', id: pricePoint.id },
            },
          },
        },
      ],
    });

    if (result) {
      console.log(`   ✅ Price set to $${(targetCents / 100).toFixed(2)}`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔧 Fixing IAP Localizations & Pricing');
  console.log('======================================');

  await fixSubscriptionLocalizations();
  await fixConsumableLocalizations();
  await setSubscriptionPrices();
  await setConsumablePrices();

  console.log('\n======================================');
  console.log('Done! Check App Store Connect for results.');
}

main();
