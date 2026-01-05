import React, { useState, useEffect } from "react";
import {
 View,
 Text,
 ScrollView,
 Pressable,
 Switch,
 Alert,
 ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, space, radius } from "../../theme";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../services/apiClient";

interface ScoutSettings {
 notifications_enabled: boolean;
 location_enabled: boolean;
 marketing_enabled: boolean;
}

export default function ScoutSettings() {
 const user = useAuthStore((s) => s.user);
 const logout = useAuthStore((s) => s.logout);
 const [settings, setSettings] = useState<ScoutSettings>({
 notifications_enabled: true,
 location_enabled: false,
 marketing_enabled: false,
 });
 const [loading, setLoading] = useState(true);
 const [savingSettings, setSavingSettings] = useState(false);

 useEffect(() => {
 fetchSettings();
 }, [user?.id]);

 const fetchSettings = async () => {
 if (!user?.id) {
 setLoading(false);
 return;
 }

 try {
 setLoading(true);
 const response = await apiClient.get(`/users/${user.id}/settings`);
 const data = response.data.settings || response.data;
 setSettings({
 notifications_enabled: data.notifications_enabled ?? true,
 location_enabled: data.location_enabled ?? false,
 marketing_enabled: data.marketing_enabled ?? false,
 });
 } catch (err: any) {
 console.error("Failed to load settings:", err);
 } finally {
 setLoading(false);
 }
 };

 const updateSetting = async (key: keyof ScoutSettings, value: boolean) => {
 if (!user?.id) return;

 const oldValue = settings[key];
 setSettings((prev) => ({ ...prev, [key]: value }));
 setSavingSettings(true);

 try {
 await apiClient.post(`/users/${user.id}/settings/notifications/toggle`, {
 notification_type: key,
 enabled: value,
 });
 } catch (error: any) {
 // Revert on error
 setSettings((prev) => ({ ...prev, [key]: oldValue }));
 const errorMsg = error.response?.data?.message || "Failed to update settings";
 Alert.alert("Error", errorMsg);
 } finally {
 setSavingSettings(false);
 }
 };

 const handleNotificationsToggle = () => {
 updateSetting("notifications_enabled", !settings.notifications_enabled);
 };

 const handleLocationToggle = () => {
 updateSetting("location_enabled", !settings.location_enabled);
 };

 const handleMarketingToggle = () => {
 updateSetting("marketing_enabled", !settings.marketing_enabled);
 };

 const handleLogout = () => {
 Alert.alert("Sign Out", "Are you sure you want to sign out?", [
 { text: "Cancel", onPress: () => {} },
 {
 text: "Sign Out",
 onPress: () => {
 logout();
 },
 style: "destructive",
 },
 ]);
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
 <Text style={{ fontSize: 24, fontWeight: "800", color: "white" }}>
 Settings
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 {user?.name || "Scout"}
 </Text>
 </View>

 <View style={{ padding: space.lg }}>
 {/* Notifications Section */}
 <View style={{ marginBottom: space.lg }}>
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: space.md }}>
 Notifications
 </Text>
 <View style={{ backgroundColor: "white", borderRadius: radius.card, overflow: "hidden" }}>
 <View style={{ opacity: savingSettings ? 0.6 : 1 }}>
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
 <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
 <Ionicons name="notifications-outline" size={20} color={colors.blue500} />
 <View>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Push Notifications
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.xs }}>
 Get updates on recruits and earnings
 </Text>
 </View>
 </View>
 <Switch
 value={settings.notifications_enabled}
 onValueChange={handleNotificationsToggle}
 disabled={savingSettings}
 />
 </View>

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
 <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
 <Ionicons name="location-outline" size={20} color={colors.green500} />
 <View>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Location Sharing
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.xs }}>
 Show nearby opportunities
 </Text>
 </View>
 </View>
 <Switch
 value={settings.location_enabled}
 onValueChange={handleLocationToggle}
 disabled={savingSettings}
 />
 </View>

 <View
 style={{
 padding: space.md,
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "center",
 }}
 >
 <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
 <Ionicons name="mail-outline" size={20} color={colors.red500} />
 <View>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Marketing Emails
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.xs }}>
 New features and offers
 </Text>
 </View>
 </View>
 <Switch
 value={settings.marketing_enabled}
 onValueChange={handleMarketingToggle}
 disabled={savingSettings}
 />
 </View>
 </View>
 </View>
 </View>

 {/* Account Section */}
 <View>
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: space.md }}>
 Account
 </Text>
 <Pressable
 onPress={handleLogout}
 style={{
 backgroundColor: "white",
 borderRadius: radius.card,
 padding: space.md,
 flexDirection: "row",
 alignItems: "center",
 justifyContent: "space-between",
 borderLeftWidth: 4,
 borderLeftColor: colors.red500,
 }}
 >
 <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
 <Ionicons name="log-out-outline" size={20} color={colors.red500} />
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.red500 }}>
 Sign Out
 </Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color={colors.muted} />
 </Pressable>
 </View>

 <View style={{ height: space.lg }} />
 </View>
 </ScrollView>
 );
}
