import { NavigationProp } from '@react-navigation/native';

// ============================================================================
// ROOT STACK PARAM LIST - Combined type for all navigation routes
// ============================================================================

export type RootStackParamList = {
  // Auth screens
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;

  // Main entry points
  Main: undefined;
  Home: undefined;

  // Offers screens
  Offers: { merchantId?: number } | undefined;
  OffersList: undefined;
  OfferDetail: { offerId: number };
  OfferDetails: { offerId: number };
  RedeemOffer: { offerId: number };
  RedemptionSuccess: { redemption: any; offer: any };
  ShareOffer: { offer: any };

  // Merchants screens
  Merchants: undefined;
  MerchantDetail: { merchantId: number };

  // Common screens
  Scan: undefined;
  Profile: undefined;
  Notifications: undefined;
  QRScanner: undefined;
  Settings: undefined;
  HelpSupport: undefined;

  // Scout-specific screens
  Scout: undefined;
  ScoutDashboard: undefined;
  Subscription: undefined;
  Referral: undefined;
  ViewOffers: undefined;

  // Troop Leader-specific screens
  TroopLeader: undefined;
  TroopLeaderDashboard: undefined;
  ManageScouts: undefined;
  TroopStats: undefined;
  InviteScouts: undefined;
};

// ============================================================================
// OFFERS STACK (Nested in tabs)
// ============================================================================

export type OffersStackParamList = {
  OffersList: undefined;
  OfferDetail: { offerId: number };
};

// ============================================================================
// SCOUT NAVIGATION TYPES
// ============================================================================

export type ScoutTabParamList = {
  Home: undefined;
  Wallet: undefined;
  QRCode: undefined;
  Profile: undefined;
};

export type ScoutStackParamList = {
  ScoutTabs: undefined;
  Merchants: undefined;
  MerchantDetail: { merchantId: number };
  Notifications: undefined;
  Subscription: undefined;
  Referral: undefined;
  ViewOffers: undefined;
  OfferDetail: { offerId: number };
  QRScanner: undefined;
  ShareOffer: { offer: any };
  RedemptionSuccess: { redemption: any; offer: any };
  CardInventory: undefined;
  GiftCard: { cardId: number };
  ReplenishCard: undefined;
  ClaimGift: { token: string };
  BuyMoreCards: undefined;
  Settings: undefined;
  HelpSupport: undefined;
};

// ============================================================================
// TROOP LEADER NAVIGATION TYPES
// ============================================================================

export type TroopLeaderTabParamList = {
  Home: undefined;
  Offers: undefined;
  Dashboard: undefined;
  Scouts: undefined;
  Profile: undefined;
};

export type TroopLeaderStackParamList = {
  TroopLeaderTabs: undefined;
  Merchants: undefined;
  MerchantDetail: { merchantId: number };
  OfferDetail: { offerId: number };
  Notifications: undefined;
  ManageScouts: undefined;
  TroopStats: undefined;
  InviteScouts: undefined;
  Subscription: undefined;
  SelectScoutForSubscription: { planId: string };
  QRScanner: undefined;
  ShareOffer: { offer: any };
  RedemptionSuccess: { redemption: any; offer: any };
  CardInventory: undefined;
  GiftCard: { cardId: number };
  ReplenishCard: undefined;
  ClaimGift: { token: string };
  BuyMoreCards: undefined;
  Settings: undefined;
  HelpSupport: undefined;
};

// ============================================================================
// CUSTOMER/PARENT NAVIGATION TYPES
// ============================================================================

export type CustomerTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Offers: undefined;
  Merchants: undefined;
  Profile: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: undefined;
  MerchantDetail: { merchantId: number };
  OfferDetail: { offerId: number };
  Notifications: undefined;
  Subscription: undefined;
  Referral: undefined;
  QRScanner: undefined;
  ShareOffer: { offer: any };
  RedemptionSuccess: { redemption: any; offer: any };
  CardInventory: undefined;
  GiftCard: { cardId: number };
  ReplenishCard: undefined;
  ClaimGift: { token: string };
  BuyMoreCards: undefined;
  Settings: undefined;
  HelpSupport: undefined;
};

// ============================================================================
// AUTH NAVIGATION TYPES
// ============================================================================

export type AuthStackParamList = {
  Login: undefined;
  SubscriptionSelection: { scoutCode?: string } | undefined;
  QuantitySelection: {
    selectedPlan: { id: number; uuid: string; name: string; priceCents: number; billingInterval: string };
    scoutCode?: string;
  };
  Payment: {
    selectedPlan: { id: number; uuid: string; name: string; priceCents: number; billingInterval: string };
    quantity: number;
    scoutCode?: string;
  };
  Signup: {
    selectedPlan?: { id: number; uuid: string; name: string; priceCents: number; billingInterval: string };
    paymentCompleted?: boolean;
    quantity?: number;
    scoutCode?: string;
  } | undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { token: string };
};

// ============================================================================
// NAVIGATION PROP TYPES
// ============================================================================

export type RootNavigation = NavigationProp<RootStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
