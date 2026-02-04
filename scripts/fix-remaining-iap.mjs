#!/usr/bin/env node

/**
 * Fix remaining IAP issues:
 * 1. Consumable localizations (55 char max description)
 * 2. Subscription pricing (try alternative approach)
 */

import { readFileSync } from 'fs';
import { createSign } from 'crypto';

const KEY_ID = '4R7M7YPC9Q';
const ISSUER_ID = '51541aa3-d401-43f0-9244-976dbad0ec07';
const KEY_PATH = '/Users/papajr/Downloads/AuthKey_4R7M7YPC9Q.p8';

const CONSUMABLE_IDS = {
  'org.bsa.campcard.cards.1': '6758740951',
  'org.bsa.campcard.cards.3': '6758740850',
  'org.bsa.campcard.cards.5': '6758740985',
  'org.bsa.campcard.cards.10': '6758741061',
};

const SUBSCRIPTION_IDS = {
  'org.bsa.campcard.subscription.annual': '6758740925',
  'org.bsa.campcard.subscription.annual.scout': '6758740950',
};

// Descriptions must be 55 chars or less!
const CONSUMABLE_LOCALIZATIONS = {
  'org.bsa.campcard.cards.1': {
    name: '1 Camp Card',
    description: '1 digital Camp Card for BSA fundraising',  // 40 chars
  },
  'org.bsa.campcard.cards.3': {
    name: '3 Camp Cards',
    description: '3 digital Camp Cards for BSA fundraising', // 41 chars
  },
  'org.bsa.campcard.cards.5': {
    name: '5 Camp Cards',
    description: '5 digital Camp Cards for BSA fundraising', // 41 chars
  },
  'org.bsa.campcard.cards.10': {
    name: '10 Camp Cards',
    description: '10 digital Camp Cards for BSA fundraising', // 42 chars
  },
};

const SUBSCRIPTION_PRICES = {
  'org.bsa.campcard.subscription.annual': 1499,
  'org.bsa.campcard.subscription.annual.scout': 999,
};

// ── JWT ──────────────────────────────────────────────────────────────────────

function base64url(input) {
  const str = typeof input === 'string' ? input : input.toString('base64');
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateJWT() {
  const privateKey = readFileSync(KEY_PATH, 'utf8');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
  const payload = { iss: ISSUER_ID, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' };
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
  if (derSig[offset] !== 0x02) throw new Error('Invalid DER');
  offset++;
  const rLen = derSig[offset++];
  let r = derSig.subarray(offset, offset + rLen);
  offset += rLen;
  if (derSig[offset] !== 0x02) throw new Error('Invalid DER');
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

// ── API ──────────────────────────────────────────────────────────────────────

const BASE = 'https://api.appstoreconnect.apple.com';
let token = generateJWT();

async function ascFetch(url, method = 'GET', body = null) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) {
    console.error(`  ❌ ${method} ${url.replace(BASE, '')}`);
    console.error(`     Status: ${res.status}`);
    try {
      const errJson = JSON.parse(text);
      for (const e of errJson.errors || []) {
        console.error(`     ${e.title} — ${e.detail}`);
      }
    } catch {
      console.error(`     ${text.substring(0, 300)}`);
    }
    return null;
  }
  return text ? JSON.parse(text) : {};
}

// ── Fix Consumable Localizations ─────────────────────────────────────────────

async function fixConsumableLocalizations() {
  console.log('\n📝 Creating consumable localizations (short descriptions)...');

  for (const [productId, iapId] of Object.entries(CONSUMABLE_IDS)) {
    const loc = CONSUMABLE_LOCALIZATIONS[productId];
    console.log(`\n   ${productId}:`);
    console.log(`   Description (${loc.description.length} chars): "${loc.description}"`);

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

// ── Fix Subscription Pricing ─────────────────────────────────────────────────

async function fixSubscriptionPrices() {
  console.log('\n💰 Setting subscription prices (alternative approach)...');

  for (const [productId, subId] of Object.entries(SUBSCRIPTION_IDS)) {
    const targetCents = SUBSCRIPTION_PRICES[productId];
    console.log(`\n   ${productId} → $${(targetCents / 100).toFixed(2)}:`);

    // First, check if there are existing prices
    const existingPrices = await ascFetch(`${BASE}/v1/subscriptions/${subId}/prices`);
    if (existingPrices?.data?.length > 0) {
      console.log(`   Already has ${existingPrices.data.length} price(s) set`);
      continue;
    }

    // Find the matching price point for USA
    let pricePoint = null;
    let url = `${BASE}/v1/subscriptions/${subId}/pricePoints?filter[territory]=USA`;
    let page = 0;

    while (url && !pricePoint && page < 30) {
      page++;
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
      console.error(`   Could not find price point`);
      continue;
    }

    console.log(`   Found price point: ${pricePoint.id} ($${pricePoint.attributes.customerPrice})`);

    // Try with explicit territory relationship
    const result = await ascFetch(`${BASE}/v1/subscriptionPrices`, 'POST', {
      data: {
        type: 'subscriptionPrices',
        attributes: {
          preserveCurrentPrice: false,
        },
        relationships: {
          subscription: {
            data: { type: 'subscriptions', id: subId },
          },
          subscriptionPricePoint: {
            data: { type: 'subscriptionPricePoints', id: pricePoint.id },
          },
          territory: {
            data: { type: 'territories', id: 'USA' },
          },
        },
      },
    });

    if (result) {
      console.log(`   ✅ Price set to $${(targetCents / 100).toFixed(2)}`);
    } else {
      // Try alternate: startDate as empty string
      console.log(`   Trying alternate approach...`);
      const result2 = await ascFetch(`${BASE}/v1/subscriptionPrices`, 'POST', {
        data: {
          type: 'subscriptionPrices',
          attributes: {
            startDate: null,
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
      if (result2) {
        console.log(`   ✅ Price set (alternate)`);
      }
    }
  }
}

// ── Verify All Products ──────────────────────────────────────────────────────

async function verifyProducts() {
  console.log('\n📋 Verifying all products...');

  // Verify subscriptions
  for (const [productId, subId] of Object.entries(SUBSCRIPTION_IDS)) {
    const sub = await ascFetch(`${BASE}/v1/subscriptions/${subId}`);
    if (sub?.data) {
      console.log(`\n   ✅ ${productId}:`);
      console.log(`      State: ${sub.data.attributes.state}`);
      console.log(`      Name: ${sub.data.attributes.name}`);
      console.log(`      Period: ${sub.data.attributes.subscriptionPeriod}`);
    }
  }

  // Verify consumables
  for (const [productId, iapId] of Object.entries(CONSUMABLE_IDS)) {
    const iap = await ascFetch(`${BASE}/v2/inAppPurchases/${iapId}`);
    if (iap?.data) {
      console.log(`\n   ✅ ${productId}:`);
      console.log(`      State: ${iap.data.attributes.state}`);
      console.log(`      Name: ${iap.data.attributes.name}`);
      console.log(`      Type: ${iap.data.attributes.inAppPurchaseType}`);
    }
  }
}

async function main() {
  console.log('🔧 Fixing Remaining IAP Issues');
  console.log('================================');

  await fixConsumableLocalizations();
  await fixSubscriptionPrices();
  await verifyProducts();

  console.log('\n================================');
  console.log('Done!');
}

main();
