import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { ErrorCode, type Product, type ProductSubscription, type Purchase, type ExpoPurchaseError } from 'expo-iap';
import { iapService } from '../services/iapService';
import { IAP_CARD_PRODUCTS } from '../config/constants';

interface UseIAPReturn {
  products: Product[];
  subscriptions: ProductSubscription[];
  loading: boolean;
  purchasing: boolean;
  purchaseProduct: (sku: string) => Promise<void>;
  purchaseSubscription: (sku: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  getProductForQuantity: (quantity: number) => Product | undefined;
  getLocalizedPrice: (sku: string) => string;
}

interface UseIAPOptions {
  onPurchaseComplete?: (result: {
    valid: boolean;
    productId: string;
    transactionId: string;
    subscriptionId?: string;
    cardsPurchased?: number;
  }) => void;
  onPurchaseError?: (error: string) => void;
  userId?: string;
  autoInit?: boolean;
}

export function useIAP(options: UseIAPOptions = {}): UseIAPReturn {
  const {
    onPurchaseComplete,
    onPurchaseError,
    userId,
    autoInit = true,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<ProductSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const callbacksRef = useRef({ onPurchaseComplete, onPurchaseError, userId });

  // Keep refs updated
  useEffect(() => {
    callbacksRef.current = { onPurchaseComplete, onPurchaseError, userId };
  }, [onPurchaseComplete, onPurchaseError, userId]);

  const handlePurchaseSuccess = useCallback(async (purchase: Purchase) => {
    try {
      const receiptData = purchase.purchaseToken || '';
      const transactionId = purchase.transactionId || '';
      const productId = purchase.productId;

      // Verify receipt with backend
      const result = await iapService.verifyReceipt({
        receiptData,
        productId,
        transactionId,
        userId: callbacksRef.current.userId,
      });

      if (result.valid) {
        // Determine if this is a subscription or consumable
        const isSubscription = productId.includes('subscription');
        if (isSubscription) {
          await iapService.completeSubscription(purchase);
        } else {
          await iapService.completePurchase(purchase);
        }

        callbacksRef.current.onPurchaseComplete?.({
          valid: true,
          productId,
          transactionId,
          subscriptionId: result.subscriptionId,
          cardsPurchased: result.cardsPurchased,
        });
      } else {
        callbacksRef.current.onPurchaseError?.('Receipt validation failed. Please contact support.');
      }
    } catch (error: any) {
      console.error('[useIAP] Error processing purchase:', error);
      const message = error?.response?.data?.message || error?.message || 'Purchase verification failed';
      callbacksRef.current.onPurchaseError?.(message);
    } finally {
      setPurchasing(false);
    }
  }, []);

  const handlePurchaseError = useCallback((error: ExpoPurchaseError) => {
    setPurchasing(false);
    if (error.code === ErrorCode.UserCancelled) {
      // User cancelled — don't show error
      return;
    }
    const message = error.message || 'Purchase failed. Please try again.';
    callbacksRef.current.onPurchaseError?.(message);
  }, []);

  // Initialize IAP and fetch products
  useEffect(() => {
    if (Platform.OS !== 'ios' || !autoInit) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const initialize = async () => {
      try {
        await iapService.init();
        iapService.setupListeners(handlePurchaseSuccess, handlePurchaseError);

        const [fetchedProducts, fetchedSubs] = await Promise.all([
          iapService.fetchProducts(),
          iapService.fetchSubscriptions(),
        ]);

        if (mounted) {
          setProducts(fetchedProducts);
          setSubscriptions(fetchedSubs);
        }
      } catch (error) {
        console.error('[useIAP] Initialization failed:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      iapService.removeListeners();
    };
  }, [autoInit, handlePurchaseSuccess, handlePurchaseError]);

  const purchaseProduct = useCallback(async (sku: string) => {
    setPurchasing(true);
    try {
      await iapService.purchaseProduct(sku);
      // Purchase result will be handled by purchaseUpdatedListener
    } catch (error: any) {
      setPurchasing(false);
      throw error;
    }
  }, []);

  const purchaseSubscription = useCallback(async (sku: string) => {
    setPurchasing(true);
    try {
      await iapService.purchaseSubscriptionProduct(sku);
      // Purchase result will be handled by purchaseUpdatedListener
    } catch (error: any) {
      setPurchasing(false);
      throw error;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    setLoading(true);
    try {
      const purchases = await iapService.restorePurchases();
      if (purchases.length === 0) {
        Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
        return;
      }

      // Verify each purchase with backend
      let restoredCount = 0;
      for (const purchase of purchases) {
        try {
          const result = await iapService.verifyReceipt({
            receiptData: purchase.purchaseToken || '',
            productId: purchase.productId,
            transactionId: purchase.transactionId || '',
            userId: callbacksRef.current.userId,
          });
          if (result.valid) {
            restoredCount++;
          }
        } catch (err) {
          console.error('[useIAP] Failed to verify restored purchase:', err);
        }
      }

      Alert.alert(
        'Purchases Restored',
        restoredCount > 0
          ? `Successfully restored ${restoredCount} purchase${restoredCount !== 1 ? 's' : ''}.`
          : 'No active purchases found to restore.',
      );
    } catch (error) {
      console.error('[useIAP] Restore failed:', error);
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductForQuantity = useCallback((quantity: number): Product | undefined => {
    const mapping = IAP_CARD_PRODUCTS.find(p => p.quantity === quantity);
    if (!mapping) return undefined;
    return products.find(p => p.id === mapping.productId);
  }, [products]);

  const getLocalizedPrice = useCallback((sku: string): string => {
    const product = products.find(p => p.id === sku);
    if (product) return product.displayPrice;
    const sub = subscriptions.find(s => s.id === sku);
    if (sub) return sub.displayPrice;
    return '';
  }, [products, subscriptions]);

  return {
    products,
    subscriptions,
    loading,
    purchasing,
    purchaseProduct,
    purchaseSubscription,
    restorePurchases,
    getProductForQuantity,
    getLocalizedPrice,
  };
}
