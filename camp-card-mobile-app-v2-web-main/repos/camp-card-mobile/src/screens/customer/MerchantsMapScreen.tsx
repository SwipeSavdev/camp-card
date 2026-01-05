import React, { useEffect, useState } from 'react';
import {
 SafeAreaView,
 Text,
 View,
 FlatList,
 TouchableOpacity,
 ActivityIndicator,
 Linking,
 ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

// Location is optional - gracefully handle if not available
let Location: any = null;
try {
 Location = require('expo-location');
} catch (e) {
 // expo-location not available
}

import Card from '../../components/Card';
import { colors, radius, space, shadow } from '../../theme';
import { getNearbyMerchants, Merchant } from '../../services/merchantsService';

type Props = {
 navigation: any;
};

export default function MerchantsMapScreen({ navigation }: Props) {
 const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
 const [searchRadius, setSearchRadius] = useState(10);
 const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

 const categories = ['All', 'DINING', 'AUTO', 'ENTERTAINMENT', 'RETAIL', 'SERVICES', 'HEALTH', 'TRAVEL'];

 // Fetch nearby merchants based on location
 const { data: merchants = [], isLoading } = useQuery({
 queryKey: ['nearby-merchants', location?.latitude, location?.longitude, searchRadius],
 queryFn: () => {
 if (!location) return Promise.resolve([]);
 return getNearbyMerchants(location.latitude, location.longitude, searchRadius);
 },
 enabled: !!location,
 });

 useEffect(() => {
 requestLocationPermission();
 }, []);

 const requestLocationPermission = async () => {
 try {
 // Use default Orlando location (Location permissions require device)
 setLocation({ latitude: 28.54, longitude: -81.38 });
 } catch (error) {
 console.error('Location error:', error);
 // Use default location on error
 setLocation({ latitude: 28.54, longitude: -81.38 });
 }
 };

 const openMapsApp = (lat: number | undefined, lng: number | undefined, name: string) => {
 if (lat && lng) {
 const url = `https://maps.google.com/?q=${lat},${lng}`;
 Linking.openURL(url);
 }
 };

 const filteredMerchants = selectedCategory && selectedCategory !== 'All'
 ? merchants.filter(m => m.category?.toUpperCase() === selectedCategory.toUpperCase())
 : merchants;

 const categoryIcons: { [key: string]: any } = {
 DINING: 'restaurant-outline',
 AUTO: 'car-outline',
 ENTERTAINMENT: 'game-controller-outline',
 RETAIL: 'bag-outline',
 SERVICES: 'cog-outline',
 HEALTH: 'heart-outline',
 TRAVEL: 'airplane-outline',
 };

 const categoryColors: { [key: string]: string } = {
 DINING: '#f97316',
 AUTO: '#06b6d4',
 ENTERTAINMENT: '#a855f7',
 RETAIL: '#ec4899',
 SERVICES: '#8b5cf6',
 HEALTH: '#ef4444',
 TRAVEL: '#06b6d4',
 };

 const MerchantItem = ({ item }: { item: Merchant }) => {
 const distance = item.locations?.[0]?.distance_km ?? 0;
 const lat = item.locations?.[0]?.latitude;
 const lng = item.locations?.[0]?.longitude;
 const address = item.locations?.[0]?.address || item.locations?.[0]?.name || 'No address';

 return (
 <TouchableOpacity
 onPress={() => openMapsApp(lat, lng, item.business_name)}
 activeOpacity={0.85}
 style={{
 backgroundColor: colors.white,
 borderRadius: radius.lg,
 padding: space.md,
 marginBottom: space.md,
 ...shadow.card,
 }}
 >
 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <View style={{ flex: 1 }}>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm }}>
 <View
 style={{
 width: 36,
 height: 36,
 borderRadius: 18,
 backgroundColor: categoryColors[item.category || 'RETAIL'] || colors.blue500,
 opacity: 0.2,
 justifyContent: 'center',
 alignItems: 'center',
 }}
 >
 <Ionicons
 name={categoryIcons[item.category || 'RETAIL'] || 'business-outline'}
 size={18}
 color={categoryColors[item.category || 'RETAIL'] || colors.blue500}
 />
 </View>
 <View>
 <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }} numberOfLines={1}>
 {item.business_name}
 </Text>
 <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
 {item.category || 'General'}
 </Text>
 </View>
 </View>
 <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 0 }} numberOfLines={1}>
  {address}
 </Text>
 </View>
 <View style={{ alignItems: 'flex-end' }}>
 <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
 {distance.toFixed(1)} km
 </Text>
 <View style={{ flexDirection: 'row', gap: 4, marginTop: space.sm }}>
 {item.total_offers && (
 <Text style={{ fontSize: 10, color: colors.muted }}>
 {item.total_offers} offer{item.total_offers !== 1 ? 's' : ''}
 </Text>
 )}
 </View>
 </View>
 </View>
 </TouchableOpacity>
 );
 };

 if (!location) {
 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50, justifyContent: 'center', alignItems: 'center' }}>
 <ActivityIndicator size="large" color={colors.blue500} />
 <Text style={{ marginTop: space.md, color: colors.muted }}>Finding nearby merchants...</Text>
 </SafeAreaView>
 );
 }

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 {/* Header */}
 <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md }}>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md }}>
 <Ionicons name="map-outline" size={28} color={colors.blue500} />
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>Nearby</Text>
 </View>
 <Text style={{ color: colors.muted, fontSize: 14 }}>
 {isLoading ? 'Loading merchants...' : `${filteredMerchants.length} merchants within ${searchRadius} km`}
 </Text>
 </View>

 <ScrollView showsVerticalScrollIndicator={false}>
 {/* Radius Filter */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.md }}>
 <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: space.sm }}>
 Search Radius: {searchRadius} km
 </Text>
 <View style={{ flexDirection: 'row', gap: space.sm }}>
 {[5, 10, 15, 20].map(r => (
 <TouchableOpacity
 key={r}
 onPress={() => setSearchRadius(r)}
 style={{
 flex: 1,
 paddingVertical: space.sm,
 borderRadius: radius.md,
 backgroundColor: searchRadius === r ? colors.blue500 : colors.white,
 borderWidth: 1,
 borderColor: searchRadius === r ? colors.blue500 : colors.gray200,
 alignItems: 'center',
 ...shadow.card,
 }}
 >
 <Text
 style={{
 fontSize: 11,
 fontWeight: '600',
 color: searchRadius === r ? colors.white : colors.text,
 }}
 >
 {r} km
 </Text>
 </TouchableOpacity>
 ))}
 </View>
 </View>

 {/* Category Filter */}
 <ScrollView
 horizontal
 showsHorizontalScrollIndicator={false}
 contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.sm }}
 >
 {categories.map(cat => (
 <TouchableOpacity
 key={cat}
 onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
 style={{
 paddingHorizontal: space.md,
 paddingVertical: space.sm,
 borderRadius: radius.md,
 backgroundColor: (selectedCategory === cat || (cat === 'All' && !selectedCategory))
 ? colors.red500
 : colors.white,
 borderWidth: 1,
 borderColor: (selectedCategory === cat || (cat === 'All' && !selectedCategory))
 ? colors.red500
 : colors.gray200,
 }}
 >
 <Text
 style={{
 fontSize: 12,
 fontWeight: '600',
 color: (selectedCategory === cat || (cat === 'All' && !selectedCategory))
 ? colors.white
 : colors.text,
 }}
 >
 {cat}
 </Text>
 </TouchableOpacity>
 ))}
 </ScrollView>

 {/* Loading State */}
 {isLoading && (
 <View style={{ paddingVertical: space.xl, alignItems: 'center' }}>
 <ActivityIndicator size="large" color={colors.blue500} />
 <Text style={{ color: colors.muted, marginTop: space.md, fontSize: 12 }}>
 Loading merchants...
 </Text>
 </View>
 )}

 {/* Merchants List */}
 {!isLoading && (
 <View style={{ paddingHorizontal: space.lg }}>
 {filteredMerchants.length > 0 ? (
 filteredMerchants.map(merchant => (
 <MerchantItem key={merchant.id} item={merchant} />
 ))
 ) : (
 <View style={{ paddingVertical: space.xl, alignItems: 'center' }}>
 <Ionicons name="location-outline" size={48} color={colors.gray200} />
 <Text style={{ color: colors.muted, marginTop: space.md, fontSize: 14, fontWeight: '600' }}>
 No merchants found
 </Text>
 <Text style={{ color: colors.muted, fontSize: 12, marginTop: space.sm, textAlign: 'center' }}>
 Try increasing the search radius or changing your filters
 </Text>
 </View>
 )}
 </View>
 )}

 {/* Info Card */}
 <View style={{ paddingHorizontal: space.lg, marginTop: space.lg, marginBottom: space.xl }}>
 <Card>
 <View style={{ flexDirection: 'row', gap: space.md }}>
 <Ionicons name="information-circle-outline" size={24} color={colors.blue500} />
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
 Location enabled
 </Text>
 <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4, lineHeight: 16 }}>
 Tap any merchant to open directions in Google Maps
 </Text>
 </View>
 </View>
 </Card>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}
