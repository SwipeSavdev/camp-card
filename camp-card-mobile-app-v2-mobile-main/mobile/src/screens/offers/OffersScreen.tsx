import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  FlatList,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

interface Offer {
  id: number;
  uuid: string;
  merchantId: number;
  merchantName?: string;
  merchantLogoUrl?: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  category: string;
  imageUrl?: string;
  validFrom: string;
  validUntil: string;
  featured: boolean;
  scoutExclusive: boolean;
  totalRedemptions: number;
  remainingRedemptions?: number;
  isValid: boolean;
  usageLimitPerUser?: number;
  userRedemptionCount?: number;
  userHasReachedLimit?: boolean;
}

export default function OffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const categories = [
    'ALL',
    'RESTAURANTS',
    'RETAIL',
    'SERVICES',
    'ENTERTAINMENT',
    'AUTOMOTIVE',
    'HEALTH',
    'OTHER'
  ];

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    filterOffers();
  }, [selectedCategory, offers]);

  const loadOffers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Use user-specific endpoint if user is logged in to get redemption data
      const endpoint = user?.id
        ? `/api/v1/offers/active/user/${user.id}`
        : '/api/v1/offers/active';

      const response = await apiClient.get(endpoint);
      const allOffers = response.data.content || response.data;

      // Filter out offers where user has reached their redemption limit
      const availableOffers = allOffers.filter((offer: Offer) => {
        // If userHasReachedLimit is true, hide the offer
        if (offer.userHasReachedLimit === true) {
          return false;
        }
        return true;
      });

      setOffers(availableOffers);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadOffers(true);
  }, [user?.id]);

  const filterOffers = () => {
    let filtered = [...offers];

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(o => o.category === selectedCategory);
    }

    setFilteredOffers(filtered);
  };

  const getDiscountText = (offer: Offer) => {
    switch (offer.discountType) {
      case 'PERCENTAGE':
        return `${offer.discountValue}% OFF`;
      case 'FIXED_AMOUNT':
        return `$${offer.discountValue} OFF`;
      case 'BUY_ONE_GET_ONE':
        return 'BOGO';
      case 'FREE_ITEM':
        return 'FREE ITEM';
      case 'SPECIAL_PRICE':
        return 'SPECIAL PRICE';
      default:
        return 'DISCOUNT';
    }
  };

  const getDaysRemaining = (validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Ends today';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  const renderOfferCard = ({ item }: { item: Offer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.offerImage} />
        ) : (
          <View style={[styles.offerImage, styles.imagePlaceholder]}>
            <Ionicons name="pricetag" size={48} color="#ccc" />
          </View>
        )}
        {/* Discount Badge - positioned over image */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{getDiscountText(item)}</Text>
        </View>
      </View>

      <View style={styles.offerContent}>

        {/* Tags */}
        <View style={styles.tags}>
          {item.featured && (
            <View style={styles.featuredTag}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          {item.scoutExclusive && (
            <View style={styles.scoutTag}>
              <Text style={styles.scoutText}>Scout Exclusive</Text>
            </View>
          )}
        </View>

        {/* Title and Merchant */}
        <Text style={styles.offerTitle} numberOfLines={2}>{item.title}</Text>
        {item.merchantName && (
          <View style={styles.merchantInfo}>
            {item.merchantLogoUrl ? (
              <Image source={{ uri: item.merchantLogoUrl }} style={styles.merchantLogo} />
            ) : (
              <Ionicons name="business" size={16} color="#666" />
            )}
            <Text style={styles.merchantName}>{item.merchantName}</Text>
          </View>
        )}

        {/* Description */}
        {item.description && (
          <Text style={styles.offerDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.offerFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.expiryText}>{getDaysRemaining(item.validUntil)}</Text>
          </View>
          <View style={styles.footerRight}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.redemptionText}>{item.totalRedemptions} used</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003f87" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}
            >
              {category.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Offers List */}
      <FlatList
        data={filteredOffers}
        renderItem={renderOfferCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#003f87']}
            tintColor="#003f87"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No offers found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    flexGrow: 0,
    marginBottom: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#003f87',
    borderColor: '#003f87',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  offerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerContent: {
    padding: 16,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#ce1126',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  discountText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  featuredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scoutTag: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scoutText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  merchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  merchantLogo: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  merchantName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    fontSize: 13,
    color: '#666',
  },
  redemptionText: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
});
