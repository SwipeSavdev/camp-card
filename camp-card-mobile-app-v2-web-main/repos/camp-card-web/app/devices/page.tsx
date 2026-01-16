'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api as _api } from '@/lib/api';
import PageLayout from '../components/PageLayout';

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  text: '#1f2937',
  primary50: '#eff6ff',
  primary100: '#dbeafe',
  primary200: '#bfdbfe',
  primary300: '#93c5fd',
  primary600: '#2563eb',
  primary800: '#1e40af',
  primary900: '#1e3a8a',
  success50: '#f0fdf4',
  success200: '#bbf7d0',
  success600: '#16a34a',
  warning50: '#fefce8',
  warning200: '#fef08a',
  warning600: '#eab308',
  info50: '#f0f9ff',
  info200: '#bae6fd',
  info600: '#0284c7',
  error400: '#f87171',
  error500: '#ef4444',
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px',
};
const themeRadius = { sm: '4px', card: '12px', lg: '16px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: { [key: string]: any } = {
    add: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
         </svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>,
    delete: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
            </svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
            </svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
       </svg>,
    device: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
           </svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
           </svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>,
    link: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>,
  };
  return icons[name] || null;
}

// Device manufacturer and model data with requirements
interface DeviceModel {
  model: string;
  category: string;
  platform: string;
  integration: string;
  deployment: string;
  notes: string;
  sourceUrl: string;
  requirements: string[];
}

interface DeviceManufacturer {
  name: string;
  models: DeviceModel[];
}

// Complete device catalog with requirements
const DEVICE_CATALOG: DeviceManufacturer[] = [
  {
    name: 'Verifone',
    models: [
      {
        model: 'M400',
        category: 'Multimedia multilane device / PIN pad',
        platform: 'Verifone Engage family (platform)',
        integration: 'Semi-integrated to POS; lane mounting options',
        deployment: 'Attended lane checkout',
        notes: 'Marketed for multilane environments and tier-one retailers.',
        sourceUrl: 'https://www.verifone.com/en/us/countertop-s-pin-pads-multilane/verifone-m400',
        requirements: [
          'Verifone Engage platform SDK integration',
          'Ethernet or USB connectivity to POS',
          'Lane mounting hardware (optional)',
          'Verifone certified payment application',
          'PCI PTS 5.x compliance validation',
        ],
      },
      {
        model: 'M440',
        category: 'Multimedia multilane kiosk device',
        platform: 'Verifone Engage family (platform)',
        integration: 'Kiosk mounting; semi-integrated to POS/kiosk controller',
        deployment: 'Self-checkout / kiosk (and lanes)',
        notes: 'Explicitly positioned for self-checkout and guest check-in/payment.',
        sourceUrl: 'https://www.verifone.com/en/us/countertop-s-pin-pads-multilane/verifone-m440',
        requirements: [
          'Kiosk mounting bracket and hardware',
          'Verifone Engage platform SDK',
          'Self-checkout controller integration',
          'ADA compliance positioning',
          'Network connectivity (Ethernet preferred)',
        ],
      },
      {
        model: 'MX 915',
        category: 'Multilane multimedia payment terminal',
        platform: 'Linux-based OS',
        integration: 'Semi-integrated to POS; lane/countertop deployment',
        deployment: 'Attended lane checkout',
        notes: 'Lane/countertop design; supports modern payment technologies.',
        sourceUrl: 'https://www.verifone.com/en/us/devices/multilane/mx-915',
        requirements: [
          'Verifone MX platform SDK',
          'RS232/USB/Ethernet connectivity',
          'PCI PTS compliance',
          'Semi-integrated POS software',
          'Secure key injection',
        ],
      },
      {
        model: 'MX 925',
        category: 'Multilane multimedia payment terminal',
        platform: 'Linux-based OS',
        integration: 'Semi-integrated to POS; lane deployment',
        deployment: 'Attended lane checkout',
        notes: 'Multilane terminal family (MX series).',
        sourceUrl: 'https://www.verifone.com/en/devices/multilane/mx-925',
        requirements: [
          'Verifone MX platform SDK',
          'Lane mounting hardware',
          'Ethernet/USB connectivity',
          'EMV L1/L2 certification',
          'Contactless reader configuration',
        ],
      },
      {
        model: 'T650c',
        category: 'Countertop',
        platform: 'Verifone platform',
        integration: 'Standard countertop deployment',
        deployment: 'Countertop POS',
        notes: 'Countertop terminal for small to medium businesses.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'IP/Dial connectivity',
          'Power adapter',
          'Merchant account configuration',
          'Terminal ID/Merchant ID setup',
          'Payment application download',
        ],
      },
      {
        model: 'T650p',
        category: 'Portable',
        platform: 'Verifone platform',
        integration: 'Portable deployment with base station',
        deployment: 'Portable/tableside',
        notes: 'Portable version for tableside service.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Wi-Fi or base station connectivity',
          'Battery charging dock',
          'Portable mounting accessories',
          'Wireless network configuration',
        ],
      },
      {
        model: 'V200c',
        category: 'Countertop',
        platform: 'Verifone platform',
        integration: 'Countertop integration',
        deployment: 'Countertop POS',
        notes: 'Compact countertop terminal.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Ethernet/Dial connectivity',
          'Countertop stand',
          'Power supply',
          'TMS configuration',
        ],
      },
      {
        model: 'V400c',
        category: 'Countertop',
        platform: 'Verifone platform',
        integration: 'Countertop integration',
        deployment: 'Countertop POS',
        notes: 'Full-featured countertop terminal with color display.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Ethernet/Wi-Fi/Dial connectivity',
          'Printer paper rolls',
          'Power supply',
          'Application download via TMS',
        ],
      },
      {
        model: 'V200m',
        category: 'Portable',
        platform: 'Verifone platform',
        integration: 'Portable wireless deployment',
        deployment: 'Portable/mobile',
        notes: 'Portable wireless terminal.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Wi-Fi or cellular connectivity',
          'Battery management',
          'Charging base station',
          'Wireless security configuration',
        ],
      },
      {
        model: 'V400m',
        category: 'Portable',
        platform: 'Verifone platform',
        integration: 'Portable wireless deployment',
        deployment: 'Portable/mobile',
        notes: 'Advanced portable wireless terminal.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Wi-Fi/4G LTE connectivity',
          'Battery and charging dock',
          'SIM card (if cellular)',
          'Mobile application configuration',
        ],
      },
      {
        model: 'V240m',
        category: 'Mobile',
        platform: 'Verifone platform',
        integration: 'Mobile mPOS deployment',
        deployment: 'Mobile payment',
        notes: 'Mobile payment device.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Bluetooth pairing with host device',
          'Mobile POS app integration',
          'Battery charging',
          'Secure Bluetooth configuration',
        ],
      },
      {
        model: 'V640m',
        category: 'Mobile',
        platform: 'Verifone platform',
        integration: 'Mobile mPOS deployment',
        deployment: 'Mobile payment',
        notes: 'Advanced mobile payment device.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Bluetooth/Wi-Fi connectivity',
          'Mobile app SDK integration',
          'USB charging',
          'Host device compatibility check',
        ],
      },
      {
        model: 'e280',
        category: 'mPOS / Mobile PIN Pad',
        platform: 'Verifone platform',
        integration: 'mPOS integration',
        deployment: 'Mobile payment acceptance',
        notes: 'Mobile PIN pad for mPOS solutions.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Bluetooth 4.0+ pairing',
          'iOS/Android SDK integration',
          'Battery charging cable',
          'mPOS application certification',
        ],
      },
      {
        model: 'e285',
        category: 'mPOS / Mobile PIN Pad',
        platform: 'Verifone platform',
        integration: 'mPOS integration',
        deployment: 'Mobile payment acceptance',
        notes: 'Enhanced mobile PIN pad.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Bluetooth LE connectivity',
          'Mobile SDK integration',
          'USB-C charging',
          'EMV contactless certification',
        ],
      },
      {
        model: 'P200',
        category: 'PIN Pad',
        platform: 'Verifone platform',
        integration: 'Semi-integrated PIN pad',
        deployment: 'PIN entry device',
        notes: 'Customer-facing PIN pad.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'RS232/USB to POS connection',
          'PIN encryption key injection',
          'PCI PTS certification',
          'Mounting hardware',
        ],
      },
      {
        model: 'P400',
        category: 'PIN Pad',
        platform: 'Verifone platform',
        integration: 'Semi-integrated PIN pad',
        deployment: 'PIN entry device',
        notes: 'Full-featured PIN pad with color display.',
        sourceUrl: 'https://www.verifone.com',
        requirements: [
          'Ethernet/USB connectivity',
          'Signature capture configuration',
          'PCI PTS 5.x compliance',
          'Customer-facing mounting',
        ],
      },
    ],
  },
  {
    name: 'Ingenico',
    models: [
      {
        model: 'Lane/3600',
        category: 'Retail PIN pad',
        platform: 'Telium TETRA',
        integration: 'Semi-integrated to POS; mounting accessories',
        deployment: 'Attended lane checkout (compact) / self-checkout',
        notes: 'Retail PIN pad used at lanes and self-checkout touchpoints.',
        sourceUrl: 'https://ingenico.com/us-en/products-services/payment-terminals/tetra/lane3600',
        requirements: [
          'Telium TETRA SDK integration',
          'Ethernet/USB/RS232 connectivity',
          'Lane mounting hardware',
          'EMV L1/L2 certification',
          'Ingenico payment application',
        ],
      },
      {
        model: 'Lane/5000',
        category: 'Retail PIN pad',
        platform: 'Telium TETRA',
        integration: 'Semi-integrated to POS; Ethernet/USB/RS232 (varies)',
        deployment: 'Attended lane checkout',
        notes: 'Designed for intensive retail usage and fast checkout.',
        sourceUrl: 'https://ingenico.com/sites/default/files/resource-document/2024-05/USA-CAN_DATASHEET_LANE_5000_ING_240205.pdf',
        requirements: [
          'High-speed Ethernet connectivity',
          'Telium TETRA platform',
          'Retail POS integration',
          'High-volume transaction support',
          'Extended warranty recommended',
        ],
      },
      {
        model: 'Lane/7000',
        category: 'Retail PIN pad (large touchscreen)',
        platform: 'Telium TETRA',
        integration: 'Semi-integrated to POS; lane mounting',
        deployment: 'Attended lane checkout',
        notes: 'Lane series for demanding retail environments; long-term compliance positioning.',
        sourceUrl: 'https://ingenico.com/sites/default/files/resource-document/2022-11/USA-CAN_DATASHEET_LANE_7000_ING_221101.pdf',
        requirements: [
          'Large display configuration',
          'Touchscreen calibration',
          'Lane pole mount hardware',
          'Customer engagement app configuration',
          'Digital signage support (optional)',
        ],
      },
      {
        model: 'Lane/8000',
        category: 'Retail PIN pad (largest touchscreen)',
        platform: 'Telium TETRA',
        integration: 'Semi-integrated to POS; lane mounting',
        deployment: 'Attended lane checkout',
        notes: 'High-engagement lane device for fast, efficient checkout.',
        sourceUrl: 'https://ingenico.com/sites/default/files/resource-document/2022-11/USA-CAN_DATASHEET_LANE_8000_ING_221102.pdf',
        requirements: [
          'Premium display setup',
          'Advanced customer engagement configuration',
          'Heavy-duty mounting hardware',
          'Media player configuration',
          'Network bandwidth planning',
        ],
      },
      {
        model: 'AXIUM RX5000',
        category: 'Android retail PIN pad',
        platform: 'Android 11 (AXIUM)',
        integration: 'Semi-integrated to POS; Ethernet/Wi-Fi/Bluetooth (config)',
        deployment: 'Attended lane checkout (compact)',
        notes: 'Compact Android PIN pad for fast checkout.',
        sourceUrl: 'https://ingenico.com/us-en/products-services/payment-terminals/axium-android/axium-rx5000',
        requirements: [
          'Android AXIUM SDK',
          'Google Play Services (if required)',
          'Wi-Fi/Ethernet configuration',
          'Android app deployment via MDM',
          'Security patch management',
        ],
      },
      {
        model: 'AXIUM RX7000',
        category: 'Android retail PIN pad',
        platform: 'AXIUM (Android)',
        integration: 'Semi-integrated to POS; lane mounting',
        deployment: 'Attended lane checkout',
        notes: 'Positioned for multilane retail stores and high volume.',
        sourceUrl: 'https://ingenico.com/us-en/products-services/payment-terminals/axium-android/axium-rx7000',
        requirements: [
          'AXIUM Android platform setup',
          'Lane mount accessories',
          'Enterprise app deployment',
          'Remote management configuration',
          'Android security compliance',
        ],
      },
      {
        model: 'AXIUM RX9000',
        category: 'Android retail PIN pad / tablet form factor',
        platform: 'Android 11 (AXIUM)',
        integration: 'Semi-integrated to POS; countertop/lane',
        deployment: 'Attended lane + self-checkout at counter',
        notes: 'Positioned for multilane and self-checkout use cases with tablet form factor.',
        sourceUrl: 'https://ingenico.com/us-en/products-services/payment-terminals/axium-android/axium-rx9000',
        requirements: [
          'Tablet mounting solution',
          'AXIUM Android SDK integration',
          'Self-checkout application',
          'Customer-facing display configuration',
          'Multi-use deployment planning',
        ],
      },
      {
        model: 'Lane/3000',
        category: 'Retail PIN Pad / Lane',
        platform: 'Telium TETRA',
        integration: 'Semi-integrated to POS',
        deployment: 'Retail lane',
        notes: 'Entry-level lane PIN pad.',
        sourceUrl: 'https://ingenico.com',
        requirements: [
          'Basic lane mounting',
          'USB/RS232 connectivity',
          'PCI PTS compliance',
          'EMV configuration',
        ],
      },
      {
        model: 'Desk/5000',
        category: 'TETRA',
        platform: 'Telium TETRA',
        integration: 'Countertop deployment',
        deployment: 'Countertop',
        notes: 'Countertop terminal for retail.',
        sourceUrl: 'https://ingenico.com',
        requirements: [
          'IP/Dial connectivity',
          'Printer paper supply',
          'Power adapter',
          'TMS registration',
        ],
      },
      {
        model: 'Move/5000',
        category: 'TETRA',
        platform: 'Telium TETRA',
        integration: 'Portable/mobile deployment',
        deployment: 'Portable',
        notes: 'Portable wireless terminal.',
        sourceUrl: 'https://ingenico.com',
        requirements: [
          'Wi-Fi/3G/4G connectivity',
          'Battery charging dock',
          'SIM card (cellular models)',
          'Portable case accessories',
        ],
      },
      {
        model: 'AXIUM DX4000',
        category: 'AXIUM Android',
        platform: 'Android (AXIUM)',
        integration: 'Countertop Android POS',
        deployment: 'Countertop',
        notes: 'Android-based countertop terminal.',
        sourceUrl: 'https://ingenico.com',
        requirements: [
          'Android AXIUM SDK',
          'App deployment via Ingenico marketplace',
          'Network configuration',
          'Remote management setup',
        ],
      },
      {
        model: 'AXIUM DX8000',
        category: 'AXIUM Android',
        platform: 'Android (AXIUM)',
        integration: 'Full-featured Android POS',
        deployment: 'Countertop/portable',
        notes: 'Premium Android terminal.',
        sourceUrl: 'https://ingenico.com',
        requirements: [
          'Android enterprise setup',
          'Multi-app environment configuration',
          'Premium support subscription',
          'Extended warranty',
        ],
      },
    ],
  },
  {
    name: 'PAX',
    models: [
      {
        model: 'A30',
        category: 'Android multilane PIN pad',
        platform: 'PayDroid (Android 8.1)',
        integration: 'Semi-integrated to POS; Ethernet/Wi-Fi/Bluetooth',
        deployment: 'Attended lane checkout',
        notes: 'Marketed as ideal for multilane retailers.',
        sourceUrl: 'https://www.pax.us/products/pin-pads/a30/',
        requirements: [
          'PayDroid SDK integration',
          'Android app deployment',
          'Ethernet/Wi-Fi configuration',
          'PCI PTS 5.x certification',
          'Lane mounting hardware',
        ],
      },
      {
        model: 'A35',
        category: 'Android multilane PIN pad',
        platform: 'Android (A35 family)',
        integration: 'Semi-integrated to POS; Wi-Fi/Ethernet/Bluetooth',
        deployment: 'Attended lane checkout',
        notes: 'Designed for busy retail environments and high-volume lanes.',
        sourceUrl: 'https://www.pax.us/products/pin-pads/a35/',
        requirements: [
          'PAX Android SDK',
          'High-volume transaction optimization',
          'Multi-connectivity setup',
          'Customer display configuration',
          'Fast checkout mode',
        ],
      },
      {
        model: 'Q25',
        category: 'PIN pad (multilane)',
        platform: 'Prolin',
        integration: 'RS232/Ethernet/USB; Wi-Fi optional',
        deployment: 'Attended lane checkout',
        notes: 'Compact footprint for high-volume retail lanes.',
        sourceUrl: 'https://www.pax.us/products/pin-pads/q25/',
        requirements: [
          'Prolin SDK integration',
          'RS232/USB/Ethernet connectivity',
          'Compact mounting solution',
          'PIN encryption setup',
        ],
      },
      {
        model: 'Q30',
        category: 'Integrated smart PIN pad (multilane)',
        platform: 'Prolin',
        integration: 'Connects to cash register / self-checkout kiosk; semi-integrated',
        deployment: 'Attended lane checkout + self-checkout kiosks',
        notes: 'Datasheet explicitly calls out supermarket usage.',
        sourceUrl: 'https://www.pax.us/products/pin-pads/q30/',
        requirements: [
          'Cash register integration',
          'Self-checkout kiosk compatibility',
          'Prolin platform setup',
          'Dual-purpose deployment configuration',
          'Supermarket POS integration',
        ],
      },
      {
        model: 'A50',
        category: 'Android SmartPOS',
        platform: 'PayDroid (Android)',
        integration: 'Standalone or semi-integrated',
        deployment: 'Countertop',
        notes: 'Compact Android SmartPOS.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'PayDroid app installation',
          'Wi-Fi/Ethernet setup',
          'Printer paper',
          'Merchant account configuration',
        ],
      },
      {
        model: 'A77',
        category: 'Android SmartPOS (MiniPOS)',
        platform: 'PayDroid (Android)',
        integration: 'Mobile POS with Bluetooth printer pairing',
        deployment: 'Mobile/portable',
        notes: 'No built-in printer (pairs via Bluetooth).',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Bluetooth printer pairing',
          'Mobile app deployment',
          'Battery management',
          'Portable carrying case',
        ],
      },
      {
        model: 'A80',
        category: 'Android SmartPOS (Countertop)',
        platform: 'PayDroid (Android)',
        integration: 'Countertop Android POS',
        deployment: 'Countertop',
        notes: 'Full-featured countertop Android terminal.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Countertop stand',
          'Ethernet/Wi-Fi setup',
          'Built-in printer configuration',
          'PayDroid marketplace access',
        ],
      },
      {
        model: 'A630',
        category: 'Android SmartPOS',
        platform: 'PayDroid (Android)',
        integration: 'Advanced SmartPOS',
        deployment: 'Multi-purpose',
        notes: 'Advanced Android SmartPOS terminal.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Android enterprise setup',
          'Multi-app configuration',
          'Network connectivity',
          'Remote management',
        ],
      },
      {
        model: 'A6650',
        category: 'Android SmartPOS',
        platform: 'PayDroid (Android)',
        integration: 'Enterprise SmartPOS',
        deployment: 'Enterprise retail',
        notes: 'Enterprise-grade Android terminal.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Enterprise deployment tools',
          'Centralized management',
          'Multi-location configuration',
          'Advanced security setup',
        ],
      },
      {
        model: 'A800',
        category: 'Android Desktop / Smart Combo',
        platform: 'PayDroid (Android)',
        integration: 'Desktop combo solution',
        deployment: 'Desktop POS',
        notes: 'Desktop Android POS system.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Desktop installation',
          'Peripheral connectivity',
          'Cash drawer integration',
          'Receipt printer setup',
        ],
      },
      {
        model: 'A8500',
        category: 'Android SmartPOS',
        platform: 'PayDroid (Android)',
        integration: 'Full-featured SmartPOS',
        deployment: 'Retail/hospitality',
        notes: 'Premium Android SmartPOS.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Premium display setup',
          'Multi-peripheral support',
          'Enterprise app deployment',
          'Extended support plan',
        ],
      },
      {
        model: 'A8700',
        category: 'Android SmartPOS',
        platform: 'PayDroid (Android)',
        integration: 'Advanced retail SmartPOS',
        deployment: 'Retail',
        notes: 'Advanced retail Android terminal.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Retail-optimized configuration',
          'High-speed printing',
          'Inventory integration',
          'Loyalty program support',
        ],
      },
      {
        model: 'A8900',
        category: 'Android SmartPOS',
        platform: 'PayDroid (Android)',
        integration: 'Top-tier SmartPOS',
        deployment: 'Enterprise',
        notes: 'Top-tier Android SmartPOS.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Enterprise MDM integration',
          'Multi-tenant configuration',
          'Premium support SLA',
          'Custom app development',
        ],
      },
      {
        model: 'A910s',
        category: 'Android SmartPOS',
        platform: 'PayDroid (Android)',
        integration: 'Compact portable SmartPOS',
        deployment: 'Portable/tableside',
        notes: 'Compact portable Android terminal.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Battery charging setup',
          'Wi-Fi configuration',
          'Tableside mounting',
          'Quick-service optimization',
        ],
      },
      {
        model: 'A920 Pro',
        category: 'Android SmartPOS (Mobile)',
        platform: 'PayDroid (Android)',
        integration: 'Mobile SmartPOS',
        deployment: 'Mobile/delivery',
        notes: 'Pro version of mobile SmartPOS.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          '4G LTE SIM configuration',
          'GPS tracking setup',
          'Delivery app integration',
          'Rugged case accessory',
        ],
      },
      {
        model: 'A920 MAX',
        category: 'Android SmartPOS (Mobile)',
        platform: 'PayDroid (Android)',
        integration: 'Maximum feature mobile POS',
        deployment: 'Mobile/field service',
        notes: 'Maximum feature set mobile terminal.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Extended battery pack',
          'Field service optimization',
          'Offline mode configuration',
          'Durability accessories',
        ],
      },
      {
        model: 'A920',
        category: 'Android SmartPOS (Mobile)',
        platform: 'PayDroid (Android)',
        integration: 'Standard mobile SmartPOS',
        deployment: 'Mobile',
        notes: 'Standard mobile Android terminal.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Wi-Fi/4G connectivity',
          'Battery and charger',
          'Mobile app setup',
          'Basic accessories kit',
        ],
      },
      {
        model: 'A99',
        category: 'Android SmartPOS',
        platform: 'PayDroid (Android)',
        integration: 'Entry-level SmartPOS',
        deployment: 'Small business',
        notes: 'Entry-level Android SmartPOS.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Basic Wi-Fi setup',
          'Simple app configuration',
          'Standard merchant setup',
          'Basic training materials',
        ],
      },
      {
        model: 'Aries 6 (AR6)',
        category: 'Android PayTablet / POS',
        platform: 'PayDroid (Android)',
        integration: 'Tablet POS system',
        deployment: 'Tablet POS',
        notes: '6-inch Android PayTablet.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Tablet stand/mount',
          'Peripheral pairing',
          'Touch screen calibration',
          'POS application setup',
        ],
      },
      {
        model: 'Aries 8 (AR8)',
        category: 'Android PayTablet / POS',
        platform: 'PayDroid (Android)',
        integration: 'Large tablet POS system',
        deployment: 'Tablet POS',
        notes: '8-inch Android PayTablet.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Large tablet mounting',
          'Customer-facing display option',
          'Full POS peripheral set',
          'Kitchen display integration',
        ],
      },
      {
        model: 'C535',
        category: 'Android SmartPOS / PIN Pad',
        platform: 'PayDroid (Android)',
        integration: 'Dual-purpose device',
        deployment: 'Countertop/lane',
        notes: 'Versatile Android device.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Dual-mode configuration',
          'Flexible mounting options',
          'Multi-connectivity setup',
          'Application switching',
        ],
      },
      {
        model: 'IM30',
        category: 'Unattended Self-Service',
        platform: 'PAX platform',
        integration: 'Kiosk/vending integration',
        deployment: 'Unattended/self-service',
        notes: 'Designed for unattended payment scenarios.',
        sourceUrl: 'https://www.pax.us',
        requirements: [
          'Kiosk mounting hardware',
          'Unattended payment certification',
          'Remote monitoring setup',
          'Vandal-resistant installation',
          'Network failover configuration',
        ],
      },
    ],
  },
  {
    name: 'Dejavoo',
    models: [
      {
        model: 'P17',
        category: 'Android PIN pad (ADA-focused)',
        platform: 'Android 11',
        integration: 'USB/Wi-Fi; semi-integrated',
        deployment: 'Attended lane checkout',
        notes: 'PIN pad line aimed at fast checkout and accessibility (ADA).',
        sourceUrl: 'https://dejavoo.io/products/p-terminals-family/p17-android-pin-pad/',
        requirements: [
          'ADA compliance positioning',
          'Android SDK integration',
          'USB/Wi-Fi connectivity setup',
          'Accessibility features configuration',
          'Customer-facing installation',
        ],
      },
      {
        model: 'D1',
        category: 'Android Register',
        platform: 'Android',
        integration: 'Full POS register system',
        deployment: 'Countertop register',
        notes: 'Android-based register system.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Full POS installation',
          'Cash drawer connection',
          'Receipt printer setup',
          'Barcode scanner pairing',
          'Inventory system integration',
        ],
      },
      {
        model: 'P1',
        category: 'Android P Line (Countertop POS)',
        platform: 'Android',
        integration: 'Countertop deployment',
        deployment: 'Countertop',
        notes: 'Countertop Android terminal.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Countertop placement',
          'Network connectivity',
          'Merchant configuration',
          'App installation',
        ],
      },
      {
        model: 'P3',
        category: 'Android P Line (Wireless POS)',
        platform: 'Android',
        integration: 'Wireless deployment',
        deployment: 'Wireless/portable',
        notes: 'Wireless Android terminal.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Wi-Fi configuration',
          'Battery management',
          'Charging dock setup',
          'Wireless security',
        ],
      },
      {
        model: 'P5',
        category: 'Android P Line (mPOS / PIN Pad)',
        platform: 'Android',
        integration: 'Mobile POS integration',
        deployment: 'Mobile/mPOS',
        notes: 'Mobile PIN pad device.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Bluetooth pairing',
          'Mobile app integration',
          'Compact carrying solution',
          'Quick charge setup',
        ],
      },
      {
        model: 'P8',
        category: 'Android P Line (Wireless Terminal)',
        platform: 'Android',
        integration: 'Wireless terminal',
        deployment: 'Wireless',
        notes: 'Wireless Android payment terminal.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Wi-Fi/cellular setup',
          'Battery pack',
          'Portable accessories',
          'Field deployment kit',
        ],
      },
      {
        model: 'P12',
        category: 'Android P Line (mPOS / PIN Pad)',
        platform: 'Android',
        integration: 'Enhanced mPOS',
        deployment: 'Mobile/mPOS',
        notes: 'Enhanced mobile PIN pad.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Bluetooth 4.0+ connectivity',
          'iOS/Android SDK',
          'Merchant app setup',
          'Security configuration',
        ],
      },
      {
        model: 'QD1',
        category: 'QD Line (Android Wireless)',
        platform: 'Android',
        integration: 'Wireless Android',
        deployment: 'Wireless/portable',
        notes: 'QD series wireless terminal.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Wireless network setup',
          'QD platform configuration',
          'Battery management',
          'Accessory kit',
        ],
      },
      {
        model: 'QD2',
        category: 'QD Line (Android Mobile POS)',
        platform: 'Android',
        integration: 'Mobile POS',
        deployment: 'Mobile',
        notes: 'QD mobile POS terminal.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Mobile deployment setup',
          '4G/Wi-Fi configuration',
          'Holster/case',
          'Quick training guide',
        ],
      },
      {
        model: 'QD3',
        category: 'QD Line (Android Mobile POS)',
        platform: 'Android',
        integration: 'Mobile POS / PIN Pad variant',
        deployment: 'Mobile',
        notes: 'Also listed as PIN Pad variant on family pages.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Dual-mode configuration',
          'Mobile/PIN pad switching',
          'Flexible deployment options',
          'Multi-use training',
        ],
      },
      {
        model: 'Z6',
        category: 'Z Line (Countertop PIN Pad)',
        platform: 'Dejavoo platform',
        integration: 'Countertop PIN pad',
        deployment: 'Countertop',
        notes: 'Z series countertop PIN pad.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'USB/RS232 connectivity',
          'POS integration',
          'PIN encryption',
          'Customer-facing setup',
        ],
      },
      {
        model: 'Z8',
        category: 'Z Line (Countertop)',
        platform: 'Dejavoo platform',
        integration: 'Countertop terminal',
        deployment: 'Countertop',
        notes: 'Z series countertop terminal.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Ethernet/Dial connectivity',
          'Printer setup',
          'Merchant configuration',
          'Standard accessories',
        ],
      },
      {
        model: 'Z9',
        category: 'Z Line (Wireless)',
        platform: 'Dejavoo platform',
        integration: 'Wireless terminal',
        deployment: 'Wireless',
        notes: 'Z series wireless terminal.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Wi-Fi configuration',
          'Charging base',
          'Wireless security setup',
          'Portable deployment',
        ],
      },
      {
        model: 'Z11',
        category: 'Z Line (Countertop)',
        platform: 'Dejavoo platform',
        integration: 'Full countertop',
        deployment: 'Countertop',
        notes: 'Full-featured Z series terminal.',
        sourceUrl: 'https://dejavoo.io',
        requirements: [
          'Multi-connectivity options',
          'Full feature configuration',
          'Extended capabilities setup',
          'Premium support access',
        ],
      },
    ],
  },
  {
    name: 'Valor',
    models: [
      {
        model: 'VP300',
        category: 'PIN pad',
        platform: 'Valor secure Linux-based OS',
        integration: 'RS232 Serial',
        deployment: 'Attended lane checkout',
        notes: 'Customer-facing PIN pad for integrated checkout lanes.',
        sourceUrl: 'https://valorpaytech.com/what-we-do/hardware-products/pin-pad/vp300/',
        requirements: [
          'RS232 serial connection to POS',
          'Valor payment gateway integration',
          'PIN encryption key injection',
          'Lane mounting hardware',
          'PCI PTS compliance validation',
        ],
      },
      {
        model: 'VP300 Pro',
        category: 'PIN pad',
        platform: 'Valor platform (model-dependent)',
        integration: 'USB',
        deployment: 'Attended lane checkout',
        notes: 'Customer-facing PIN pad with USB integration option.',
        sourceUrl: 'https://valorpaytech.com/what-we-do/hardware-products/pin-pad/vp300-pro/',
        requirements: [
          'USB connectivity to POS',
          'Valor Pro SDK integration',
          'Enhanced security configuration',
          'Customer-facing mounting',
          'USB driver installation',
        ],
      },
      {
        model: 'VP100',
        category: 'Countertop POS',
        platform: 'Valor platform',
        integration: 'Countertop deployment',
        deployment: 'Countertop',
        notes: 'Entry-level countertop terminal.',
        sourceUrl: 'https://valorpaytech.com',
        requirements: [
          'Ethernet/Dial connectivity',
          'Valor merchant setup',
          'Basic configuration',
          'Power adapter',
        ],
      },
      {
        model: 'VP550',
        category: 'Next-Gen POS (Portable)',
        platform: 'Valor platform',
        integration: 'Portable wireless',
        deployment: 'Portable',
        notes: 'Next-generation portable terminal.',
        sourceUrl: 'https://valorpaytech.com',
        requirements: [
          'Wi-Fi/cellular connectivity',
          'Battery and dock',
          'Portable deployment kit',
          'Next-gen SDK',
        ],
      },
      {
        model: 'VL550',
        category: 'Next-Gen POS',
        platform: 'Valor platform',
        integration: 'Advanced POS',
        deployment: 'Multi-purpose',
        notes: 'Next-generation POS terminal.',
        sourceUrl: 'https://valorpaytech.com',
        requirements: [
          'Advanced configuration',
          'Multi-connectivity setup',
          'Enhanced features activation',
          'Premium support plan',
        ],
      },
      {
        model: 'VL100 Pro',
        category: 'Terminal',
        platform: 'Valor platform',
        integration: 'Standard terminal',
        deployment: 'Countertop',
        notes: 'Listed on reseller/lineup pages.',
        sourceUrl: 'https://valorpaytech.com',
        requirements: [
          'Standard terminal setup',
          'Network configuration',
          'Merchant onboarding',
          'Basic training',
        ],
      },
      {
        model: 'VL110',
        category: 'Wireless Device',
        platform: 'Valor platform',
        integration: 'Wireless deployment',
        deployment: 'Wireless',
        notes: 'Listed on reseller/lineup pages.',
        sourceUrl: 'https://valorpaytech.com',
        requirements: [
          'Wireless configuration',
          'Battery setup',
          'Charging accessories',
          'Mobility deployment',
        ],
      },
      {
        model: 'VP800',
        category: 'Countertop',
        platform: 'Valor platform',
        integration: 'Premium countertop',
        deployment: 'Countertop',
        notes: 'Mentioned in Valor lineup content.',
        sourceUrl: 'https://valorpaytech.com',
        requirements: [
          'Premium feature setup',
          'Advanced connectivity',
          'Extended capabilities',
          'Priority support',
        ],
      },
      {
        model: 'RCKT',
        category: 'Card Reader',
        platform: 'Valor platform',
        integration: 'Mobile card reader',
        deployment: 'Mobile mPOS',
        notes: 'Mentioned in Valor lineup content.',
        sourceUrl: 'https://valorpaytech.com',
        requirements: [
          'Bluetooth pairing',
          'Mobile app installation',
          'Card reader configuration',
          'Merchant account linking',
        ],
      },
    ],
  },
];

// Get all unique manufacturers
const getManufacturers = (): string[] => DEVICE_CATALOG.map((m) => m.name);

// Get models for a specific manufacturer
const getModelsForManufacturer = (manufacturer: string): DeviceModel[] => {
  const mfr = DEVICE_CATALOG.find((m) => m.name === manufacturer);
  return mfr ? mfr.models : [];
};

// Get device by manufacturer and model
const getDevice = (manufacturer: string, model: string): DeviceModel | null => {
  const mfr = DEVICE_CATALOG.find((m) => m.name === manufacturer);
  if (!mfr) return null;
  return mfr.models.find((m) => m.model === model) || null;
};

// Device interface for registered devices
interface RegisteredDevice {
  id: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  assignedTo?: string;
  createdAt: string;
}

export default function DevicesPage() {
  const { status } = useSession();
  const _router = useRouter();
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());

  // Form states
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newSerialNumber, setNewSerialNumber] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editSerialNumber, setEditSerialNumber] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState('');

  // Filter states
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected device for requirements display
  const selectedNewDevice = newManufacturer && newModel ? getDevice(newManufacturer, newModel) : null;
  const selectedEditDevice = editManufacturer && editModel ? getDevice(editManufacturer, editModel) : null;

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, use mock data since API may not exist yet
      // In production, this would call: const data = await api.getDevices(session);
      const mockDevices: RegisteredDevice[] = [
        {
          id: '1',
          manufacturer: 'Verifone',
          model: 'M400',
          serialNumber: 'VF-M400-001',
          location: 'Store #101 - Lane 1',
          status: 'ACTIVE',
          assignedTo: 'Pizza Palace',
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          manufacturer: 'Ingenico',
          model: 'Lane/5000',
          serialNumber: 'ING-L5K-002',
          location: 'Store #102 - Lane 2',
          status: 'ACTIVE',
          assignedTo: 'Burger Barn',
          createdAt: '2024-01-16',
        },
        {
          id: '3',
          manufacturer: 'PAX',
          model: 'A920',
          serialNumber: 'PAX-A920-003',
          location: 'Mobile Unit',
          status: 'PENDING',
          assignedTo: 'Sports Galaxy',
          createdAt: '2024-01-17',
        },
      ];
      setDevices(mockDevices);
    } catch (err) {
      setError('Failed to load devices');
      console.error('[PAGE] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!newManufacturer || !newModel || !newSerialNumber || !newLocation) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const newDevice: RegisteredDevice = {
        id: Date.now().toString(),
        manufacturer: newManufacturer,
        model: newModel,
        serialNumber: newSerialNumber,
        location: newLocation,
        status: 'PENDING',
        assignedTo: newAssignedTo || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };

      // In production: await api.createDevice(newDevice, session);
      setDevices([...devices, newDevice]);
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      setError(`Failed to add device: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleUpdateDevice = async (id: string) => {
    if (!editManufacturer || !editModel || !editSerialNumber || !editLocation) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const updatedDevice: Partial<RegisteredDevice> = {
        manufacturer: editManufacturer,
        model: editModel,
        serialNumber: editSerialNumber,
        location: editLocation,
        assignedTo: editAssignedTo || undefined,
      };

      // In production: await api.updateDevice(id, updatedDevice, session);
      setDevices(devices.map((d) => (d.id === id ? { ...d, ...updatedDevice } : d)));
      setEditingId(null);
    } catch (err) {
      setError(`Failed to update device: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      // In production: await api.deleteDevice(id, session);
      setDevices(devices.filter((d) => d.id !== id));
    } catch (err) {
      setError(`Failed to delete device: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      // In production: await api.updateDeviceStatus(id, newStatus, session);
      setDevices(devices.map((d) => (d.id === id ? { ...d, status: newStatus as any } : d)));
    } catch (err) {
      setError(`Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setNewManufacturer('');
    setNewModel('');
    setNewSerialNumber('');
    setNewLocation('');
    setNewAssignedTo('');
    setError(null);
  };

  const openEditForm = (device: RegisteredDevice) => {
    setEditingId(device.id);
    setEditManufacturer(device.manufacturer);
    setEditModel(device.model);
    setEditSerialNumber(device.serialNumber);
    setEditLocation(device.location);
    setEditAssignedTo(device.assignedTo || '');
  };

  const toggleExpanded = (id: string) => {
    setExpandedDevices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filtering
  const filteredDevices = devices.filter((device) => {
    const matchesSearch = searchTerm === ''
      || device.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      || device.model.toLowerCase().includes(searchTerm.toLowerCase())
      || device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      || device.location.toLowerCase().includes(searchTerm.toLowerCase())
      || (device.assignedTo && device.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesManufacturer = manufacturerFilter === '' || device.manufacturer === manufacturerFilter;
    const matchesStatus = statusFilter === '' || device.status === statusFilter;
    return matchesSearch && matchesManufacturer && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

  if (status === 'loading' || loading) {
    return (
      <PageLayout title="Devices" currentPath="/devices">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <p style={{ color: themeColors.gray500 }}>Loading devices...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Devices" currentPath="/devices">
      {/* Header with Add Button */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
      }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: themeColors.text, margin: 0 }}>
            Device Management
          </h1>
          <p style={{ fontSize: '14px', color: themeColors.gray500, marginTop: themeSpace.xs }}>
            Manage payment terminals and equipment for merchants
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: themeSpace.sm,
            padding: `${themeSpace.sm} ${themeSpace.lg}`,
            backgroundColor: themeColors.primary600,
            color: themeColors.white,
            border: 'none',
            borderRadius: themeRadius.sm,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <Icon name="add" size={16} color={themeColors.white} />
          Add Device
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: `1px solid ${themeColors.error500}`,
          borderRadius: themeRadius.card,
          padding: themeSpace.lg,
          marginBottom: themeSpace.lg,
          color: themeColors.error500,
        }}
        >
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div style={{
        display: 'flex', gap: themeSpace.md, marginBottom: themeSpace.lg, flexWrap: 'wrap',
      }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Icon name="search" size={16} color={themeColors.gray500} />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: `${themeSpace.sm} ${themeSpace.md} ${themeSpace.sm} ${themeSpace.xl}`,
              border: `1px solid ${themeColors.gray200}`,
              borderRadius: themeRadius.sm,
              fontSize: '14px',
              boxSizing: 'border-box',
              paddingLeft: themeSpace.xl,
            }}
          />
        </div>
        <select
          value={manufacturerFilter}
          onChange={(e) => setManufacturerFilter(e.target.value)}
          style={{
            padding: `${themeSpace.sm} ${themeSpace.md}`,
            border: `1px solid ${themeColors.gray200}`,
            borderRadius: themeRadius.sm,
            fontSize: '14px',
            backgroundColor: themeColors.white,
            cursor: 'pointer',
            minWidth: '150px',
          }}
        >
          <option value="">All Manufacturers</option>
          {getManufacturers().map((mfr) => (
            <option key={mfr} value={mfr}>{mfr}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: `${themeSpace.sm} ${themeSpace.md}`,
            border: `1px solid ${themeColors.gray200}`,
            borderRadius: themeRadius.sm,
            fontSize: '14px',
            backgroundColor: themeColors.white,
            cursor: 'pointer',
            minWidth: '120px',
          }}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="PENDING">Pending</option>
        </select>
        <select
          value={itemsPerPage}
          onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          style={{
            padding: `${themeSpace.sm} ${themeSpace.md}`,
            border: `1px solid ${themeColors.gray200}`,
            borderRadius: themeRadius.sm,
            fontSize: '14px',
            backgroundColor: themeColors.white,
            cursor: 'pointer',
          }}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {/* Device List */}
      <div style={{
        backgroundColor: themeColors.white,
        borderRadius: themeRadius.card,
        boxShadow: themeShadow.sm,
        overflow: 'hidden',
      }}
      >
        {paginatedDevices.length === 0 ? (
          <div style={{
            padding: themeSpace.xl, textAlign: 'center', color: themeColors.gray500,
          }}
          >
            {devices.length === 0 ? 'No devices registered yet. Click "Add Device" to get started.' : 'No devices match your filters.'}
          </div>
        ) : (
          paginatedDevices.map((device) => {
            const deviceInfo = getDevice(device.manufacturer, device.model);
            const isExpanded = expandedDevices.has(device.id);
            const isEditing = editingId === device.id;

            return (
              <div
                key={device.id}
                style={{
                  borderBottom: `1px solid ${themeColors.gray100}`,
                }}
              >
                {/* Device Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: themeSpace.lg,
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? themeColors.gray50 : themeColors.white,
                  }}
                  onClick={() => toggleExpanded(device.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: themeColors.primary50,
                        borderRadius: themeRadius.sm,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      >
                        <Icon name="device" size={20} color={themeColors.primary600} />
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: 0,
                        }}
                        >
                          {device.manufacturer}
                          {' '}
                          {device.model}
                        </h3>
                        <p style={{ fontSize: '13px', color: themeColors.gray500, margin: '2px 0 0 0' }}>
                          S/N:
                          {' '}
                          {device.serialNumber}
                          {' '}
                          •
                          {' '}
                          {device.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
                    {device.assignedTo && (
                      <span style={{
                        padding: `${themeSpace.xs} ${themeSpace.sm}`,
                        backgroundColor: themeColors.info50,
                        color: themeColors.info600,
                        borderRadius: themeRadius.sm,
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                      >
                        {device.assignedTo}
                      </span>
                    )}
                    <span
                      style={{
                        padding: `${themeSpace.xs} ${themeSpace.sm}`,
                        backgroundColor: device.status === 'ACTIVE' ? themeColors.success50 : device.status === 'PENDING' ? themeColors.warning50 : themeColors.gray100,
                        color: device.status === 'ACTIVE' ? themeColors.success600 : device.status === 'PENDING' ? themeColors.warning600 : themeColors.gray500,
                        borderRadius: themeRadius.sm,
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => { e.stopPropagation(); handleStatusToggle(device.id, device.status); }}
                    >
                      {device.status}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditForm(device); }}
                      style={{
                        background: themeColors.info50,
                        border: 'none',
                        color: themeColors.info600,
                        width: '32px',
                        height: '32px',
                        borderRadius: themeRadius.sm,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="edit" size={14} color={themeColors.info600} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDevice(device.id); }}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        color: themeColors.error500,
                        width: '32px',
                        height: '32px',
                        borderRadius: themeRadius.sm,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="delete" size={14} color={themeColors.error500} />
                    </button>
                    <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} size={20} color={themeColors.gray500} />
                  </div>
                </div>

                {/* Expanded Details with Requirements */}
                {isExpanded && deviceInfo && (
                  <div style={{
                    padding: `0 ${themeSpace.lg} ${themeSpace.lg} ${themeSpace.lg}`,
                    backgroundColor: themeColors.gray50,
                  }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: themeSpace.lg,
                    }}
                    >
                      {/* Device Info */}
                      <div style={{
                        backgroundColor: themeColors.white,
                        borderRadius: themeRadius.sm,
                        padding: themeSpace.md,
                        border: `1px solid ${themeColors.gray200}`,
                      }}
                      >
                        <h4 style={{
                          fontSize: '14px', fontWeight: '600', color: themeColors.text, margin: `0 0 ${themeSpace.sm} 0`,
                        }}
                        >
                          Device Information
                        </h4>
                        <div style={{ fontSize: '13px', color: themeColors.gray600 }}>
                          <p style={{ margin: '4px 0' }}>
                            <strong>Category:</strong>
                            {' '}
                            {deviceInfo.category}
                          </p>
                          <p style={{ margin: '4px 0' }}>
                            <strong>Platform:</strong>
                            {' '}
                            {deviceInfo.platform}
                          </p>
                          <p style={{ margin: '4px 0' }}>
                            <strong>Deployment:</strong>
                            {' '}
                            {deviceInfo.deployment}
                          </p>
                          <p style={{ margin: '4px 0' }}>
                            <strong>Integration:</strong>
                            {' '}
                            {deviceInfo.integration}
                          </p>
                          {deviceInfo.notes && (
                            <p style={{ margin: '8px 0 0 0', fontStyle: 'italic', color: themeColors.gray500 }}>
                              {deviceInfo.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div style={{
                        backgroundColor: themeColors.white,
                        borderRadius: themeRadius.sm,
                        padding: themeSpace.md,
                        border: `1px solid ${themeColors.warning200}`,
                      }}
                      >
                        <h4 style={{
                          fontSize: '14px', fontWeight: '600', color: themeColors.warning600, margin: `0 0 ${themeSpace.sm} 0`, display: 'flex', alignItems: 'center', gap: themeSpace.xs,
                        }}
                        >
                          <Icon name="info" size={16} color={themeColors.warning600} />
                          Onboarding Requirements
                        </h4>
                        <ul style={{
                          margin: 0, paddingLeft: '20px', fontSize: '13px', color: themeColors.gray600,
                        }}
                        >
                          {deviceInfo.requirements.map((req, idx) => (
                            <li key={idx} style={{ padding: '4px 0' }}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Source Link */}
                    {deviceInfo.sourceUrl && (
                      <div style={{ marginTop: themeSpace.md }}>
                        <a
                          href={deviceInfo.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: themeSpace.xs,
                            fontSize: '13px',
                            color: themeColors.primary600,
                            textDecoration: 'none',
                          }}
                        >
                          <Icon name="link" size={14} color={themeColors.primary600} />
                          View manufacturer documentation
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Form (inline) */}
                {isEditing && (
                  <div style={{
                    padding: themeSpace.lg,
                    backgroundColor: themeColors.primary50,
                    borderTop: `1px solid ${themeColors.primary200}`,
                  }}
                  >
                    <h4 style={{
                      fontSize: '14px', fontWeight: '600', color: themeColors.text, margin: `0 0 ${themeSpace.md} 0`,
                    }}
                    >
                      Edit Device
                    </h4>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: themeSpace.md,
                    }}
                    >
                      <div>
                        <label style={{
                          display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.xs,
                        }}
                        >
                          Manufacturer *
                        </label>
                        <select
                          value={editManufacturer}
                          onChange={(e) => { setEditManufacturer(e.target.value); setEditModel(''); }}
                          style={{
                            width: '100%',
                            padding: themeSpace.sm,
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '14px',
                            backgroundColor: themeColors.white,
                          }}
                        >
                          <option value="">Select manufacturer</option>
                          {getManufacturers().map((mfr) => (
                            <option key={mfr} value={mfr}>{mfr}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{
                          display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.xs,
                        }}
                        >
                          Model *
                        </label>
                        <select
                          value={editModel}
                          onChange={(e) => setEditModel(e.target.value)}
                          disabled={!editManufacturer}
                          style={{
                            width: '100%',
                            padding: themeSpace.sm,
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '14px',
                            backgroundColor: !editManufacturer ? themeColors.gray100 : themeColors.white,
                          }}
                        >
                          <option value="">Select model</option>
                          {getModelsForManufacturer(editManufacturer).map((m) => (
                            <option key={m.model} value={m.model}>{m.model}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{
                          display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.xs,
                        }}
                        >
                          Serial Number *
                        </label>
                        <input
                          type="text"
                          value={editSerialNumber}
                          onChange={(e) => setEditSerialNumber(e.target.value)}
                          style={{
                            width: '100%',
                            padding: themeSpace.sm,
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.xs,
                        }}
                        >
                          Location *
                        </label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          style={{
                            width: '100%',
                            padding: themeSpace.sm,
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.xs,
                        }}
                        >
                          Assigned To
                        </label>
                        <input
                          type="text"
                          value={editAssignedTo}
                          onChange={(e) => setEditAssignedTo(e.target.value)}
                          placeholder="Merchant name"
                          style={{
                            width: '100%',
                            padding: themeSpace.sm,
                            border: `1px solid ${themeColors.gray200}`,
                            borderRadius: themeRadius.sm,
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    {/* Requirements Preview for Edit */}
                    {selectedEditDevice && (
                      <div style={{
                        marginTop: themeSpace.md,
                        padding: themeSpace.md,
                        backgroundColor: themeColors.warning50,
                        borderRadius: themeRadius.sm,
                        border: `1px solid ${themeColors.warning200}`,
                      }}
                      >
                        <h5 style={{
                          fontSize: '13px', fontWeight: '600', color: themeColors.warning600, margin: `0 0 ${themeSpace.sm} 0`,
                        }}
                        >
                          Device Requirements for
                          {' '}
                          {selectedEditDevice.model}
                        </h5>
                        <ul style={{
                          margin: 0, paddingLeft: '20px', fontSize: '12px', color: themeColors.gray600, columns: 2,
                        }}
                        >
                          {selectedEditDevice.requirements.map((req, idx) => (
                            <li key={idx} style={{ padding: '2px 0' }}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{
                      display: 'flex', gap: themeSpace.sm, marginTop: themeSpace.md,
                    }}
                    >
                      <button
                        onClick={() => handleUpdateDevice(device.id)}
                        style={{
                          padding: `${themeSpace.sm} ${themeSpace.md}`,
                          backgroundColor: themeColors.primary600,
                          color: themeColors.white,
                          border: 'none',
                          borderRadius: themeRadius.sm,
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: `${themeSpace.sm} ${themeSpace.md}`,
                          backgroundColor: themeColors.white,
                          color: themeColors.gray600,
                          border: `1px solid ${themeColors.gray200}`,
                          borderRadius: themeRadius.sm,
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: themeSpace.sm, marginTop: themeSpace.lg,
        }}
        >
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            style={{
              padding: `${themeSpace.xs} ${themeSpace.sm}`,
              border: `1px solid ${themeColors.gray200}`,
              borderRadius: themeRadius.sm,
              backgroundColor: currentPage === 1 ? themeColors.gray100 : themeColors.white,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? themeColors.gray300 : themeColors.gray600,
            }}
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: `${themeSpace.xs} ${themeSpace.sm}`,
              border: `1px solid ${themeColors.gray200}`,
              borderRadius: themeRadius.sm,
              backgroundColor: currentPage === 1 ? themeColors.gray100 : themeColors.white,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? themeColors.gray300 : themeColors.gray600,
            }}
          >
            <Icon name="chevronLeft" size={14} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: `${themeSpace.xs} ${themeSpace.sm}`,
                  border: `1px solid ${currentPage === pageNum ? themeColors.primary600 : themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  backgroundColor: currentPage === pageNum ? themeColors.primary600 : themeColors.white,
                  cursor: 'pointer',
                  color: currentPage === pageNum ? themeColors.white : themeColors.gray600,
                  minWidth: '32px',
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: `${themeSpace.xs} ${themeSpace.sm}`,
              border: `1px solid ${themeColors.gray200}`,
              borderRadius: themeRadius.sm,
              backgroundColor: currentPage === totalPages ? themeColors.gray100 : themeColors.white,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? themeColors.gray300 : themeColors.gray600,
            }}
          >
            <Icon name="chevronRight" size={14} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              padding: `${themeSpace.xs} ${themeSpace.sm}`,
              border: `1px solid ${themeColors.gray200}`,
              borderRadius: themeRadius.sm,
              backgroundColor: currentPage === totalPages ? themeColors.gray100 : themeColors.white,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? themeColors.gray300 : themeColors.gray600,
            }}
          >
            Last
          </button>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          overflowY: 'auto',
          padding: `${themeSpace.xl} 0`,
        }}
        >
          <div style={{
            backgroundColor: themeColors.white,
            borderRadius: themeRadius.card,
            padding: themeSpace.xl,
            width: '90%',
            maxWidth: '700px',
            boxShadow: themeShadow.md,
            margin: 'auto',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
            }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: themeColors.text, margin: 0 }}>
                Add New Device
              </h2>
              <button
                onClick={() => { setShowAddForm(false); resetForm(); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                }}
              >
                <Icon name="x" size={20} color={themeColors.gray500} />
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: `1px solid ${themeColors.error500}`,
                borderRadius: themeRadius.sm,
                padding: themeSpace.md,
                marginBottom: themeSpace.lg,
                color: themeColors.error500,
                fontSize: '14px',
              }}
              >
                {error}
              </div>
            )}

            <div style={{
              display: 'flex', flexDirection: 'column', gap: themeSpace.lg,
            }}
            >
              {/* Manufacturer Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: themeSpace.lg }}>
                <div>
                  <label style={{
                    display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                  }}
                  >
                    Manufacturer *
                  </label>
                  <select
                    value={newManufacturer}
                    onChange={(e) => { setNewManufacturer(e.target.value); setNewModel(''); }}
                    style={{
                      width: '100%',
                      padding: `${themeSpace.sm} ${themeSpace.md}`,
                      border: `1px solid ${themeColors.gray200}`,
                      borderRadius: themeRadius.sm,
                      fontSize: '14px',
                      backgroundColor: themeColors.white,
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select manufacturer</option>
                    {getManufacturers().map((mfr) => (
                      <option key={mfr} value={mfr}>{mfr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                  }}
                  >
                    Model *
                  </label>
                  <select
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    disabled={!newManufacturer}
                    style={{
                      width: '100%',
                      padding: `${themeSpace.sm} ${themeSpace.md}`,
                      border: `1px solid ${themeColors.gray200}`,
                      borderRadius: themeRadius.sm,
                      fontSize: '14px',
                      backgroundColor: !newManufacturer ? themeColors.gray100 : themeColors.white,
                      cursor: !newManufacturer ? 'not-allowed' : 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select model</option>
                    {getModelsForManufacturer(newManufacturer).map((m) => (
                      <option key={m.model} value={m.model}>{m.model}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Device Requirements - Only shown when model is selected */}
              {selectedNewDevice && (
                <div style={{
                  backgroundColor: themeColors.warning50,
                  border: `1px solid ${themeColors.warning200}`,
                  borderRadius: themeRadius.card,
                  padding: themeSpace.lg,
                }}
                >
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: themeColors.warning600,
                    margin: `0 0 ${themeSpace.md} 0`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: themeSpace.sm,
                  }}
                  >
                    <Icon name="info" size={18} color={themeColors.warning600} />
                    Onboarding Requirements for
                    {' '}
                    {selectedNewDevice.model}
                  </h4>

                  {/* Device Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: themeSpace.sm,
                    marginBottom: themeSpace.md,
                    fontSize: '13px',
                    color: themeColors.gray600,
                  }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>Category:</strong>
                      {' '}
                      {selectedNewDevice.category}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Platform:</strong>
                      {' '}
                      {selectedNewDevice.platform}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Deployment:</strong>
                      {' '}
                      {selectedNewDevice.deployment}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Integration:</strong>
                      {' '}
                      {selectedNewDevice.integration}
                    </p>
                  </div>

                  {/* Requirements List */}
                  <div style={{
                    backgroundColor: themeColors.white,
                    borderRadius: themeRadius.sm,
                    padding: themeSpace.md,
                    border: `1px solid ${themeColors.warning200}`,
                  }}
                  >
                    <h5 style={{
                      fontSize: '13px', fontWeight: '600', color: themeColors.text, margin: `0 0 ${themeSpace.sm} 0`,
                    }}
                    >
                      Required for Onboarding:
                    </h5>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      fontSize: '13px',
                      color: themeColors.gray600,
                    }}
                    >
                      {selectedNewDevice.requirements.map((req, idx) => (
                        <li key={idx} style={{ padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: themeSpace.xs }}>
                          <span style={{ color: themeColors.warning600 }}>•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes */}
                  {selectedNewDevice.notes && (
                    <p style={{
                      marginTop: themeSpace.md,
                      marginBottom: 0,
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: themeColors.gray500,
                    }}
                    >
                      Note:
                      {' '}
                      {selectedNewDevice.notes}
                    </p>
                  )}

                  {/* Documentation Link */}
                  {selectedNewDevice.sourceUrl && (
                    <a
                      href={selectedNewDevice.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: themeSpace.xs,
                        marginTop: themeSpace.md,
                        fontSize: '13px',
                        color: themeColors.primary600,
                        textDecoration: 'none',
                      }}
                    >
                      <Icon name="link" size={14} color={themeColors.primary600} />
                      View manufacturer documentation
                    </a>
                  )}
                </div>
              )}

              {/* Device Details */}
              <div>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                }}
                >
                  Serial Number *
                </label>
                <input
                  type="text"
                  value={newSerialNumber}
                  onChange={(e) => setNewSerialNumber(e.target.value)}
                  placeholder="e.g., VF-M400-001"
                  style={{
                    width: '100%',
                    padding: `${themeSpace.sm} ${themeSpace.md}`,
                    border: `1px solid ${themeColors.gray200}`,
                    borderRadius: themeRadius.sm,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                }}
                >
                  Location *
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., Store #101 - Lane 1"
                  style={{
                    width: '100%',
                    padding: `${themeSpace.sm} ${themeSpace.md}`,
                    border: `1px solid ${themeColors.gray200}`,
                    borderRadius: themeRadius.sm,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.sm,
                }}
                >
                  Assigned To (Merchant)
                </label>
                <input
                  type="text"
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  placeholder="e.g., Pizza Palace"
                  style={{
                    width: '100%',
                    padding: `${themeSpace.sm} ${themeSpace.md}`,
                    border: `1px solid ${themeColors.gray200}`,
                    borderRadius: themeRadius.sm,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex', gap: themeSpace.md, justifyContent: 'flex-end', marginTop: themeSpace.xl,
            }}
            >
              <button
                onClick={() => { setShowAddForm(false); resetForm(); }}
                style={{
                  padding: `${themeSpace.sm} ${themeSpace.lg}`,
                  border: `1px solid ${themeColors.gray200}`,
                  backgroundColor: themeColors.white,
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: themeColors.gray600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDevice}
                disabled={!newManufacturer || !newModel}
                style={{
                  padding: `${themeSpace.sm} ${themeSpace.lg}`,
                  backgroundColor: !newManufacturer || !newModel ? themeColors.gray300 : themeColors.primary600,
                  color: themeColors.white,
                  border: 'none',
                  borderRadius: themeRadius.sm,
                  cursor: !newManufacturer || !newModel ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
