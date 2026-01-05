import React, { useState, useEffect } from "react";
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
import { colors, space, radius } from "../../theme";
import { fetchScoutsList, Scout } from "../../../services/dashboardService";

export default function LeaderScouts() {
 const [scouts, setScouts] = useState<Scout[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 loadScouts();
 }, []);

 const loadScouts = async () => {
 try {
 setLoading(true);
 const data = await fetchScoutsList();
 setScouts(data);
 setError(null);
 } catch (err: any) {
 const errorMsg = err.response?.data?.message || "Failed to load scouts";
 setError(errorMsg);
 Alert.alert("Error", errorMsg);
 } finally {
 setLoading(false);
 }
 };

 const handleInviteScout = () => {
 Alert.alert(
 "Invite Scout",
 "Enter scout email address",
 [
 { text: "Cancel", onPress: () => {}, style: "cancel" },
 { text: "Open Invite", onPress: () => {/* Invite functionality */} }
 ]
 );
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return colors.green500;
 case 'inactive':
 return colors.muted;
 case 'invited':
 return colors.blue500;
 default:
 return colors.muted;
 }
 };

 const getStatusLabel = (status: string) => {
 switch (status) {
 case 'active':
 return 'Active';
 case 'inactive':
 return 'Inactive';
 case 'invited':
 return 'Invited';
 default:
 return status;
 }
 };

 const renderScoutCard = ({ item }: { item: Scout }) => (
 <Pressable
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
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }} numberOfLines={1}>
 {item.name}
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.xs }} numberOfLines={1}>
 {item.email}
 </Text>
 <Text style={{ fontSize: 11, color: colors.muted, marginTop: space.xs }}>
 Troop {item.troop_number}
 </Text>
 </View>
 <View
 style={{
 backgroundColor: getStatusColor(item.status),
 opacity: 0.15,
 paddingHorizontal: space.sm,
 paddingVertical: space.xs,
 borderRadius: radius.button,
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
 </View>

 <View style={{ marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.gray200, flexDirection: "row", justifyContent: "space-between" }}>
 <View>
 <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "600" }}>
 Recruits
 </Text>
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginTop: space.xs }}>
 {item.recruits_count}
 </Text>
 </View>
 <View>
 <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "600" }}>
 Earnings
 </Text>
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.green500, marginTop: space.xs }}>
 ${(item.total_earnings / 100).toFixed(2)}
 </Text>
 </View>
 <View>
 <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "600" }}>
 Joined
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.xs }}>
 {new Date(item.joined_date).toLocaleDateString()}
 </Text>
 </View>
 </View>
 </Pressable>
 );

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
 <Text style={{ fontSize: 24, fontWeight: "800", color: "white" }}>
 Manage Scouts
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 {scouts.length} scouts in your troop
 </Text>
 </View>

 {error && (
 <View style={{ backgroundColor: colors.blue50, padding: space.md, margin: space.lg, borderRadius: radius.button }}>
 <Text style={{ color: colors.red500, fontSize: 12 }}>
 {error}
 </Text>
 </View>
 )}

 <View style={{ padding: space.lg }}>
 {/* Add Scout Button */}
 <Pressable
 onPress={handleInviteScout}
 style={{
 backgroundColor: colors.red500,
 paddingVertical: space.md,
 borderRadius: radius.button,
 flexDirection: "row",
 justifyContent: "center",
 alignItems: "center",
 gap: space.sm,
 marginBottom: space.lg,
 }}
 >
 <Ionicons name="add-circle" size={20} color="white" />
 <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
 Invite New Scout
 </Text>
 </Pressable>

 {/* Scouts List */}
 {scouts.length === 0 ? (
 <View style={{ alignItems: "center", paddingVertical: space.xl }}>
 <Ionicons name="people-outline" size={48} color={colors.muted} />
 <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginTop: space.md }}>
 No Scouts Yet
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.sm, textAlign: "center" }}>
 Invite scouts to your troop to get started
 </Text>
 </View>
 ) : (
 <FlatList
 data={scouts}
 renderItem={renderScoutCard}
 keyExtractor={(item) => item.id}
 scrollEnabled={false}
 />
 )}
 </View>
 </ScrollView>
 );
}
