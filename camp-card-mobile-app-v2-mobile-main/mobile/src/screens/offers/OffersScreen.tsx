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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, favoritesApi } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../config/ThemeContext';
import { analyticsService } from '../../services/analyticsService';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const { colors } = theme;

  const categories = [
    'ALL',
    'FAVORITES',
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
    loadFavorites();
    analyticsService.trackScreenView('OffersScreen');
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getAll();
      const ids: number[] = response.data || [];
      setFavoriteIds(new Set(ids));
    } catch (error) {
      console.log('Failed to load favorites:', error);
    }
  };

  const toggleFavorite = async (offerId: number) => {
    try {
      const response = await favoritesApi.toggle(offerId);
      const nowFavorited = response.data?.favorited;
      analyticsService.trackAction(nowFavorited ? 'offer_favorite' : 'offer_unfavorite', { offerId });
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (nowFavorited) {
          next.add(offerId);
        } else {
          next.delete(offerId);
        }
        return next;
      });
    } catch (error) {
      console.log('Failed to toggle favorite:', error);
    }
  };

  useEffect(() => {
    filterOffers();
  }, [selectedCategory, searchQuery, offers, favoriteIds]);

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

    if (searchQuery.trim()) {
      analyticsService.trackSearch(searchQuery.trim(), filtered.length);
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(query) ||
        o.description?.toLowerCase().includes(query) ||
        o.merchantName?.toLowerCase().includes(query)
      );
    }

    const knownCategories = ['RESTAURANTS', 'RETAIL', 'SERVICES', 'ENTERTAINMENT', 'AUTOMOTIVE', 'HEALTH'];

    if (selectedCategory === 'FAVORITES') {
      filtered = filtered.filter(o => favoriteIds.has(o.id));
    } else if (selectedCategory === 'OTHER') {
      filtered = filtered.filter(o => !o.category || !knownCategories.includes(o.category.toUpperCase()));
    } else if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(o => o.category?.toUpperCase() === selectedCategory.toUpperCase());
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
      style={[styles.offerCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })}
      accessibilityLabel={`${item.title} - ${getDiscountText(item)}`}
      accessibilityRole="button"
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={[styles.offerImage, { backgroundColor: colors.background }]} />
        ) : (
          <View style={[styles.offerImage, styles.imagePlaceholder, { backgroundColor: colors.background }]}>
            <Ionicons name="pricetag" size={48} color={colors.border} />
          </View>
        )}
        {/* Discount Badge - positioned over image */}
        <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.discountText, { color: colors.white }]}>{getDiscountText(item)}</Text>
        </View>
        {/* Heart / Favorite Button */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel={favoriteIds.has(item.id) ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
          accessibilityRole="button"
        >
          <Ionicons
            name={favoriteIds.has(item.id) ? 'heart' : 'heart-outline'}
            size={24}
            color={favoriteIds.has(item.id) ? colors.primary : colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.offerContent}>

        {/* Tags */}
        <View style={styles.tags}>
          {item.featured && (
            <View style={[styles.featuredTag, { backgroundColor: colors.warning }]}>
              <Ionicons name="star" size={12} color={colors.white} />
              <Text style={[styles.featuredText, { color: colors.white }]}>Featured</Text>
            </View>
          )}
          {item.scoutExclusive && (
            <View style={[styles.scoutTag, { backgroundColor: colors.success }]}>
              <Text style={[styles.scoutText, { color: colors.white }]}>Scout Exclusive</Text>
            </View>
          )}
        </View>

        {/* Title and Merchant */}
        <Text style={[styles.offerTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
        {item.merchantName && (
          <View style={styles.merchantInfo}>
            {item.merchantLogoUrl ? (
              <Image source={{ uri: item.merchantLogoUrl }} style={styles.merchantLogo} />
            ) : (
              <Ionicons name="business" size={16} color={colors.textSecondary} />
            )}
            <Text style={[styles.merchantName, { color: colors.textSecondary }]}>{item.merchantName}</Text>
          </View>
        )}

        {/* Description */}
        {item.description && (
          <Text style={[styles.offerDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Footer */}
        <View style={[styles.offerFooter, { borderTopColor: colors.border }]}>
          <View style={styles.footerLeft}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.expiryText, { color: colors.textSecondary }]}>{getDaysRemaining(item.validUntil)}</Text>
          </View>
          <View style={styles.footerRight}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.redemptionText, { color: colors.textSecondary }]}>{item.totalRedemptions} used</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading offers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.secondary }]}>Offers</Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search offers, merchants..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

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
              { backgroundColor: colors.surface, borderColor: colors.border },
              selectedCategory === category && [styles.categoryButtonActive, { backgroundColor: colors.secondary, borderColor: colors.secondary }]
            ]}
            onPress={() => setSelectedCategory(category)}
            accessibilityLabel={`Filter by ${category.replace('_', ' ')}`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.categoryButtonText,
                { color: colors.textSecondary },
                selectedCategory === category && [styles.categoryButtonTextActive, { color: colors.white }]
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
            colors={[colors.secondary]}
            tintColor={colors.secondary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No offers found</Text>
            <Text style={[styles.emptySubtext, { color: colors.border }]}>Try adjusting your filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003f87',
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
    marginTop: 0,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
