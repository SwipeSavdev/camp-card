import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, space, radius } from "../../theme";
import { listOffers, OfferListItem } from "../../../services/offersService";

export default function CustomerDashboard() {
 const [offers, setOffers] = useState<OfferListItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [redeemCount] = useState(3); // Mock - would come from API

 // Mock user spending patterns
 const mockSpendingPatterns = {
 dining: { avgSpend: 200, category: "DINING" },
 auto: { avgSpend: 150, category: "AUTO" },
 entertainment: { avgSpend: 100, category: "ENTERTAINMENT" },
 };

 useEffect(() => {
 loadOffers();
 }, []);

 const loadOffers = async () => {
 try {
 setLoading(true);
 const data = await listOffers();
 setOffers(data);
 } catch (error) {
 console.error("Failed to load offers:", error);
 } finally {
 setLoading(false);
 }
 };

 // Calculate potential savings based on offers and user's typical spend
 const calculatePotentialSavings = () => {
 let totalSavings = 0;
 const savings: Array<{ category: string; amount: number; offer: string }> = [];

 offers.forEach((offer) => {
 const category = offer.category.toUpperCase();
 const pattern = Object.values(mockSpendingPatterns).find(
 (p) => p.category === category
 );

 if (pattern) {
 // Calculate savings based on offer discount (extracted from title)
 const percentMatch = offer.title.match(/(\d+)%/);
 const dollarMatch = offer.title.match(/\$(\d+)/);

 let savingsAmount = 0;

 if (percentMatch) {
 const percent = parseInt(percentMatch[1], 10) / 100;
 savingsAmount = Math.round(pattern.avgSpend * percent);
 } else if (dollarMatch) {
 savingsAmount = parseInt(dollarMatch[1], 10);
 }

 if (savingsAmount > 0) {
 totalSavings += savingsAmount;
 savings.push({
 category,
 amount: savingsAmount,
 offer: offer.title,
 });
 }
 }
 });

 return { totalSavings, savings };
 };

 const { totalSavings, savings } = calculatePotentialSavings();

 const handleViewHistory = () => {
 Alert.alert("Redeemed Offers", "Loading your redemption history...");
 };

 const handleBrowseAllOffers = () => {
 Alert.alert("Browse Offers", "Opening all available offers...");
 };

 const handleFindNearbyMerchants = () => {
 Alert.alert("Find Merchants", "Locating nearby merchants...");
 };

 const handleViewSavingsBreakdown = (category: string, offer: string, amount: number) => {
 Alert.alert(
 `${category} - $${amount} Savings`,
 `Offer: ${offer}\n\nRedeem this offer to unlock your savings!`
 );
 };

 const handleViewAllSavedOffers = () => {
 Alert.alert("Saved Offers", "Loading your bookmarked offers...");
 };

 if (loading) {
 return (
 <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.gray50 }}>
 <ActivityIndicator size="large" color={colors.red500} />
 </View>
 );
 }

 return (
 <ScrollView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 {/* Header */}
 <View style={{ padding: space.lg, backgroundColor: colors.navy900 }}>
 <Text style={{ fontSize: 24, fontWeight: "800", color: "white" }}>
 Your Savings Dashboard
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 See how much you can save with available offers
 </Text>
 </View>

 <View style={{ padding: space.lg, gap: space.lg }}>
 {/* Total Potential Savings Card */}
 <View
 style={{
 backgroundColor: colors.blue500,
 borderRadius: radius.card,
 padding: space.lg,
 alignItems: "center",
 }}
 >
 <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>
 Total Potential Savings
 </Text>
 <Text style={{ fontSize: 42, fontWeight: "800", color: "white", marginTop: space.sm }}>
 ${totalSavings}
 </Text>
 <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: space.sm }}>
 Based on your typical spending
 </Text>
 </View>

 {/* Breakdown by Category */}
 <View>
 <View style={{ flexDirection: "row", alignItems: "center", marginBottom: space.md }}>
 <Ionicons name="receipt-outline" size={20} color={colors.text} />
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginLeft: space.sm }}>
 Savings Breakdown
 </Text>
 </View>

 {savings.length > 0 ? (
 savings.map((item, idx) => (
 <Pressable
 key={idx}
 onPress={() => handleViewSavingsBreakdown(item.category, item.offer, item.amount)}
 style={{
 backgroundColor: "white",
 borderRadius: radius.button,
 padding: space.md,
 marginBottom: space.sm,
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "center",
 borderLeftWidth: 4,
 borderLeftColor: colors.red500,
 }}
 >
 <View>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 {item.category}
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 {item.offer}
 </Text>
 </View>
 <Text style={{ fontSize: 18, fontWeight: "800", color: colors.blue500 }}>
 ${item.amount}
 </Text>
 </Pressable>
 ))
 ) : (
 <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: space.lg }}>
 No offers available for your spending patterns
 </Text>
 )}
 </View>

 {/* Saved Offers */}
 <View>
 <View style={{ flexDirection: "row", alignItems: "center", marginBottom: space.md }}>
 <Ionicons name="bookmark-outline" size={20} color={colors.text} />
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginLeft: space.sm }}>
 Saved Offers
 </Text>
 </View>
 <View
 style={{
 backgroundColor: "white",
 borderRadius: radius.card,
 padding: space.md,
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
 }}
 >
 <View>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Bookmarked for later
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 Quick access to your favorites
 </Text>
 </View>
 <Pressable
 onPress={handleViewAllSavedOffers}
 style={{
 backgroundColor: colors.red500,
 paddingHorizontal: space.md,
 paddingVertical: space.sm,
 borderRadius: radius.button,
 }}
 >
 <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>View All </Text>
 </Pressable>
 </View>
 </View>

 {/* Redeemed Offers */}
 <View>
 <View style={{ flexDirection: "row", alignItems: "center", marginBottom: space.md }}>
 <Ionicons name="checkmark-circle-outline" size={20} color={colors.text} />
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginLeft: space.sm }}>
 Redeemed Offers
 </Text>
 </View>
 <View
 style={{
 backgroundColor: "white",
 borderRadius: radius.card,
 padding: space.lg,
 alignItems: "center",
 }}
 >
 <Text style={{ fontSize: 32, fontWeight: "800", color: colors.red500 }}>
 {redeemCount}
 </Text>
 <Text style={{ fontSize: 14, color: colors.muted, marginTop: space.sm }}>
 Offers redeemed this month
 </Text>
 <Pressable
 onPress={handleViewHistory}
 style={{
 marginTop: space.md,
 paddingHorizontal: space.md,
 paddingVertical: space.sm,
 backgroundColor: colors.navy900,
 borderRadius: radius.button,
 }}
 >
 <Text style={{ color: "white", fontWeight: "600", fontSize: 12 }}>
 View History
 </Text>
 </Pressable>
 </View>
 </View>

 {/* Action Buttons */}
 <View style={{ gap: space.sm, marginBottom: space.xl }}>
 <Pressable
 onPress={handleBrowseAllOffers}
 style={{
 backgroundColor: colors.red500,
 paddingVertical: space.md,
 borderRadius: radius.button,
 alignItems: "center",
 }}
 >
 <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
 Browse All Offers
 </Text>
 </Pressable>
 <Pressable
 onPress={handleFindNearbyMerchants}
 style={{
 backgroundColor: colors.gray200,
 paddingVertical: space.md,
 borderRadius: radius.button,
 alignItems: "center",
 }}
 >
 <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
 Find Nearby Merchants
 </Text>
 </Pressable>
 </View>
 </View>
 </ScrollView>
 );
}
