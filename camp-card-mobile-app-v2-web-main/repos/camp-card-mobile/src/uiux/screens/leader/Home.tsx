import React, { useState, useEffect } from "react";
import {
 View,
 Text,
 Pressable,
 ScrollView,
 ActivityIndicator,
 Alert,
 Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors, space, radius } from "../../theme";
import { fetchLeaderDashboard, logLeaderShare, LeaderDashboard } from "../../../services/dashboardService";
import { useAuthStore } from "../../../store/authStore";

export default function LeaderHome() {
 const navigation = useNavigation<NativeStackNavigationProp<any>>();
 const user = useAuthStore((s) => s.user);
 const [dashboard, setDashboard] = useState<LeaderDashboard | null>(null);
 const [loading, setLoading] = useState(true);
 const [sharingLoading, setSharingLoading] = useState(false);

 useEffect(() => {
 loadDashboard();
 }, []);

 const loadDashboard = async () => {
 try {
 setLoading(true);
 const data = await fetchLeaderDashboard();
 setDashboard(data);
 } catch (err: any) {
 console.error("Failed to load leader dashboard:", err);
 Alert.alert("Error", "Failed to load dashboard");
 } finally {
 setLoading(false);
 }
 };

 const handleShare = async () => {
 try {
 setSharingLoading(true);
 await Share.share({
 message: `Lead your troop with Camp Card! Help Scouts earn rewards and raise funds. Join our troop today.`,
 title: "Join as Leader",
 url: `https://campcard.app/leader/${user?.id}`,
 });
 await logLeaderShare('share');
 } catch (error) {
 console.error("Share failed:", error);
 } finally {
 setSharingLoading(false);
 }
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
 <View style={{ padding: space.lg, backgroundColor: colors.navy900, paddingTop: space.lg * 2.5 }}>
 <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
 Leader Dashboard
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 Manage your troop and scouts
 </Text>
 </View>

 <View style={{ padding: space.lg }}>
 {/* Stats Cards */}
 <View style={{ gap: space.md, marginBottom: space.lg }}>
 {/* Total Scouts Card */}
 <View style={{ backgroundColor: "white", borderRadius: radius.card, padding: space.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
 <View>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
 Total Scouts
 </Text>
 <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text, marginTop: space.sm }}>
 {dashboard?.scouts_count || 0}
 </Text>
 </View>
 <View style={{ backgroundColor: colors.blue50, borderRadius: radius.button, padding: space.md }}>
 <Ionicons name="people-outline" size={32} color={colors.blue500} />
 </View>
 </View>

 {/* Active Scouts Card */}
 <View style={{ backgroundColor: "white", borderRadius: radius.card, padding: space.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
 <View>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
 Active Scouts
 </Text>
 <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text, marginTop: space.sm }}>
 {dashboard?.active_scouts || 0}
 </Text>
 </View>
 <View style={{ backgroundColor: colors.blue50, borderRadius: radius.button, padding: space.md }}>
 <Ionicons name="checkmark-circle-outline" size={32} color={colors.green500} />
 </View>
 </View>

 {/* Earnings Card */}
 <View style={{ backgroundColor: "white", borderRadius: radius.card, padding: space.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
 <View>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
 Total Fundraised
 </Text>
 <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text, marginTop: space.sm }}>
 ${((dashboard?.total_earnings || 0) / 100).toFixed(2)}
 </Text>
 </View>
 <View style={{ backgroundColor: colors.blue50, borderRadius: radius.button, padding: space.md }}>
 <Ionicons name="cash-outline" size={32} color={colors.green500} />
 </View>
 </View>
 </View>

 {/* Recruitment Pipeline */}
 {dashboard?.recruitment_pipeline ? (
 <View style={{ marginBottom: space.lg }}>
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: space.md }}>
 Recruitment Pipeline
 </Text>
 <View style={{ backgroundColor: "white", borderRadius: radius.card, overflow: "hidden" }}>
 <View style={{ padding: space.md, borderBottomWidth: 1, borderBottomColor: colors.gray200, flexDirection: "row", justifyContent: "space-between" }}>
 <View style={{ alignItems: "center" }}>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
 Pending
 </Text>
 <Text style={{ fontSize: 20, fontWeight: "700", color: colors.blue500, marginTop: space.xs }}>
 {dashboard.recruitment_pipeline.pending}
 </Text>
 </View>
 <View style={{ alignItems: "center" }}>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
 Accepted
 </Text>
 <Text style={{ fontSize: 20, fontWeight: "700", color: colors.green500, marginTop: space.xs }}>
 {dashboard.recruitment_pipeline.accepted}
 </Text>
 </View>
 <View style={{ alignItems: "center" }}>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
 Rejected
 </Text>
 <Text style={{ fontSize: 20, fontWeight: "700", color: colors.red500, marginTop: space.xs }}>
 {dashboard.recruitment_pipeline.rejected}
 </Text>
 </View>
 </View>
 </View>
 </View>
 ) : null}

 {/* Action Buttons */}
 <View style={{ gap: space.md }}>
 <Pressable
 onPress={handleShare}
 disabled={sharingLoading}
 style={{
 padding: space.lg,
 borderRadius: radius.button,
 backgroundColor: colors.red500,
 alignItems: "center",
 flexDirection: "row",
 justifyContent: "center",
 gap: space.md,
 opacity: sharingLoading ? 0.7 : 1,
 }}
 >
 <Ionicons name="share-social" size={20} color="white" />
 <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
 Share Troop Link
 </Text>
 </Pressable>

 <Pressable
 onPress={() => navigation.navigate("Scouts")}
 style={{
 padding: space.lg,
 borderRadius: radius.button,
 backgroundColor: "white",
 borderWidth: 2,
 borderColor: colors.red500,
 alignItems: "center",
 flexDirection: "row",
 justifyContent: "center",
 gap: space.md,
 }}
 >
 <Ionicons name="people-outline" size={20} color={colors.red500} />
 <Text style={{ color: colors.red500, fontWeight: "800", fontSize: 16 }}>
 Manage Scouts
 </Text>
 </Pressable>
 </View>
 </View>
 </ScrollView>
 );
}
