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
import { colors, space, radius } from "../../theme";
import { fetchScoutDashboard, logScoutShare, ScoutDashboard } from "../../../services/dashboardService";
import { useAuthStore } from "../../../store/authStore";

export default function ScoutHome() {
 const user = useAuthStore((s) => s.user);
 const [dashboard, setDashboard] = useState<ScoutDashboard | null>(null);
 const [loading, setLoading] = useState(true);
 const [sharingLoading, setSharingLoading] = useState(false);

 useEffect(() => {
 loadDashboard();
 }, []);

 const loadDashboard = async () => {
 try {
 setLoading(true);
 const data = await fetchScoutDashboard();
 setDashboard(data);
 } catch (err: any) {
 console.error("Failed to load scout dashboard:", err);
 Alert.alert("Error", "Failed to load dashboard");
 } finally {
 setLoading(false);
 }
 };

 const handleShare = async () => {
 try {
 setSharingLoading(true);
 await Share.share({
 message: `Join me as a Scout and help raise funds! Download Camp Card and start earning today.`,
 title: "Join as Scout",
 url: `https://campcard.app/scout/${user?.id}`,
 });
 await logScoutShare('share');
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
 Scout Dashboard
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 Track your recruitment and earnings
 </Text>
 </View>

 <View style={{ padding: space.lg }}>
 {/* Stats Cards */}
 <View style={{ gap: space.md, marginBottom: space.lg }}>
 {/* Recruits Card */}
 <View style={{ backgroundColor: "white", borderRadius: radius.card, padding: space.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
 <View>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
 Total Recruits
 </Text>
 <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text, marginTop: space.sm }}>
 {dashboard?.recruits_count || 0}
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

 {/* Redemptions Card */}
 <View style={{ backgroundColor: "white", borderRadius: radius.card, padding: space.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
 <View>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
 Redemptions
 </Text>
 <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text, marginTop: space.sm }}>
 {dashboard?.total_redemptions || 0}
 </Text>
 </View>
 <View style={{ backgroundColor: colors.gray100, borderRadius: radius.button, padding: space.md }}>
 <Ionicons name="checkmark-done-outline" size={32} color={colors.red500} />
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

 {/* Share Button */}
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
 Share Scout Link
 </Text>
 </Pressable>
 </View>
 </ScrollView>
 );
}
