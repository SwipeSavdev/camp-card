import React, { useState, useEffect } from "react";
import {
 View,
 Text,
 ScrollView,
 Pressable,
 Animated,
 Share,
 Alert,
 ImageBackground,
 ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, space, radius } from "../../theme";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../services/apiClient";
import {
 generateReferralCode,
 logReferralShare,
 fetchReferralStats,
 generateFallbackReferralCode,
 ReferralCode,
 ReferralStats,
} from "../../../services/referralService";

// Import card background image - correct path from mobile/src location
const campCardBg = require("../../../../assets/images/campcard_bg.png");
const campCardLogo = require("../../../../assets/images/campcard_lockup_left.png");

interface WalletCard {
 id: number;
 card_member_number: string;
 balance: number;
 points: number;
 tier: string;
 cardholder_name: string;
 last_four: string;
}

export default function CustomerWallet() {
 const navigation = useNavigation<NativeStackNavigationProp<any>>();
 const user = useAuthStore((s) => s.user);
 const [isCardFlipped, setIsCardFlipped] = useState(false);
 const [wallet, setWallet] = useState<WalletCard | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
 const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
 const [referralLoading, setReferralLoading] = useState(false);
 const flipAnimation = React.useRef(new Animated.Value(0)).current;

 // Fetch wallet and referral data on component mount
 useEffect(() => {
 fetchWalletData();
 fetchReferralData();
 }, [user?.id]);

 const fetchWalletData = async () => {
 if (!user?.id) {
 setError("User not found");
 setLoading(false);
 return;
 }

 try {
 setLoading(true);
 const response = await apiClient.get(`/users/${user.id}/wallet`);
 const walletData = response.data.wallet || response.data;

 if (walletData && walletData.cards && walletData.cards.length > 0) {
 setWallet(walletData.cards[0]);
 } else if (walletData) {
 setWallet(walletData);
 }
 setError(null);
 } catch (err: any) {
 const errorMsg = err.response?.data?.message || "Failed to load wallet";
 setError(errorMsg);
 // Fallback data if API fails
 setWallet({
 id: 1,
 card_member_number: "CARD-" + (user?.id?.substring(0, 6) || "000001"),
 balance: 0,
 points: 0,
 tier: "Standard",
 cardholder_name: user?.name || "User",
 last_four: "0000",
 });
 } finally {
 setLoading(false);
 }
 };

 const fetchReferralData = async () => {
 if (!user?.id) return;

 try {
 setReferralLoading(true);
 // Generate or fetch referral code
 const code = await generateReferralCode(user.id);
 setReferralCode(code);
 // Fetch referral stats
 const stats = await fetchReferralStats(user.id);
 setReferralStats(stats);
 } catch (err: any) {
 console.error("Failed to load referral data:", err);
 // Fallback: use default values
 setReferralCode({
 code: generateFallbackReferralCode(user.id),
 url: `https://campcard.app/r/${generateFallbackReferralCode(user.id)}`,
 });
 setReferralStats({
 total_shares: 0,
 total_signups: 0,
 total_earnings: 0,
 });
 } finally {
 setReferralLoading(false);
 }
 };

 // User data - Use fetched wallet data or fallback
 const cardData = wallet ? {
 firstName: wallet.cardholder_name.split(" ")[0] || "User",
 lastName: wallet.cardholder_name.split(" ").slice(1).join(" ") || "",
 cardNumber: wallet.card_member_number,
 cardNumberLast4: wallet.last_four,
 balance: wallet.balance,
 cardholder: wallet.cardholder_name.toUpperCase(),
 points: wallet.points,
 tier: wallet.tier,
 } : {
 firstName: "User",
 lastName: "",
 cardNumber: "CARD-000000",
 cardNumberLast4: "0000",
 balance: 0,
 cardholder: "USER",
 points: 0,
 tier: "Standard",
 };

 // Use fetched referral code or fallback
 const displayReferralCode = referralCode?.code || generateFallbackReferralCode(user?.id);
 const displayReferralLink = referralCode?.url || `https://campcard.app/r/${displayReferralCode}`;

 const toggleCardFlip = () => {
 Animated.timing(flipAnimation, {
 toValue: isCardFlipped ? 0 : 1,
 duration: 600,
 useNativeDriver: false, // Use false for opacity animations on all platforms
 }).start();
 setIsCardFlipped(!isCardFlipped);
 };

 const frontOpacity = flipAnimation.interpolate({
 inputRange: [0, 1],
 outputRange: [1, 0],
 });

 const backOpacity = flipAnimation.interpolate({
 inputRange: [0, 1],
 outputRange: [0, 1],
 });

 const handleShareReferral = async () => {
 try {
 await Share.share({
 message: `Join me on Camp Card and get exclusive discounts! Use my referral code: ${displayReferralCode}. Download here: ${displayReferralLink}`,
 title: "Join Camp Card",
 url: displayReferralLink,
 });
 // Log the share action
 if (user?.id) {
 await logReferralShare(user.id, 'copy');
 }
 } catch (error) {
 Alert.alert("Error", "Failed to share referral link");
 }
 };

 const handleCopyReferral = async () => {
 try {
 await Clipboard.setStringAsync(displayReferralCode);
 Alert.alert("Success", `Referral code '${displayReferralCode}' copied to clipboard!`);
 } catch (error) {
 Alert.alert("Error", "Failed to copy referral code to clipboard");
 }
 };

 return (
 <ScrollView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 {/* Header */}
 <View style={{ padding: space.lg, backgroundColor: colors.navy900, paddingTop: space.lg * 2.5 }}>
 <Text style={{ fontSize: 24, fontWeight: "800", color: "white" }}>
 Your Wallet
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 Manage your camp card & referrals
 </Text>
 </View>

 <View style={{ padding: space.lg, gap: space.lg }}>
 {/* Camp Card */}
 <View style={{ alignItems: "center", marginTop: space.lg }}>
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: space.md, alignSelf: "flex-start" }}>
 Your Camp Card
 </Text>

 {/* Card Flip Container */}
 <View style={{ height: 270, width: "100%", marginTop: space.md, marginLeft: space.lg, marginRight: space.lg }}>
 {/* Front of Card - with Background Image */}
 <Animated.View
 style={[
 {
 width: "100%",
 height: "100%",
 borderRadius: radius.card,
 overflow: "hidden",
 shadowColor: "#000",
 shadowOffset: { width: 0, height: 4 },
 shadowOpacity: 0.2,
 shadowRadius: 12,
 elevation: 8,
 position: "absolute",
 },
 { opacity: frontOpacity },
 ]}
 >
 <ImageBackground
 source={campCardBg}
 style={{
 width: "100%",
 height: "100%",
 padding: space.lg,
 paddingTop: space.xl,
 paddingBottom: space.lg,
 justifyContent: "space-between",
 flexDirection: "column",
 }}
 imageStyle={{ borderRadius: radius.card }}
 >
 {/* Top Left: Flip Button */}
 <View style={{ position: "absolute", top: space.lg, left: space.lg, zIndex: 10 }}>
 <Pressable
 onPress={toggleCardFlip}
 style={{
 width: 40,
 height: 40,
 backgroundColor: "rgba(255,255,255,0.9)",
 borderRadius: 20,
 justifyContent: "center",
 alignItems: "center",
 shadowColor: "#000",
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.15,
 shadowRadius: 4,
 elevation: 3,
 }}
 >
 <Ionicons name="swap-horizontal" size={18} color={colors.red500} />
 </Pressable>
 </View>

 {/* Center: Logo */}
 <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
 <ImageBackground
 source={campCardLogo}
 style={{ width: 250, height: 150 }}
 resizeMode="contain"
 />
 </View>

 {/* Bottom: Card Number (Truncated) and Cardholder */}
 <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: space.sm, marginBottom: 32, marginLeft: 36, marginRight: 36 }}>
 {/* Cardholder Name - Left Bottom */}
 <View style={{ flex: 1 }}>
 <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 6, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
 Cardholder
 </Text>
 <Text numberOfLines={1} style={{ color: "white", fontWeight: "800", fontSize: 10, marginTop: 3, letterSpacing: 0.2 }}>
 {cardData.firstName} {cardData.lastName}
 </Text>
 </View>

 {/* Card Number - Right Bottom */}
 <View style={{ alignItems: "flex-end", flex: 1 }}>
 <Text style={{ fontSize: 6, color: "rgba(255,255,255,0.9)", fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>
 Card Number
 </Text>
 <Text numberOfLines={1} style={{ fontSize: 10, color: "white", fontWeight: "700", letterSpacing: 2, fontFamily: "Courier New" }}>
    {cardData.cardNumberLast4}
 </Text>
 </View>
 </View>
 </ImageBackground>
 </Animated.View>

 {/* Back of Card - Customer Information */}
 <Animated.View
 style={[
 {
 width: "100%",
 height: "100%",
 borderRadius: radius.card,
 overflow: "hidden",
 shadowColor: "#000",
 shadowOffset: { width: 0, height: 4 },
 shadowOpacity: 0.2,
 shadowRadius: 12,
 elevation: 8,
 position: "absolute",
 },
 { opacity: backOpacity },
 ]}
 >
 <ImageBackground
 source={campCardBg}
 style={{
 width: "100%",
 height: "100%",
 padding: space.lg,
 paddingTop: space.xl,
 justifyContent: "space-between",
 }}
 imageStyle={{ borderRadius: radius.card }}
 >
 {/* Top Left: Flip Button */}
 <View style={{ position: "absolute", top: space.lg, left: space.lg, zIndex: 10 }}>
 <Pressable
 onPress={toggleCardFlip}
 style={{
 width: 40,
 height: 40,
 backgroundColor: "rgba(255,255,255,0.1)",
 borderRadius: 20,
 justifyContent: "center",
 alignItems: "center",
 shadowColor: "#000",
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 4,
 elevation: 3,
 }}
 >
 <Ionicons name="swap-horizontal" size={18} color="white" />
 </Pressable>
 </View>

 {/* Content Area */}
 <View style={{ flex: 1, justifyContent: "center", marginTop: space.md, gap: space.lg, marginBottom: 48, marginLeft: 36, marginRight: 36 }}>
 {/* Magnetic Stripe */}
 <View
 style={{
 backgroundColor: "rgba(255,255,255,0.15)",
 height: 40,
 borderRadius: 4,
 }}
 />

 {/* Card Number */}
 <View>
 <Text
 style={{
 fontSize: 8,
 color: "rgba(255,255,255,0.6)",
 fontWeight: "600",
 textTransform: "uppercase",
 letterSpacing: 1,
 }}
 >
 Card Number
 </Text>
 <Text
 style={{
 fontSize: 12,
 fontWeight: "700",
 color: "white",
 marginTop: space.sm,
 fontFamily: "Courier New",
 letterSpacing: 2,
 }}
 >
 {cardData.cardNumber}
 </Text>
 </View>

 {/* Cardholder Name */}
 <View>
 <Text
 style={{
 fontSize: 8,
 color: "rgba(255,255,255,0.6)",
 fontWeight: "600",
 textTransform: "uppercase",
 letterSpacing: 1,
 }}
 >
 Cardholder
 </Text>
 <Text
 style={{
 fontSize: 11,
 fontWeight: "700",
 color: "white",
 marginTop: space.sm,
 textTransform: "uppercase",
 letterSpacing: 0.5,
 }}
 >
 {cardData.cardholder}
 </Text>
 </View>

 {/* Email */}
 <View>
 <Text
 style={{
 fontSize: 10,
 color: "rgba(255,255,255,0.6)",
 fontWeight: "600",
 textTransform: "uppercase",
 letterSpacing: 1,
 }}
 >
 Account Email
 </Text>
 <Text
 style={{
 fontSize: 12,
 color: "rgba(255,255,255,0.9)",
 marginTop: space.sm,
 fontFamily: "Courier New",
 }}
 >
 emily.rodriguez@campcard.com
 </Text>
 </View>
 </View>
 </ImageBackground>
 </Animated.View>
 </View>
 </View>

 {/* Refer Friends Section */}
 <View>
 <View style={{ flexDirection: "row", alignItems: "center", marginBottom: space.md }}>
 <Ionicons name="share-social-outline" size={20} color={colors.text} />
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginLeft: space.sm }}>
 Refer Friends
 </Text>
 </View>

 <View style={{ backgroundColor: "white", borderRadius: radius.card, overflow: "hidden" }}>
 {/* Info Card */}
 <View style={{ padding: space.lg, backgroundColor: colors.blue50 }}>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Earn Rewards with Referrals
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.sm }}>
 Share your unique link and earn rewards when friends join and make their first purchase
 </Text>
 </View>

 {/* Referral Code Display */}
 <View style={{ padding: space.lg, borderBottomWidth: 1, borderBottomColor: colors.gray200 }}>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600", marginBottom: space.sm }}>
 YOUR REFERRAL CODE
 </Text>
 <View
 style={{
 backgroundColor: colors.gray50,
 borderRadius: radius.button,
 paddingHorizontal: space.md,
 paddingVertical: space.md,
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "center",
 }}
 >
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, letterSpacing: 1 }}>
 {displayReferralCode}
 </Text>
 <Pressable onPress={handleCopyReferral}>
 <Ionicons name="copy" size={20} color={colors.blue500} />
 </Pressable>
 </View>
 </View>

 {/* Referral Link */}
 <View style={{ padding: space.lg }}>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600", marginBottom: space.sm }}>
 SHARE YOUR LINK
 </Text>
 <View
 style={{
 backgroundColor: colors.gray50,
 borderRadius: radius.button,
 paddingHorizontal: space.md,
 paddingVertical: space.md,
 marginBottom: space.md,
 }}
 >
 <Text
 style={{
 fontSize: 12,
 color: colors.muted,
 fontFamily: "Courier New",
 }}
 numberOfLines={2}
 >
 {displayReferralLink}
 </Text>
 </View>

 <View style={{ gap: space.sm, marginBottom: space.md }}>
 <Pressable
 onPress={() => navigation.navigate("ReferralHistory")}
 style={{
 backgroundColor: colors.gray100,
 paddingVertical: space.md,
 borderRadius: radius.button,
 flexDirection: "row",
 justifyContent: "center",
 alignItems: "center",
 gap: space.sm,
 }}
 >
 <Ionicons name="list-outline" size={18} color={colors.text} />
 <Text style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}>
 View Referral History
 </Text>
 </Pressable>

 <Pressable
 onPress={handleShareReferral}
 style={{
 backgroundColor: colors.blue500,
 paddingVertical: space.md,
 borderRadius: radius.button,
 flexDirection: "row",
 justifyContent: "center",
 alignItems: "center",
 gap: space.sm,
 }}
 >
 <Ionicons name="share-social" size={18} color="white" />
 <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
 Share Referral Link
 </Text>
 </Pressable>
 </View>
 </View>
 </View>
 </View>

 {/* Quick Actions */}
 <View>
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: space.md }}>
 Quick Actions
 </Text>
 <View style={{ gap: space.sm }}>
 <Pressable
 onPress={() => Alert.alert("Card Security", "Opening card security settings...")}
 style={{
 backgroundColor: "white",
 borderRadius: radius.button,
 padding: space.md,
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
 }}
 >
 <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
 <Ionicons name="lock-closed-outline" size={20} color={colors.red500} />
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Manage Card Security
 </Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color={colors.muted} />
 </Pressable>

 <Pressable
 onPress={() => Alert.alert("Transaction History", "Loading transaction history...")}
 style={{
 backgroundColor: "white",
 borderRadius: radius.button,
 padding: space.md,
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
 }}
 >
 <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
 <Ionicons name="document-text-outline" size={20} color={colors.red500} />
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Transaction History
 </Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color={colors.muted} />
 </Pressable>
 </View>
 </View>

 <View style={{ height: space.lg }} />
 </View>
 </ScrollView>
 );
}
