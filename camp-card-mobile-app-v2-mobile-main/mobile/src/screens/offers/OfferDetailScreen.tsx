// Offer Detail Screen with Redemption Flow
// FR-12: Show-to-cashier and scan-merchant-code redemption methods
// FR-13: Redemption flow with confirmation step
// FR-14: Enforcement of one-time vs unlimited usage rules

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '../../utils/api';
import { COLORS } from '../../config/constants';

interface Offer {
  id: number;
  uuid: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  minPurchaseAmount?: number;
  category: string;
  terms: string;
  imageUrl?: string;
  validFrom: string;
  validUntil: string;
  featured: boolean;
  scoutExclusive: boolean;
  merchantName?: string;
  merchantLogoUrl?: string;
  merchantAddress?: string;
  usageType: 'one_time' | 'unlimited';
  maxRedemptionsPerUser?: number;
  userRedemptionCount: number;
  isValid: boolean;
  isRedeemed: boolean;
}

type RedemptionMethod = 'show_to_cashier' | 'scan_merchant_code';

export default function OfferDetailScreen() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<RedemptionMethod | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { offerId } = route.params as { offerId: number };

  useEffect(() => {
    loadOffer();
  }, [offerId]);

  const loadOffer = async () => {
    try {
      const response = await apiClient.get(`/api/v1/offers/${offerId}`);
      // Add mock fields for redemption tracking
      setOffer({
        ...response.data,
        usageType: response.data.usageType || 'unlimited',
        userRedemptionCount: response.data.userRedemptionCount || 0,
        isRedeemed: response.data.isRedeemed || false,
        merchantAddress: response.data.merchantAddress || '123 Main Street, Anytown, USA',
      });
    } catch (error) {
      console.error('Error loading offer:', error);
      Alert.alert('Error', 'Failed to load offer');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getDiscountText = () => {
    if (!offer) return '';
    switch (offer.discountType) {
      case 'PERCENTAGE': return `${offer.discountValue}% OFF`;
      case 'FIXED_AMOUNT': return `$${offer.discountValue} OFF`;
      case 'BUY_ONE_GET_ONE': return 'BOGO';
      case 'FREE_ITEM': return 'FREE ITEM';
      case 'SPECIAL_PRICE': return `$${offer.discountValue}`;
      default: return 'DISCOUNT';
    }
  };

  const getDaysRemaining = () => {
    if (!offer) return '';
    const now = new Date();
    const end = new Date(offer.validUntil);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Ends today';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  const canRedeem = () => {
    if (!offer) return false;
    if (!offer.isValid) return false;

    // FR-14: Check usage limits
    if (offer.usageType === 'one_time' && offer.isRedeemed) {
      return false;
    }

    if (offer.maxRedemptionsPerUser && offer.userRedemptionCount >= offer.maxRedemptionsPerUser) {
      return false;
    }

    return true;
  };

  const getRedemptionStatus = () => {
    if (!offer) return '';

    if (offer.usageType === 'one_time') {
      return offer.isRedeemed ? 'Already redeemed' : 'One-time use';
    }

    if (offer.maxRedemptionsPerUser) {
      return `${offer.userRedemptionCount}/${offer.maxRedemptionsPerUser} uses`;
    }

    return 'Unlimited uses';
  };

  // FR-13: Initiate redemption flow
  const handleStartRedemption = () => {
    if (!canRedeem()) {
      Alert.alert('Cannot Redeem', 'This offer is no longer available for redemption.');
      return;
    }
    setShowRedemptionModal(true);
  };

  // FR-12: Select redemption method
  const handleSelectMethod = (method: RedemptionMethod) => {
    setSelectedMethod(method);
  };

  // FR-13: Confirm and process redemption
  const handleConfirmRedemption = async () => {
    if (!selectedMethod || !offer) return;

    setIsRedeeming(true);

    try {
      // Call redemption API - POST /api/v1/offers/{offerId}/redeem
      const response = await apiClient.post(`/api/v1/offers/${offer.id}/redeem`, {
        method: selectedMethod,
        offerId: offer.id,
      });

      // Get updated redemption count from response or increment locally
      const updatedRedemptionCount = response.data?.userRedemptionCount ?? (offer.userRedemptionCount + 1);
      const isNowRedeemed = response.data?.isRedeemed ?? (offer.usageType === 'one_time');

      // Update local state with server response
      setOffer({
        ...offer,
        isRedeemed: isNowRedeemed,
        userRedemptionCount: updatedRedemptionCount,
      });

      setShowRedemptionModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Redemption error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to redeem offer. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setSelectedMethod(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>Loading offer...</Text>
      </View>
    );
  }

  if (!offer) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Offer Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          {offer.imageUrl ? (
            <Image source={{ uri: offer.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.imagePlaceholder]}>
              <Ionicons name="pricetag" size={80} color={COLORS.border} />
            </View>
          )}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{getDiscountText()}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {/* Tags */}
          <View style={styles.tagsRow}>
            {offer.featured && (
              <View style={styles.featuredTag}>
                <Ionicons name="star" size={14} color="#fff" />
                <Text style={styles.tagText}>Featured</Text>
              </View>
            )}
            {offer.scoutExclusive && (
              <View style={styles.scoutTag}>
                <Text style={styles.tagText}>Scout Exclusive</Text>
              </View>
            )}
            <View style={[
              styles.usageTag,
              !canRedeem() && styles.usageTagDisabled
            ]}>
              <Ionicons
                name={offer.usageType === 'one_time' ? 'flash' : 'infinite'}
                size={12}
                color={canRedeem() ? COLORS.secondary : COLORS.textSecondary}
              />
              <Text style={[
                styles.usageTagText,
                !canRedeem() && styles.usageTagTextDisabled
              ]}>
                {getRedemptionStatus()}
              </Text>
            </View>
          </View>

          {/* Title and Merchant */}
          <Text style={styles.title}>{offer.title}</Text>

          {Boolean(offer.merchantName) && (
            <View style={styles.merchantSection}>
              {offer.merchantLogoUrl ? (
                <Image source={{ uri: offer.merchantLogoUrl }} style={styles.merchantLogo} />
              ) : (
                <View style={styles.merchantLogoPlaceholder}>
                  <Ionicons name="storefront" size={20} color={COLORS.textSecondary} />
                </View>
              )}
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>{offer.merchantName}</Text>
                {Boolean(offer.merchantAddress) && (
                  <Text style={styles.merchantAddress}>{offer.merchantAddress}</Text>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>{offer.description}</Text>

          {/* Expiry */}
          <View style={styles.expirySection}>
            <Ionicons name="time-outline" size={18} color={COLORS.warning} />
            <Text style={styles.expiryText}>{getDaysRemaining()}</Text>
            <Text style={styles.expiryDate}>
              Valid until {new Date(offer.validUntil).toLocaleDateString()}
            </Text>
          </View>

          {/* Terms and Conditions */}
          {Boolean(offer.terms) && (
            <View style={styles.termsSection}>
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
              <Text style={styles.termsText}>{offer.terms}</Text>
            </View>
          )}

          {/* Minimum Purchase */}
          {Boolean(offer.minPurchaseAmount) && (
            <View style={styles.minPurchaseSection}>
              <Ionicons name="information-circle" size={18} color={COLORS.secondary} />
              <Text style={styles.minPurchaseText}>
                Minimum purchase: ${offer.minPurchaseAmount?.toFixed(2)}
              </Text>
            </View>
          )}

          {/* How to Redeem */}
          <View style={styles.howToSection}>
            <Text style={styles.sectionTitle}>How to Redeem</Text>
            <View style={styles.howToStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Tap "Redeem Now" when ready to use</Text>
            </View>
            <View style={styles.howToStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Choose your redemption method</Text>
            </View>
            <View style={styles.howToStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Show confirmation to the cashier</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer with Redeem Button */}
      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.redeemButton, !canRedeem() && styles.buttonDisabled]}
            onPress={handleStartRedemption}
            disabled={!canRedeem()}
          >
            <Ionicons
              name={canRedeem() ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={COLORS.surface}
            />
            <Text style={styles.redeemButtonText}>
              {canRedeem() ? 'Redeem Now' : 'Already Redeemed'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Redemption Method Modal (FR-12, FR-13) */}
      <Modal
        visible={showRedemptionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRedemptionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRedemptionModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Redeem Offer</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Offer Summary */}
            <View style={styles.offerSummary}>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeText}>{getDiscountText()}</Text>
              </View>
              <Text style={styles.summaryTitle}>{offer.title}</Text>
              <Text style={styles.summaryMerchant}>{offer.merchantName}</Text>
            </View>

            {/* Redemption Methods (FR-12) */}
            <Text style={styles.methodsTitle}>Choose Redemption Method</Text>

            <TouchableOpacity
              style={[
                styles.methodCard,
                selectedMethod === 'show_to_cashier' && styles.methodCardSelected
              ]}
              onPress={() => handleSelectMethod('show_to_cashier')}
            >
              <View style={styles.methodIcon}>
                <Ionicons name="phone-portrait" size={32} color={COLORS.secondary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>Show to Cashier</Text>
                <Text style={styles.methodDescription}>
                  Present this screen to the cashier during checkout
                </Text>
              </View>
              <View style={[
                styles.methodRadio,
                selectedMethod === 'show_to_cashier' && styles.methodRadioSelected
              ]}>
                {selectedMethod === 'show_to_cashier' && (
                  <Ionicons name="checkmark" size={16} color={COLORS.surface} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                selectedMethod === 'scan_merchant_code' && styles.methodCardSelected
              ]}
              onPress={() => handleSelectMethod('scan_merchant_code')}
            >
              <View style={styles.methodIcon}>
                <Ionicons name="qr-code" size={32} color={COLORS.secondary} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>Scan Merchant Code</Text>
                <Text style={styles.methodDescription}>
                  Let the merchant scan your unique QR code
                </Text>
              </View>
              <View style={[
                styles.methodRadio,
                selectedMethod === 'scan_merchant_code' && styles.methodRadioSelected
              ]}>
                {selectedMethod === 'scan_merchant_code' && (
                  <Ionicons name="checkmark" size={16} color={COLORS.surface} />
                )}
              </View>
            </TouchableOpacity>

            {/* Warning for one-time offers (FR-14) */}
            {offer.usageType === 'one_time' && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  This is a one-time offer. Once redeemed, it cannot be used again.
                </Text>
              </View>
            )}

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedMethod && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirmRedemption}
              disabled={!selectedMethod || isRedeeming}
            >
              {isRedeeming ? (
                <ActivityIndicator color={COLORS.surface} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.surface} />
                  <Text style={styles.confirmButtonText}>Confirm Redemption</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent
        onRequestClose={handleCloseSuccess}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Offer Redeemed!</Text>
            <Text style={styles.successMessage}>
              Show this screen to the cashier to apply your discount.
            </Text>

            <View style={styles.successDetails}>
              <Text style={styles.successDiscount}>{getDiscountText()}</Text>
              <Text style={styles.successOfferTitle}>{offer.title}</Text>
              <Text style={styles.successMerchant}>{offer.merchantName}</Text>
            </View>

            {selectedMethod === 'show_to_cashier' && (
              <View style={styles.redemptionCode}>
                <Text style={styles.redemptionCodeLabel}>Redemption Code</Text>
                <Text style={styles.redemptionCodeValue}>
                  {`RDM-${offer.id}-${Date.now().toString(36).toUpperCase()}`}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.doneButton} onPress={handleCloseSuccess}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.border,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  discountText: {
    color: COLORS.surface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scoutTag: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  usageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  usageTagDisabled: {
    backgroundColor: COLORS.border,
  },
  usageTagText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  usageTagTextDisabled: {
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  merchantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  merchantLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  merchantLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  merchantAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  expirySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  expiryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
  },
  expiryDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 'auto',
  },
  termsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  minPurchaseSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  minPurchaseText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  howToSection: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  howToStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  footerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  redeemButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  modalContent: {
    padding: 20,
  },
  offerSummary: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 24,
  },
  summaryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryBadgeText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryMerchant: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  methodCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: '#E3F2FD',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  methodRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodRadioSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginVertical: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  confirmButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  successDetails: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    marginBottom: 16,
  },
  successDiscount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  successOfferTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  successMerchant: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  redemptionCode: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  redemptionCodeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  redemptionCodeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  doneButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  doneButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
