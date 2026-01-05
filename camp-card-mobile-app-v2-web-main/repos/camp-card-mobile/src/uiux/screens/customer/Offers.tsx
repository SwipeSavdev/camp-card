import React, { useEffect, useState } from "react";
import {
 View,
 Text,
 ScrollView,
 FlatList,
 Pressable,
 ActivityIndicator,
 Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, space, radius } from "../../theme";
import { listOffers, OfferListItem } from "../../../services/offersService";
import { activateOffer } from "../../../services/redemptionService";
import { useAuthStore } from "../../../store/authStore";

type RootStackNavigationProp = NativeStackNavigationProp<any>;

export default function CustomerOffers() {
 const navigation = useNavigation<RootStackNavigationProp>();
 const userId = useAuthStore((s) => s.user?.id);
 const [offers, setOffers] = useState<OfferListItem[]>([]);
 const [filteredOffers, setFilteredOffers] = useState<OfferListItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [redemptionLoading, setRedemptionLoading] = useState<number | null>(null);
 const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

 const categories = ["All", "DINING", "AUTO", "ENTERTAINMENT"];

 useEffect(() => {
 loadOffers();
 }, []);

 useEffect(() => {
 filterOffers();
 }, [selectedCategory, offers]);

 const loadOffers = async () => {
 try {
 setLoading(true);
 const data = await listOffers();
 setOffers(data);
 } catch (error) {
 console.error("Failed to load offers:", error);
 Alert.alert("Error", "Failed to load offers");
 } finally {
 setLoading(false);
 }
 };

 const filterOffers = () => {
 if (!selectedCategory || selectedCategory === "All") {
 setFilteredOffers(offers);
 } else {
 setFilteredOffers(
 offers.filter((offer) => offer.category === selectedCategory)
 );
 }
 };

 const handleRedeem = async (offer: OfferListItem) => {
 Alert.alert(
 "Redeem Offer",
 `Are you sure you want to redeem "${offer.title}" from ${offer.merchant.business_name}?`,
 [
 { text: "Cancel", onPress: () => {} },
 {
 text: "Redeem",
 onPress: async () => {
 try {
 setRedemptionLoading(offer.id);
 const redemptionCode = await activateOffer({
 offerId: offer.id,
 });
 setRedemptionLoading(null);
 navigation.navigate("RedemptionCode", {
 redemption: redemptionCode,
 });
 } catch (error: any) {
 setRedemptionLoading(null);
 const errorMessage =
 error.response?.data?.message ||
 error.message ||
 "Failed to redeem offer";
 Alert.alert("Error", errorMessage);
 }
 },
 },
 ]
 );
 };

 const handleSaveOffer = (offer: OfferListItem) => {
 Alert.alert(
 "Saved",
 `"${offer.title}" has been saved to your favorites`
 );
 };

 const handleLearnMore = (offer: OfferListItem) => {
 Alert.alert(
 offer.title,
 offer.description
 );
 };

 const renderOfferCard = ({ item }: { item: OfferListItem }) => (
 <View
 style={{
 backgroundColor: "white",
 borderRadius: radius.card,
 marginBottom: space.md,
 overflow: "hidden",
 shadowColor: "#000",
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.08,
 shadowRadius: 4,
 elevation: 2,
 }}
 >
 {/* Offer Header with Merchant */}
 <View
 style={{
 padding: space.md,
 borderBottomWidth: 1,
 borderBottomColor: colors.gray200,
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "center",
 }}
 >
 <View style={{ flex: 1 }}>
 <Text
 style={{ fontSize: 12, color: colors.text, fontWeight: "600" }}
 numberOfLines={1}
 >
 {item.merchant.business_name}
 </Text>
 <Text
 style={{
 fontSize: 16,
 fontWeight: "700",
 color: colors.text,
 marginTop: space.sm,
 }}
 numberOfLines={2}
 >
 {item.title}
 </Text>
 </View>
 <Pressable onPress={() => handleSaveOffer(item)}>
 <Ionicons name="bookmark-outline" size={24} color={colors.muted} />
 </Pressable>
 </View>

 {/* Offer Details */}
 <View style={{ padding: space.md }}>
 <Text
 style={{ fontSize: 13, color: colors.muted, lineHeight: 20 }}
 numberOfLines={3}
 >
 {item.description}
 </Text>

 {/* Location Info */}
 {item.locations && item.locations.length > 0 && (
 <View
 style={{
 marginTop: space.md,
 paddingTop: space.md,
 borderTopWidth: 1,
 borderTopColor: colors.gray200,
 flexDirection: "row",
 alignItems: "flex-start",
 gap: space.sm,
 }}
 >
 <Ionicons
 name="location-outline"
 size={16}
 color={colors.muted}
 style={{ marginTop: 2 }}
 />
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 12, color: colors.text, fontWeight: "600" }}>
 {item.locations[0].name}
 </Text>
 <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
 {item.locations[0].address}
 </Text>
 {item.locations[0].distance_km && (
 <Text style={{ fontSize: 11, color: colors.blue500, marginTop: 2, fontWeight: "600" }}>
 {item.locations[0].distance_km.toFixed(1)} km away
 </Text>
 )}
 </View>
 </View>
 )}

 {/* Validity Info */}
 <View
 style={{
 marginTop: space.md,
 paddingHorizontal: space.sm,
 paddingVertical: space.xs,
 backgroundColor: colors.gray50,
 borderRadius: radius.button,
 }}
 >
 <Text style={{ fontSize: 11, color: colors.muted }}>
 {item.valid_until
 ? `Valid until ${new Date(item.valid_until).toLocaleDateString()}`
 : "No expiration"}
 </Text>
 </View>
 </View>

 {/* Action Buttons */}
 <View
 style={{
 flexDirection: "row",
 gap: space.sm,
 padding: space.md,
 borderTopWidth: 1,
 borderTopColor: colors.gray200,
 }}
 >
 <Pressable
 onPress={() => handleLearnMore(item)}
 style={{
 flex: 1,
 backgroundColor: colors.blue50,
 paddingVertical: space.md,
 borderRadius: radius.button,
 alignItems: "center",
 borderWidth: 1,
 borderColor: colors.blue200,
 }}
 >
 <Text style={{ color: colors.blue500, fontWeight: "600", fontSize: 12 }}>
 Learn More
 </Text>
 </Pressable>
 <Pressable
 onPress={() => handleRedeem(item)}
 disabled={redemptionLoading === item.id}
 style={{
 flex: 1,
 backgroundColor:
 redemptionLoading === item.id ? colors.gray300 : colors.red500,
 paddingVertical: space.md,
 borderRadius: radius.button,
 alignItems: "center",
 opacity: redemptionLoading === item.id ? 0.7 : 1,
 }}
 >
 {redemptionLoading === item.id ? (
 <ActivityIndicator color="white" size="small" />
 ) : (
 <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
 Redeem
 </Text>
 )}
 </Pressable>
 </View>
 </View>
 );

 if (loading) {
 return (
 <View
 style={{
 flex: 1,
 justifyContent: "center",
 alignItems: "center",
 backgroundColor: colors.gray50,
 }}
 >
 <ActivityIndicator size="large" color={colors.red500} />
 </View>
 );
 }

 return (
 <View style={{ flex: 1, backgroundColor: colors.gray50 }}>
 {/* Header */}
 <View style={{ padding: space.lg, backgroundColor: colors.navy900 }}>
 <Text style={{ fontSize: 24, fontWeight: "800", color: "white" }}>
 Discount Offers
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 {filteredOffers.length} available offers
 </Text>
 </View>

 {/* Category Filter */}
 <View
 style={{
 paddingVertical: space.md,
 paddingHorizontal: space.lg,
 backgroundColor: "white",
 borderBottomWidth: 1,
 borderBottomColor: colors.gray200,
 }}
 >
 <FlatList
 data={categories}
 horizontal
 showsHorizontalScrollIndicator={false}
 keyExtractor={(item) => item}
 contentContainerStyle={{ gap: space.sm }}
 renderItem={({ item }) => (
 <Pressable
 onPress={() =>
 setSelectedCategory(item === "All" ? null : item)
 }
 style={{
 paddingHorizontal: space.md,
 paddingVertical: space.sm,
 borderRadius: radius.pill,
 backgroundColor:
 (item === "All" && !selectedCategory) ||
 selectedCategory === item
 ? colors.red500
 : colors.gray200,
 }}
 >
 <Text
 style={{
 color:
 (item === "All" && !selectedCategory) ||
 selectedCategory === item
 ? "white"
 : colors.text,
 fontWeight: "600",
 fontSize: 12,
 }}
 >
 {item}
 </Text>
 </Pressable>
 )}
 />
 </View>

 {/* Offers List */}
 <FlatList
 data={filteredOffers}
 renderItem={renderOfferCard}
 keyExtractor={(item) => String(item.id)}
 contentContainerStyle={{ padding: space.lg }}
 ListEmptyComponent={
 <View style={{ alignItems: "center", paddingVertical: space.xl }}>
 <Ionicons name="search-outline" size={48} color={colors.muted} />
 <Text
 style={{
 fontSize: 16,
 fontWeight: "600",
 color: colors.text,
 marginTop: space.md,
 }}
 >
 No offers available
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.sm }}>
 Check back soon for new discounts
 </Text>
 </View>
 }
 />
 </View>
 );
}
