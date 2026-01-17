import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation, useDistance } from '../hooks/useLocation';
import { merchantsApi } from '../utils/api';

interface MerchantLocation {
  id: number;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

interface Merchant {
  id: number;
  uuid: string;
  businessName: string;
  dbaName?: string;
  description: string;
  category: string;
  logoUrl?: string;
  activeOffers: number;
  totalRedemptions: number;
  locations: MerchantLocation[];
  distance?: number; // Distance in miles from user
}

const CATEGORIES = [
  { id: 'ALL', name: 'All', icon: 'grid-outline' },
  { id: 'RESTAURANTS', name: 'Dining', icon: 'restaurant-outline' },
  { id: 'RETAIL', name: 'Shopping', icon: 'cart-outline' },
  { id: 'SERVICES', name: 'Services', icon: 'construct-outline' },
  { id: 'ENTERTAINMENT', name: 'Fun', icon: 'film-outline' },
  { id: 'AUTOMOTIVE', name: 'Auto', icon: 'car-outline' },
  { id: 'HEALTH', name: 'Health', icon: 'fitness-outline' },
];

// Format distance for display
function formatDistanceDisplay(miles: number): string {
  if (miles < 0.1) {
    return 'Nearby';
  }
  if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

export default function MerchantsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  // Use the location hook for device location (uses expo-location under the hood)
  const location = useLocation({ enableHighAccuracy: false });
  // Use the distance hook for calculating distances (uses AWS Location Service backend)
  const { calculateDistance } = useDistance();

  useEffect(() => {
    location.getCurrentPosition();
    loadMerchants();
  }, []);

  useEffect(() => {
    filterMerchants();
  }, [selectedCategory, searchQuery, merchants, location.latitude, location.longitude]);

  const loadMerchants = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await merchantsApi.getMerchants({
        status: 'APPROVED',
        size: 100
      });

      const merchantData = response.data.content || response.data || [];
      setMerchants(merchantData);
    } catch (error) {
      console.error('Error loading merchants:', error);
      Alert.alert('Error', 'Failed to load merchants. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    location.getCurrentPosition();
    loadMerchants(true);
  }, []);

  const filterMerchants = () => {
    let filtered = [...merchants];

    // Calculate distance for each merchant using AWS Location Service
    if (location.hasLocation && location.latitude && location.longitude) {
      filtered = filtered.map((merchant) => {
        // Find the closest location for this merchant
        let minDistance = Infinity;
        if (merchant.locations && merchant.locations.length > 0) {
          merchant.locations.forEach((loc) => {
            if (loc.latitude && loc.longitude) {
              const distResult = calculateDistance(
                location.latitude!,
                location.longitude!,
                loc.latitude,
                loc.longitude
              );
              if (distResult.miles < minDistance) {
                minDistance = distResult.miles;
              }
            }
          });
        }
        return {
          ...merchant,
          distance: minDistance === Infinity ? undefined : minDistance,
        };
      });

      // Sort by distance (closest first), merchants without location go to end
      filtered.sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    // Filter by category (case-insensitive comparison)
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((m) =>
        m.category?.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.businessName.toLowerCase().includes(query) ||
          m.dbaName?.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query)
      );
    }

    setFilteredMerchants(filtered);
  };

  const handleMerchantPress = (merchant: Merchant) => {
    navigation.navigate('MerchantDetail', { merchantId: merchant.id });
  };

  const renderCategory = ({ item }: { item: (typeof CATEGORIES)[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={24}
        color={selectedCategory === item.id ? '#003f87' : '#666'}
      />
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMerchant = ({ item }: { item: Merchant }) => (
    <TouchableOpacity
      style={styles.merchantCard}
      onPress={() => handleMerchantPress(item)}
    >
      <View style={styles.merchantHeader}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Ionicons name="business-outline" size={32} color="#ccc" />
          </View>
        )}

        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName} numberOfLines={1}>
            {item.businessName}
          </Text>
          {item.dbaName && (
            <Text style={styles.dbaName} numberOfLines={1}>
              {item.dbaName}
            </Text>
          )}
          <Text style={styles.merchantCategory}>{item.category}</Text>
        </View>

        <View style={styles.rightSection}>
          {item.distance !== undefined && (
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={12} color="#003f87" />
              <Text style={styles.distanceText}>{formatDistanceDisplay(item.distance)}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.merchantFooter}>
        <View style={styles.statItem}>
          <Ionicons name="pricetag-outline" size={16} color="#ce1126" />
          <Text style={styles.statText}>
            {item.activeOffers} {item.activeOffers === 1 ? 'Offer' : 'Offers'}
          </Text>
        </View>

        {item.locations && item.locations.length > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={16} color="#003f87" />
            <Text style={styles.statText}>
              {item.locations[0].city}, {item.locations[0].state}
              {item.locations.length > 1 && ` +${item.locations.length - 1}`}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003f87" />
        <Text style={styles.loadingText}>Loading merchants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Merchants</Text>
        {location.hasLocation ? (
          <View style={styles.locationIndicator}>
            <Ionicons name="location" size={16} color="#4CAF50" />
            <Text style={styles.locationText}>Near you</Text>
          </View>
        ) : location.error ? (
          <TouchableOpacity onPress={() => location.getCurrentPosition()}>
            <View style={styles.locationIndicator}>
              <Ionicons name="location-outline" size={16} color="#999" />
              <Text style={styles.locationErrorText}>Enable location</Text>
            </View>
          </TouchableOpacity>
        ) : location.loading ? (
          <View style={styles.locationIndicator}>
            <ActivityIndicator size="small" color="#003f87" />
            <Text style={styles.locationErrorText}>Getting location...</Text>
          </View>
        ) : null}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchants..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.categoriesContainer}
      />

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredMerchants.length} {filteredMerchants.length === 1 ? 'merchant' : 'merchants'}
        </Text>
      </View>

      {/* Merchants List */}
      <FlatList
        data={filteredMerchants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMerchant}
        contentContainerStyle={styles.listContainer}
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
            <Ionicons name="business-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No merchants found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Check back soon for new merchants'}
            </Text>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003f87',
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  locationErrorText: {
    fontSize: 12,
    color: '#999',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: '#f0f7ff',
    borderColor: '#003f87',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#003f87',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  merchantCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dbaName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  merchantCategory: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: '#003f87',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  merchantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
