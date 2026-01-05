import React, { useState, useEffect } from "react";
import {
 View,
 Text,
 ScrollView,
 FlatList,
 Pressable,
 ActivityIndicator,
 Alert,
 SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, space, radius } from "../../uiux/theme";
import { useAuthStore } from "../../store/authStore";
import { fetchReferralHistory, ReferralHistory } from "../../services/referralService";

export default function ReferralHistoryScreen() {
 const navigation = useNavigation();
 const user = useAuthStore((s) => s.user);
 const [history, setHistory] = useState<ReferralHistory[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 loadReferralHistory();
 }, [user?.id]);

 const loadReferralHistory = async () => {
 if (!user?.id) {
 setError("User not found");
 setLoading(false);
 return;
 }

 try {
 setLoading(true);
 const data = await fetchReferralHistory(user.id);
 setHistory(data);
 setError(null);
 } catch (err: any) {
 const errorMsg = err.response?.data?.message || "Failed to load referral history";
 setError(errorMsg);
 } finally {
 setLoading(false);
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'completed':
 return colors.green500;
 case 'pending':
 return colors.blue500;
 case 'expired':
 return colors.muted;
 default:
 return colors.muted;
 }
 };

 const getStatusLabel = (status: string) => {
 switch (status) {
 case 'completed':
 return 'Completed';
 case 'pending':
 return 'Pending';
 case 'expired':
 return 'Expired';
 default:
 return status;
 }
 };

 const renderHistoryItem = ({ item }: { item: ReferralHistory }) => (
 <View
 style={{
 backgroundColor: "white",
 borderRadius: radius.card,
 marginBottom: space.md,
 padding: space.md,
 borderLeftWidth: 4,
 borderLeftColor: getStatusColor(item.status),
 }}
 >
 <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
 {item.referred_user_name}
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.xs }}>
 {item.referred_user_email}
 </Text>
 <Text style={{ fontSize: 11, color: colors.muted, marginTop: space.xs }}>
 Signed up: {new Date(item.signup_date).toLocaleDateString()}
 </Text>
 </View>
 <View style={{ alignItems: "flex-end" }}>
 <View
 style={{
 backgroundColor: getStatusColor(item.status),
 opacity: 0.2,
 paddingHorizontal: space.sm,
 paddingVertical: space.xs,
 borderRadius: radius.button,
 marginBottom: space.sm,
 }}
 >
 <Text
 style={{
 fontSize: 10,
 fontWeight: "700",
 color: getStatusColor(item.status),
 }}
 >
 {getStatusLabel(item.status)}
 </Text>
 </View>
 {item.earnings_amount > 0 && (
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.green500 }}>
 ${(item.earnings_amount / 100).toFixed(2)}
 </Text>
 )}
 </View>
 </View>

 {item.first_purchase_date && (
 <Text style={{ fontSize: 11, color: colors.muted, marginTop: space.sm }}>
 First purchase: {new Date(item.first_purchase_date).toLocaleDateString()}
 </Text>
 )}
 </View>
 );

 if (loading) {
 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
 <ActivityIndicator size="large" color={colors.red500} />
 </View>
 </SafeAreaView>
 );
 }

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ padding: space.lg, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: colors.gray200 }}>
 <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
 <Pressable onPress={() => navigation.goBack()}>
 <Ionicons name="chevron-back" size={24} color={colors.text} />
 </Pressable>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
 Referral History
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.xs }}>
 {history.length} referrals
 </Text>
 </View>
 </View>
 </View>

 {error && (
 <View style={{ backgroundColor: colors.gray50, padding: space.md, margin: space.lg, borderRadius: radius.button }}>
 <Text style={{ color: colors.red500, fontSize: 12 }}>
 {error}
 </Text>
 </View>
 )}

 {history.length === 0 ? (
 <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: space.lg }}>
 <Ionicons name="people-outline" size={48} color={colors.muted} />
 <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginTop: space.md }}>
 No Referrals Yet
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.sm, textAlign: "center" }}>
 Share your referral link with friends to earn rewards
 </Text>
 </View>
 ) : (
 <FlatList
 data={history}
 renderItem={renderHistoryItem}
 keyExtractor={(item) => item.id}
 contentContainerStyle={{ padding: space.lg }}
 scrollEnabled
 />
 )}
 </SafeAreaView>
 );
}
