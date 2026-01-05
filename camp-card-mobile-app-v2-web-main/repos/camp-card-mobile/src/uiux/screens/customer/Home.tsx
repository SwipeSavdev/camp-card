import React from "react";
import { View, Text, ScrollView, Pressable, ImageBackground, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, space, radius } from "../../theme";
import { useAuthStore } from "../../../store/authStore";

const campCardBg = require("../../../../assets/images/campcard_bg.png");
const campCardLogo = require("../../../../assets/images/campcard_lockup_left.png");

export default function CustomerHome() {
 const user = useAuthStore((s) => s.user);
 const firstName = user?.name?.split(" ")[0] || "Customer";
 // Mock featured offer - in production, fetch from API
 const featuredOffer = {
 title: "Get 20% Off Dining",
 subtitle: "At participating restaurants",
 badge: "NEW",
 };

 const handleQuickAction = (action: string) => {
 Alert.alert(action, `Opening ${action}...`);
 };

 const handleViewDetails = () => {
 Alert.alert("Featured Offer", "Opening offer details...");
 };

 const QuickAction = ({
 icon,
 label,
 onPress,
 }: {
 icon: string;
 label: string;
 onPress: () => void;
 }) => (
 <Pressable
 onPress={onPress}
 style={{
 flex: 1,
 alignItems: "center",
 gap: space.sm,
 backgroundColor: "white",
 padding: space.lg,
 borderRadius: radius.card,
 borderWidth: 1,
 borderColor: colors.gray200,
 }}
 >
 <View
 style={{
 width: 44,
 height: 44,
 borderRadius: 12,
 backgroundColor: colors.blue50,
 justifyContent: "center",
 alignItems: "center",
 }}
 >
 <Ionicons name={icon as any} size={20} color={colors.blue500} />
 </View>
 <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text, textAlign: "center" }}>
 {label}
 </Text>
 </Pressable>
 );

 return (
 <ScrollView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 {/* Welcome Header */}
 <View style={{ padding: space.lg, backgroundColor: colors.navy900, gap: space.md, paddingTop: space.lg * 3.5 }}>
 <View>
 <Text style={{ fontSize: 24, fontWeight: "800", color: "white" }}>
 Welcome, {firstName}!
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4, fontSize: 14 }}>
 Support local Scouts with Camp Card
 </Text>
 </View>
 <View
 style={{
 flexDirection: "row",
 alignItems: "center",
 gap: space.sm,
 backgroundColor: "rgba(255,255,255,0.1)",
 paddingHorizontal: space.md,
 paddingVertical: space.sm,
 borderRadius: radius.button,
 alignSelf: "flex-start",
 }}
 >
 <View
 style={{
 width: 8,
 height: 8,
 borderRadius: 4,
 backgroundColor: colors.green400,
 }}
 />
 <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
 Subscription Active
 </Text>
 </View>
 </View>

 <View style={{ padding: space.lg, gap: space.lg }}>
 {/* Quick Actions Grid */}
 <View>
 <Text
 style={{
 fontSize: 14,
 fontWeight: "700",
 color: colors.text,
 marginBottom: space.md,
 }}
 >
 Quick Actions
 </Text>
 <View style={{ gap: space.sm }}>
 <View style={{ flexDirection: "row", gap: space.sm }}>
 <QuickAction
 icon="pricetags-outline"
 label="Browse Offers"
 onPress={() => handleQuickAction("Browse Offers")}
 />
 <QuickAction icon="location-outline" label="Find Stores" onPress={() => handleQuickAction("Find Stores")} />
 </View>
 <View style={{ flexDirection: "row", gap: space.sm }}>
 <QuickAction icon="bookmark-outline" label="Saved" onPress={() => handleQuickAction("Saved Offers")} />
 <QuickAction icon="document-text-outline" label="History" onPress={() => handleQuickAction("Purchase History")} />
 </View>
 </View>
 </View>

 {/* Featured Offer Card */}
 <View>
 <Text
 style={{
 fontSize: 14,
 fontWeight: "700",
 color: colors.text,
 marginBottom: space.md,
 }}
 >
 Featured Offer
 </Text>
 {featuredOffer ? (
 <View
 style={{
 backgroundColor: "white",
 borderRadius: radius.card,
 padding: space.lg,
 borderWidth: 1,
 borderColor: colors.red500,
 borderLeftWidth: 4,
 }}
 >
 <View
 style={{
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "flex-start",
 marginBottom: space.md,
 }}
 >
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
 {featuredOffer.title}
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 {featuredOffer.subtitle}
 </Text>
 </View>
 <View
 style={{
 backgroundColor: colors.red500,
 paddingHorizontal: space.sm,
 paddingVertical: 4,
 borderRadius: 6,
 }}
 >
 <Text style={{ color: "white", fontSize: 10, fontWeight: "700" }}>
 {featuredOffer.badge}
 </Text>
 </View>
 </View>
 <Pressable
 onPress={handleViewDetails}
 style={{
 backgroundColor: colors.red500,
 paddingVertical: space.md,
 borderRadius: radius.button,
 alignItems: "center",
 }}
 >
 <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
 View Details
 </Text>
 </Pressable>
 </View>
 ) : (
 <View
 style={{
 backgroundColor: "white",
 borderRadius: radius.card,
 padding: space.lg,
 alignItems: "center",
 borderWidth: 1,
 borderColor: colors.gray200,
 borderStyle: "dashed",
 }}
 >
 <Ionicons name="gift-outline" size={32} color={colors.muted} />
 <Text
 style={{
 fontSize: 14,
 fontWeight: "600",
 color: colors.text,
 marginTop: space.md,
 }}
 >
 No Featured Offers
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.sm, textAlign: "center" }}>
 Check back soon for exclusive deals
 </Text>
 </View>
 )}
 </View>

 {/* Info Card */}
 <View
 style={{
 backgroundColor: colors.blue50,
 borderRadius: radius.card,
 padding: space.lg,
 flexDirection: "row",
 gap: space.md,
 }}
 >
 <Ionicons name="information-circle-outline" size={24} color={colors.blue500} />
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
 Pro Tip
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 20 }}>
 Check back regularly for new offers and exclusive discounts available only to
 Camp Card holders.
 </Text>
 </View>
 </View>
 </View>
 </ScrollView>
 );
}
