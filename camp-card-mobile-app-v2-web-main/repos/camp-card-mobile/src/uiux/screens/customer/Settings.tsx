import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Switch, Pressable, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, space, radius } from "../../theme";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../services/apiClient";

interface UserSettings {
 notifications_enabled?: boolean;
 location_enabled?: boolean;
 marketing_enabled?: boolean;
 notification_radius_km?: number;
 quiet_hours_start?: string;
 quiet_hours_end?: string;
}

export default function CustomerSettings() {
 const user = useAuthStore((s) => s.user);
 const logout = useAuthStore((s) => s.logout);

 const [notificationsEnabled, setNotificationsEnabled] = useState(true);
 const [locationEnabled, setLocationEnabled] = useState(true);
 const [marketingEnabled, setMarketingEnabled] = useState(false);
 const [loading, setLoading] = useState(true);
 const [savingSettings, setSavingSettings] = useState(false);

 // Fetch settings on mount
 useEffect(() => {
 fetchSettings();
 }, [user?.id]);

 const fetchSettings = async () => {
 if (!user?.id) {
 setLoading(false);
 return;
 }

 try {
 const response = await apiClient.get(`/users/${user.id}/settings`);
 const settings: UserSettings = response.data.settings || response.data;

 if (settings) {
 setNotificationsEnabled(settings.notifications_enabled !== false);
 setLocationEnabled(settings.location_enabled !== false);
 setMarketingEnabled(settings.marketing_enabled === true);
 }
 } catch (error) {
 console.warn("Failed to load settings, using defaults", error);
 } finally {
 setLoading(false);
 }
 };

 const updateSetting = async (setting: string, value: boolean) => {
 if (!user?.id) return;

 setSavingSettings(true);
 try {
 await apiClient.post(`/users/${user.id}/settings/notifications/toggle`, {
 notification_type: setting,
 enabled: value,
 });
 } catch (error: any) {
 const errorMsg = error.response?.data?.message || "Failed to save setting";
 Alert.alert("Error", errorMsg);
 // Revert the change if API fails
 if (setting === "push") setNotificationsEnabled(!value);
 if (setting === "location") setLocationEnabled(!value);
 if (setting === "marketing") setMarketingEnabled(!value);
 } finally {
 setSavingSettings(false);
 }
 };

 const handleNotificationsToggle = (value: boolean) => {
 setNotificationsEnabled(value);
 updateSetting("push", value);
 };

 const handleLocationToggle = (value: boolean) => {
 setLocationEnabled(value);
 updateSetting("location", value);
 };

 const handleMarketingToggle = (value: boolean) => {
 setMarketingEnabled(value);
 updateSetting("marketing", value);
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

 const SettingRow = ({
 icon,
 title,
 subtitle,
 value,
 onValueChange,
 isSwitch = false,
 }: {
 icon: string;
 title: string;
 subtitle?: string;
 value?: boolean;
 onValueChange?: (value: boolean) => void;
 isSwitch?: boolean;
 }) => (
 <View
 style={{
 flexDirection: "row",
 alignItems: "center",
 paddingVertical: space.md,
 paddingHorizontal: space.lg,
 borderBottomWidth: 1,
 borderBottomColor: colors.gray100,
 }}
 >
 <View
 style={{
 width: 40,
 height: 40,
 borderRadius: 10,
 backgroundColor: colors.blue50,
 justifyContent: "center",
 alignItems: "center",
 marginRight: space.md,
 }}
 >
 <Ionicons name={icon as any} size={18} color={colors.blue500} />
 </View>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 {title}
 </Text>
 {subtitle && (
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 {subtitle}
 </Text>
 )}
 </View>
 {isSwitch && (
 <Switch
 value={value}
 onValueChange={onValueChange}
 disabled={savingSettings}
 trackColor={{ false: colors.gray200, true: colors.blue500 }}
 thumbColor={value ? colors.blue500 : colors.gray300}
 />
 )}
 </View>
 );

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <ScrollView>
 {/* Header */}
 <View style={{ padding: space.lg, backgroundColor: colors.navy900 }}>
 <Text style={{ fontSize: 24, fontWeight: "800", color: "white" }}>
 Settings
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 Manage your account and preferences
 </Text>
 </View>

 <View style={{ paddingVertical: space.lg }}>
 {/* Account Section */}
 <View style={{ marginBottom: space.lg }}>
 <Text
 style={{
 fontSize: 12,
 fontWeight: "700",
 color: colors.muted,
 textTransform: "uppercase",
 paddingHorizontal: space.lg,
 marginBottom: space.md,
 letterSpacing: 0.5,
 }}
 >
 Account
 </Text>
 <View style={{ backgroundColor: "white", overflow: "hidden", borderRadius: radius.card }}>
 <SettingRow
 icon="person-circle-outline"
 title="Account Email"
 subtitle={user?.email || "your.email@example.com"}
 />
 <SettingRow
 icon="location-outline"
 title="Council/Location"
 subtitle={user?.tenantId || "Select your council"}
 />
 <SettingRow
 icon="card-outline"
 title="Subscription Status"
 subtitle="Active - Expires in 364 days"
 />
 </View>
 </View>

 {/* Notifications Section */}
 <View style={{ marginBottom: space.lg }}>
 <Text
 style={{
 fontSize: 12,
 fontWeight: "700",
 color: colors.muted,
 textTransform: "uppercase",
 paddingHorizontal: space.lg,
 marginBottom: space.md,
 letterSpacing: 0.5,
 }}
 >
 Notifications & Privacy
 </Text>
 <View style={{ backgroundColor: "white", overflow: "hidden", borderRadius: radius.card }}>
 <View
 style={{
 flexDirection: "row",
 alignItems: "center",
 paddingVertical: space.md,
 paddingHorizontal: space.lg,
 borderBottomWidth: 1,
 borderBottomColor: colors.gray100,
 opacity: savingSettings ? 0.6 : 1,
 }}
 >
 <View
 style={{
 width: 40,
 height: 40,
 borderRadius: 10,
 backgroundColor: colors.blue50,
 justifyContent: "center",
 alignItems: "center",
 marginRight: space.md,
 }}
 >
 <Ionicons name="notifications-outline" size={18} color={colors.blue500} />
 </View>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Push Notifications
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 Get alerts for new offers nearby
 </Text>
 </View>
 <Switch
 value={notificationsEnabled}
 onValueChange={handleNotificationsToggle}
 disabled={savingSettings}
 trackColor={{ false: colors.gray200, true: colors.blue400 }}
 thumbColor={notificationsEnabled ? colors.blue500 : colors.gray300}
 />
 </View>

 <View
 style={{
 flexDirection: "row",
 alignItems: "center",
 paddingVertical: space.md,
 paddingHorizontal: space.lg,
 borderBottomWidth: 1,
 borderBottomColor: colors.gray100,
 opacity: savingSettings ? 0.6 : 1,
 }}
 >
 <View
 style={{
 width: 40,
 height: 40,
 borderRadius: 10,
 backgroundColor: colors.blue50,
 justifyContent: "center",
 alignItems: "center",
 marginRight: space.md,
 }}
 >
 <Ionicons name="location-outline" size={18} color={colors.blue500} />
 </View>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Location Services
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 Find nearby merchants
 </Text>
 </View>
 <Switch
 value={locationEnabled}
 onValueChange={handleLocationToggle}
 disabled={savingSettings}
 trackColor={{ false: colors.gray200, true: colors.blue400 }}
 thumbColor={locationEnabled ? colors.blue500 : colors.gray300}
 />
 </View>

 <View
 style={{
 flexDirection: "row",
 alignItems: "center",
 paddingVertical: space.md,
 paddingHorizontal: space.lg,
 opacity: savingSettings ? 0.6 : 1,
 }}
 >
 <View
 style={{
 width: 40,
 height: 40,
 borderRadius: 10,
 backgroundColor: colors.blue50,
 justifyContent: "center",
 alignItems: "center",
 marginRight: space.md,
 }}
 >
 <Ionicons name="mail-outline" size={18} color={colors.blue500} />
 </View>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Marketing Emails
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 Exclusive deals and updates
 </Text>
 </View>
 <Switch
 value={marketingEnabled}
 onValueChange={handleMarketingToggle}
 disabled={savingSettings}
 trackColor={{ false: colors.gray200, true: colors.blue400 }}
 thumbColor={marketingEnabled ? colors.blue500 : colors.gray300}
 />
 </View>
 </View>
 </View>

 {/* About Section */}
 <View style={{ marginBottom: space.lg }}>
 <Text
 style={{
 fontSize: 12,
 fontWeight: "700",
 color: colors.muted,
 textTransform: "uppercase",
 paddingHorizontal: space.lg,
 marginBottom: space.md,
 letterSpacing: 0.5,
 }}
 >
 About
 </Text>
 <View style={{ backgroundColor: "white", overflow: "hidden", borderRadius: radius.card }}>
 <SettingRow
 icon="information-circle-outline"
 title="App Version"
 subtitle="1.0.0"
 />
 <SettingRow
 icon="document-outline"
 title="Terms of Service"
 subtitle="Read our terms"
 />
 <SettingRow
 icon="shield-checkmark-outline"
 title="Privacy Policy"
 subtitle="Learn how we protect your data"
 />
 </View>
 </View>

 {/* Sign Out Button */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.xl }}>
 <Pressable
 onPress={handleLogout}
 style={{
 backgroundColor: colors.red500,
 paddingVertical: space.md,
 borderRadius: radius.button,
 alignItems: "center",
 }}
 >
 <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
 Sign Out
 </Text>
 </Pressable>
 </View>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}
