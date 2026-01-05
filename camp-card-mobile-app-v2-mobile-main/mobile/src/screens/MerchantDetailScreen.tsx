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
  Linking
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { apiClient } from '../utils/api';

interface MerchantLocation {
  id: number;
  locationName: string;
  streetAddress: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  hours?: string;
  primaryLocation: boolean;
}

interface Merchant {
  id: number;
  uuid: string;
  businessName: string;
  dbaName?: string;
  description: string;
  category: string;
  contactPhone?: string;
  websiteUrl?: string;
  logoUrl?: string;
  activeOffers: number;
  totalRedemptions: number;
  locations: MerchantLocation[];
}

export default function MerchantDetailScreen() {
  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MerchantLocation | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { merchantId } = route.params as { merchantId: number };

  useEffect(() => {
    loadMerchant();
  }, [merchantId]);

  const loadMerchant = async () => {
    try {
      const response = await apiClient.get(`/merchants/${merchantId}`);
      setMerchant(response.data);
      
      // Set primary location or first location as selected
      const primaryLoc = response.data.locations?.find((l: MerchantLocation) => l.primaryLocation);
      setSelectedLocation(primaryLoc || response.data.locations?.[0] || null);
    } catch (error) {
      console.error('Error loading merchant:', error);
      Alert.alert('Error', 'Failed to load merchant details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    const phone = selectedLocation?.phone || merchant?.contactPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleDirections = () => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      const url = `https://maps.google.com/?q=${selectedLocation.latitude},${selectedLocation.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleWebsite = () => {
    if (merchant?.websiteUrl) {
      Linking.openURL(merchant.websiteUrl);
    }
  };

  const handleViewOffers = () => {
    navigation.navigate('Offers', { merchantId: merchant?.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003f87" />
      </View>
    );
  }

  if (!merchant) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#003f87" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {merchant.businessName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {merchant.logoUrl ? (
            <Image source={{ uri: merchant.logoUrl }} style={styles.heroLogo} />
          ) : (
            <View style={[styles.heroLogo, styles.logoPlaceholder]}>
              <Ionicons name="business-outline" size={64} color="#ccc" />
            </View>
          )}
          
          <Text style={styles.businessName}>{merchant.businessName}</Text>
          {merchant.dbaName && (
            <Text style={styles.dbaName}>{merchant.dbaName}</Text>
          )}
          <Text style={styles.category}>{merchant.category}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewOffers}
          >
            <Ionicons name="pricetag" size={24} color="#ce1126" />
            <Text style={styles.actionButtonText}>
              {merchant.activeOffers} Offers
            </Text>
          </TouchableOpacity>

          {(selectedLocation?.phone || merchant.contactPhone) && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCall}
            >
              <Ionicons name="call" size={24} color="#003f87" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
          )}

          {selectedLocation?.latitude && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDirections}
            >
              <Ionicons name="navigate" size={24} color="#003f87" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          )}

          {merchant.websiteUrl && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleWebsite}
            >
              <Ionicons name="globe" size={24} color="#003f87" />
              <Text style={styles.actionButtonText}>Website</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description */}
        {merchant.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{merchant.description}</Text>
          </View>
        )}

        {/* Map */}
        {selectedLocation?.latitude && selectedLocation?.longitude && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title={selectedLocation.locationName}
              />
            </MapView>
          </View>
        )}

        {/* Locations */}
        {merchant.locations && merchant.locations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {merchant.locations.length === 1 ? 'Location' : 'Locations'}
            </Text>
            {merchant.locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationCard,
                  selectedLocation?.id === location.id && styles.locationCardActive
                ]}
                onPress={() => setSelectedLocation(location)}
              >
                <View style={styles.locationHeader}>
                  <Ionicons 
                    name={location.primaryLocation ? "star" : "location"} 
                    size={20} 
                    color={location.primaryLocation ? "#ce1126" : "#003f87"} 
                  />
                  <Text style={styles.locationName}>{location.locationName}</Text>
                </View>
                
                <Text style={styles.locationAddress}>
                  {location.streetAddress}
                  {location.addressLine2 && `\n${location.addressLine2}`}
                </Text>
                <Text style={styles.locationAddress}>
                  {location.city}, {location.state} {location.zipCode}
                </Text>

                {location.phone && (
                  <View style={styles.locationDetail}>
                    <Ionicons name="call-outline" size={16} color="#666" />
                    <Text style={styles.locationDetailText}>{location.phone}</Text>
                  </View>
                )}

                {location.hours && (
                  <View style={styles.locationDetail}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.locationDetailText}>{location.hours}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="pricetag-outline" size={32} color="#ce1126" />
              <Text style={styles.statValue}>{merchant.activeOffers}</Text>
              <Text style={styles.statLabel}>Active Offers</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{merchant.totalRedemptions}</Text>
              <Text style={styles.statLabel}>Total Redemptions</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="location-outline" size={32} color="#003f87" />
              <Text style={styles.statValue}>{merchant.locations?.length || 0}</Text>
              <Text style={styles.statLabel}>Locations</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  heroSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  heroLogo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 16,
  },
  logoPlaceholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  dbaName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  map: {
    height: 200,
    borderRadius: 8,
  },
  locationCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  locationCardActive: {
    borderColor: '#003f87',
    borderWidth: 2,
    backgroundColor: '#f0f7ff',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
