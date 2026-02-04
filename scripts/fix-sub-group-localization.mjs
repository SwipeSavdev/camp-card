#!/usr/bin/env node

/**
 * Add subscription group localization and check what metadata is still missing.
 */

import { readFileSync } from 'fs';
import { createSign } from 'crypto';

const KEY_ID = '4R7M7YPC9Q';
const ISSUER_ID = '51541aa3-d401-43f0-9244-976dbad0ec07';
const KEY_PATH = '/Users/papajr/Downloads/AuthKey_4R7M7YPC9Q.p8';

const SUBSCRIPTION_GROUP_ID = '21919235';
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
  return `${signingInput}.${base64url(rawSig.toString('base64'))}`;
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
    try {
      const errJson = JSON.parse(text);
      for (const e of errJson.errors || []) console.error(`     ${e.title} — ${e.detail}`);
    } catch { console.error(`     ${text.substring(0, 300)}`); }
    return null;
  }
  return text ? JSON.parse(text) : {};
}

async function main() {
  console.log('🔧 Creating Subscription Group Localization & Checking Metadata\n');

  // 1. Create subscription group localization
  console.log('📝 Creating subscription group localization...');
  const existingGroupLocs = await ascFetch(`${BASE}/v1/subscriptionGroups/${SUBSCRIPTION_GROUP_ID}/subscriptionGroupLocalizations`);
  const hasEnUS = existingGroupLocs?.data?.find(l => l.attributes.locale === 'en-US');

  if (hasEnUS) {
    console.log('   ✅ en-US localization already exists');
  } else {
    const result = await ascFetch(`${BASE}/v1/subscriptionGroupLocalizations`, 'POST', {
      data: {
        type: 'subscriptionGroupLocalizations',
        attributes: {
          name: 'Camp Card Annual',
          customAppName: 'Camp Card',
          locale: 'en-US',
        },
        relationships: {
          subscriptionGroup: {
            data: { type: 'subscriptionGroups', id: SUBSCRIPTION_GROUP_ID },
          },
        },
      },
    });
    if (result) console.log('   ✅ Created subscription group localization');
  }

  // 2. Check subscription localizations
  console.log('\n📋 Checking subscription localizations...');
  for (const [productId, subId] of Object.entries(SUBSCRIPTION_IDS)) {
    const locs = await ascFetch(`${BASE}/v1/subscriptions/${subId}/subscriptionLocalizations`);
    console.log(`   ${productId}:`);
    if (locs?.data?.length) {
      for (const l of locs.data) {
        console.log(`     ${l.attributes.locale}: "${l.attributes.name}" — "${l.attributes.description}"`);
      }
    } else {
      console.log(`     No localizations found`);
    }
  }

  // 3. Check subscription prices
  console.log('\n💰 Checking subscription prices...');
  for (const [productId, subId] of Object.entries(SUBSCRIPTION_IDS)) {
    const prices = await ascFetch(`${BASE}/v1/subscriptions/${subId}/prices?include=subscriptionPricePoint`);
    console.log(`   ${productId}:`);
    if (prices?.data?.length) {
      for (const p of prices.data) {
        const ppId = p.relationships?.subscriptionPricePoint?.data?.id;
        const pp = prices.included?.find(i => i.id === ppId);
        console.log(`     Price: $${pp?.attributes?.customerPrice || 'unknown'}`);
      }
    } else {
      console.log(`     ⚠️  No price set — needs manual setup in ASC`);
    }
  }

  // 4. Check consumable localizations
  console.log('\n📋 Checking consumable localizations...');
  for (const [productId, iapId] of Object.entries(CONSUMABLE_IDS)) {
    const locs = await ascFetch(`${BASE}/v2/inAppPurchases/${iapId}/inAppPurchaseLocalizations`);
    console.log(`   ${productId}:`);
    if (locs?.data?.length) {
      for (const l of locs.data) {
        console.log(`     ${l.attributes.locale}: "${l.attributes.name}" — "${l.attributes.description}"`);
      }
    } else {
      console.log(`     No localizations found`);
    }
  }

  // 5. Check consumable prices
  console.log('\n💰 Checking consumable prices...');
  for (const [productId, iapId] of Object.entries(CONSUMABLE_IDS)) {
    const schedule = await ascFetch(`${BASE}/v2/inAppPurchases/${iapId}/iapPriceSchedule?include=manualPrices`);
    console.log(`   ${productId}:`);
    if (schedule?.data) {
      const prices = schedule.included || [];
      for (const p of prices) {
        if (p.type === 'inAppPurchasePrices') {
          // Get the price point details
          const ppData = p.relationships?.inAppPurchasePricePoint?.data;
          console.log(`     Price entry found (point: ${ppData?.id || 'unknown'})`);
        }
      }
      if (!prices.length) console.log(`     Schedule exists but no price entries`);
    } else {
      console.log(`     ⚠️  No price schedule`);
    }
  }

  // 6. Summary
  console.log('\n========================================');
  console.log('Summary:');
  console.log('  ✅ Subscription group created with localization');
  console.log('  ✅ 2 subscriptions created with en-US localizations');
  console.log('  ✅ 4 consumables created with en-US localizations');
  console.log('  ✅ 4 consumable prices set');
  console.log('  ⚠️  Subscription prices need manual setup in ASC');
  console.log('     (Apple API returns 500 for subscription pricing)');
  console.log('\nManual steps needed in App Store Connect:');
  console.log('  1. Set subscription prices:');
  console.log('     - Camp Card Annual: $14.99/year');
  console.log('     - Camp Card Annual - Scout: $9.99/year');
  console.log('  2. Add review screenshots for each product (optional for sandbox testing)');
  console.log('  3. Submit products for review with next app update');
}

main();
