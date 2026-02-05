import { Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts as expoFetchProducts,
  requestPurchase as expoRequestPurchase,
  finishTransaction,
  getAvailablePurchases,
  restorePurchases as expoRestorePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  ErrorCode,
  type Product,
  type ProductSubscription,
  type Purchase,
  type ExpoPurchaseError,
} from 'expo-iap';
import {
  IAP_CARD_SKUS,
  IAP_SUBSCRIPTION_SKUS,
} from '../config/constants';
import { apiClient } from './apiClient';

export type IAPProduct = Product;
export type IAPSubscription = ProductSubscription;
export type IAPPurchase = Purchase;

class IAPService {
  private connected = false;
  private purchaseUpdateSubscription: ReturnType<typeof purchaseUpdatedListener> | null = null;
  private purchaseErrorSubscription: ReturnType<typeof purchaseErrorListener> | null = null;
  private onPurchaseSuccess: ((purchase: Purchase) => void) | null = null;
  private onExpoPurchaseError: ((error: ExpoPurchaseError) => void) | null = null;

  async init(): Promise<boolean> {
    if (Platform.OS !== 'ios') return false;
    if (this.connected) return true;

    try {
      const result = await initConnection();
      this.connected = !!result;
      return this.connected;
    } catch (error) {
      console.error('[IAP] Failed to initialize connection:', error);
      return false;
    }
  }

  setupListeners(
    onSuccess: (purchase: Purchase) => void,
    onError: (error: ExpoPurchaseError) => void,
  ) {
    this.onPurchaseSuccess = onSuccess;
    this.onExpoPurchaseError = onError;

    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      (purchase: Purchase) => {
        this.onPurchaseSuccess?.(purchase);
      },
    );

    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: ExpoPurchaseError) => {
        if (error.code === ErrorCode.UserCancelled) {
          console.log('[IAP] Purchase cancelled by user');
        } else {
          console.error('[IAP] Purchase error:', error);
        }
        this.onExpoPurchaseError?.(error);
      },
    );
  }

  removeListeners() {
    this.purchaseUpdateSubscription?.remove();
    this.purchaseErrorSubscription?.remove();
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;
    this.onPurchaseSuccess = null;
    this.onExpoPurchaseError = null;
  }

  async fetchProducts(): Promise<Product[]> {
    if (!this.connected) await this.init();
    try {
      const products = await expoFetchProducts({ skus: IAP_CARD_SKUS, type: 'in-app' });
      return (products || []) as Product[];
    } catch (error) {
      console.error('[IAP] Failed to fetch products:', error);
      return [];
    }
  }

  async fetchSubscriptions(): Promise<ProductSubscription[]> {
    if (!this.connected) await this.init();
    try {
      const subs = await expoFetchProducts({ skus: IAP_SUBSCRIPTION_SKUS, type: 'subs' });
      return (subs || []) as ProductSubscription[];
    } catch (error) {
      console.error('[IAP] Failed to fetch subscriptions:', error);
      return [];
    }
  }

  async purchaseProduct(sku: string): Promise<void> {
    if (!this.connected) await this.init();

    // Verify the product exists before attempting purchase
    const products = await this.fetchProducts();
    const product = products.find(p => p.id === sku);
    if (!product) {
      console.error('[IAP] Product SKU not found:', sku, 'Available:', products.map(p => p.id));
      throw new Error(`SKU not found: ${sku}. Please ensure the product is configured in App Store Connect.`);
    }

    try {
      await expoRequestPurchase({
        request: { apple: { sku } },
        type: 'in-app',
      });
    } catch (error) {
      console.error('[IAP] Purchase request failed:', error);
      throw error;
    }
  }

  async purchaseSubscriptionProduct(sku: string): Promise<void> {
    if (!this.connected) await this.init();

    // Verify the subscription product exists before attempting purchase
    const subs = await this.fetchSubscriptions();
    const product = subs.find(s => s.id === sku);
    if (!product) {
      console.error('[IAP] Subscription SKU not found:', sku, 'Available:', subs.map(s => s.id));
      throw new Error(`SKU not found: ${sku}. Please ensure the subscription is configured in App Store Connect.`);
    }

    try {
      await expoRequestPurchase({
        request: { apple: { sku } },
        type: 'subs',
      });
    } catch (error) {
      console.error('[IAP] Subscription request failed:', error);
      throw error;
    }
  }

  async completePurchase(purchase: Purchase): Promise<void> {
    try {
      await finishTransaction({ purchase, isConsumable: true });
    } catch (error) {
      console.error('[IAP] Failed to finish transaction:', error);
    }
  }

  async completeSubscription(purchase: Purchase): Promise<void> {
    try {
      await finishTransaction({ purchase, isConsumable: false });
    } catch (error) {
      console.error('[IAP] Failed to finish subscription transaction:', error);
    }
  }

  async restorePurchases(): Promise<Purchase[]> {
    if (!this.connected) await this.init();
    try {
      await expoRestorePurchases();
      const purchases = await getAvailablePurchases();
      return purchases;
    } catch (error) {
      console.error('[IAP] Failed to restore purchases:', error);
      return [];
    }
  }

  async verifyReceipt(data: {
    receiptData: string;
    productId: string;
    transactionId: string;
    userId?: string;
  }): Promise<{
    valid: boolean;
    productId: string;
    subscriptionId?: string;
    cardsPurchased?: number;
    expiresDate?: string;
  }> {
    const response = await apiClient.post('/api/v1/apple/verify-receipt', data);
    return response.data;
  }

  async disconnect(): Promise<void> {
    this.removeListeners();
    if (this.connected) {
      try {
        await endConnection();
      } catch (error) {
        console.error('[IAP] Failed to end connection:', error);
      }
      this.connected = false;
    }
  }

  isAvailable(): boolean {
    return Platform.OS === 'ios';
  }
}

export const iapService = new IAPService();
