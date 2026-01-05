import { NavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Home: undefined;
  Offers: { merchantId?: number } | undefined;
  OfferDetail: { offerId: number };
  OfferDetails: { offerId: number };
  RedeemOffer: { offerId: number };
  RedemptionSuccess: { redemption: any; offer: any };
  ShareOffer: { offer: any };
  Merchants: undefined;
  MerchantDetail: { merchantId: number };
  Scan: undefined;
  Scout: undefined;
  Profile: undefined;
  Subscription: undefined;
  Referral: undefined;
  Notifications: undefined;
};

export type RootNavigation = NavigationProp<RootStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
