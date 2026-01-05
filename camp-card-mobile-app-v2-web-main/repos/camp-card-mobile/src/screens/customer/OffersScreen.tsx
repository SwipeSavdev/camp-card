import React, { useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../components/Card';
import { colors, space, radius, shadow } from '../../theme';
import { listOffers, OfferListItem } from '../../services/offersService';

type Props = {
 navigation: any;
};

function OfferRow({ item, onPress }: { item: OfferListItem; onPress: () => void }) {
 const distance = item.locations?.[0]?.distance_km;
 const isNew = Math.random() > 0.7; // Random "new" badge for demo

 return (
 <TouchableOpacity
 onPress={onPress}
 activeOpacity={0.85}
 style={{
 marginBottom: space.md,
 backgroundColor: colors.white,
 borderRadius: radius.lg,
 padding: space.md,
 ...shadow.card,
 }}
 >
 {/* Header with category badge */}
 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }} numberOfLines={2}>
 {item.title}
 </Text>
 <Text style={{ marginTop: 4, fontSize: 13, color: colors.muted }} numberOfLines={1}>
 {item.merchant?.business_name}
 </Text>
 </View>
 {isNew && (
 <View
 style={{
 backgroundColor: colors.red500,
 paddingHorizontal: space.sm,
 paddingVertical: 4,
 borderRadius: radius.sm,
 marginLeft: space.sm,
 }}
 >
 <Text style={{ fontSize: 10, fontWeight: '700', color: colors.white }}>NEW</Text>
 </View>
 )}
 </View>

 {/* Description */}
 <Text style={{ marginTop: space.md, fontSize: 12, color: colors.text, lineHeight: 18 }} numberOfLines={2}>
 {item.description}
 </Text>

 {/* Footer with distance and category */}
 <View style={{ marginTop: space.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
 <View style={{ flexDirection: 'row', gap: space.sm, flex: 1 }}>
 {typeof distance === 'number' && (
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
 <Ionicons name="location-outline" size={12} color={colors.muted} />
 <Text style={{ fontSize: 11, color: colors.muted }}>
 {distance.toFixed(1)} km
 </Text>
 </View>
 )}
 {item.category && (
 <View
 style={{
 backgroundColor: colors.gray50,
 paddingHorizontal: space.sm,
 paddingVertical: 2,
 borderRadius: radius.sm,
 }}
 >
 <Text style={{ fontSize: 10, color: colors.text, fontWeight: '600' }}>
 {item.category}
 </Text>
 </View>
 )}
 </View>
 <Ionicons name="chevron-forward" size={16} color={colors.blue500} />
 </View>

 {item.can_redeem === false && (
 <View
 style={{
 marginTop: space.md,
 backgroundColor: '#fee2e2',
 padding: space.sm,
 borderRadius: radius.sm,
 }}
 >
 <Text style={{ fontSize: 11, color: colors.red600, fontWeight: '600' }}>
 Subscription required to redeem
 </Text>
 </View>
 )}
 </TouchableOpacity>
 );
}

export default function CustomerOffersScreen({ navigation }: Props) {
 const { data, isLoading, refetch } = useQuery({
 queryKey: ['offers'],
 queryFn: () => listOffers({ limit: 25, offset: 0 }),
 });

 const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

 const categories = ['All', 'Dining', 'Entertainment', 'Auto', 'Retail'];

 const filteredOffers = selectedCategory && selectedCategory !== 'All'
 ? data?.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase())
 : data;

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>Offers</Text>
 <Text style={{ marginTop: 6, color: colors.muted, fontSize: 14 }}>
 Browse {data?.length || 0} discounts available in your area
 </Text>
 </View>

 {/* Category Filter */}
 <ScrollView
 horizontal
 showsHorizontalScrollIndicator={false}
 contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.sm }}
 >
 {categories.map((cat) => (
 <TouchableOpacity
 key={cat}
 onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
 style={{
 paddingHorizontal: space.md,
 paddingVertical: space.sm,
 borderRadius: radius.button,
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

 <FlatList
 contentContainerStyle={{ padding: space.lg }}
 data={filteredOffers ?? []}
 keyExtractor={item => String(item.id)}
 refreshing={isLoading}
 onRefresh={refetch}
 renderItem={({ item }) => (
 <OfferRow item={item} onPress={() => navigation.navigate('OfferDetails', { offerId: item.id })} />
 )}
 ListEmptyComponent={
 !isLoading ? (
 <View style={{ padding: space.lg, alignItems: 'center' }}>
 <Ionicons name="receipt-outline" size={48} color={colors.gray200} />
 <Text style={{ color: colors.muted, marginTop: space.md, fontSize: 14 }}>
 No offers found
 </Text>
 <Text style={{ color: colors.muted, fontSize: 12, marginTop: space.sm }}>
 Try adjusting your filters
 </Text>
 </View>
 ) : null
 }
 />
 </SafeAreaView>
 );
}
