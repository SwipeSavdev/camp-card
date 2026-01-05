import React, { useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, space, radius, shadow } from '../../theme';
import { useAuthStore } from '../../store/authStore';

type SettingItem = {
 id: string;
 icon: any;
 label: string;
 value?: string | boolean;
 type: 'toggle' | 'text' | 'button';
};

export default function CustomerSettingsScreen() {
 const { user, logout } = useAuthStore();
 const [settings, setSettings] = useState({
 notifications: true,
 locationServices: true,
 marketing: false,
 });

 const [showAccount, setShowAccount] = useState(true);
 const [showNotifications, setShowNotifications] = useState(true);

 const accountSettings: SettingItem[] = [
 {
 id: 'email',
 icon: 'mail-outline',
 label: 'Email',
 value: user?.email || '',
 type: 'text',
 },
 {
 id: 'council',
 icon: 'home-outline',
 label: 'Council',
 value: user?.tenantId || 'Orlando Area Council',
 type: 'text',
 },
 ];

 const notificationSettings = [
 {
 id: 'notifications',
 icon: 'notifications-outline',
 label: 'Push Notifications',
 type: 'toggle',
 },
 {
 id: 'locationServices',
 icon: 'location-outline',
 label: 'Location Services',
 type: 'toggle',
 },
 {
 id: 'marketing',
 icon: 'megaphone-outline',
 label: 'Marketing Emails',
 type: 'toggle',
 },
 ];

 const handleToggle = (key: keyof typeof settings) => {
 setSettings(prev => ({ ...prev, [key]: !prev[key] }));
 };

 const renderSettingItem = (item: SettingItem) => {
 if (item.type === 'text') {
 return (
 <View
 key={item.id}
 style={{
 paddingVertical: space.md,
 paddingHorizontal: space.lg,
 borderBottomWidth: 1,
 borderBottomColor: colors.gray200,
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 }}
 >
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flex: 1 }}>
 <View
 style={{
 width: 40,
 height: 40,
 borderRadius: 20,
 backgroundColor: colors.gray50,
 justifyContent: 'center',
 alignItems: 'center',
 }}
 >
 <Ionicons name={item.icon} size={20} color={colors.blue500} />
 </View>
 <View>
 <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
 {item.label}
 </Text>
 <Text
 style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}
 numberOfLines={1}
 >
 {item.value}
 </Text>
 </View>
 </View>
 </View>
 );
 }

 if (item.type === 'toggle') {
 const key = item.id as keyof typeof settings;
 return (
 <View
 key={item.id}
 style={{
 paddingVertical: space.md,
 paddingHorizontal: space.lg,
 borderBottomWidth: 1,
 borderBottomColor: colors.gray200,
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 }}
 >
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flex: 1 }}>
 <View
 style={{
 width: 40,
 height: 40,
 borderRadius: 20,
 backgroundColor: colors.gray50,
 justifyContent: 'center',
 alignItems: 'center',
 }}
 >
 <Ionicons name={item.icon} size={20} color={colors.blue500} />
 </View>
 <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 }}>
 {item.label}
 </Text>
 </View>
 <Switch
 value={settings[key]}
 onValueChange={() => handleToggle(key)}
 trackColor={{ false: colors.gray200, true: colors.red500 }}
 thumbColor={colors.white}
 />
 </View>
 );
 }

 return null;
 };

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <ScrollView showsVerticalScrollIndicator={false}>
 {/* Header */}
 <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>Settings</Text>
 <Text style={{ marginTop: 6, color: colors.muted, fontSize: 14 }}>
 Manage your account and preferences
 </Text>
 </View>

 {/* Account Section */}
 <View style={{ marginTop: space.lg }}>
 <TouchableOpacity
 onPress={() => setShowAccount(!showAccount)}
 style={{
 paddingHorizontal: space.lg,
 paddingVertical: space.md,
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 }}
 >
 <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Account</Text>
 <Ionicons
 name={showAccount ? 'chevron-up' : 'chevron-down'}
 size={20}
 color={colors.muted}
 />
 </TouchableOpacity>
 {showAccount && (
 <View
 style={{
 backgroundColor: colors.white,
 marginHorizontal: space.lg,
 borderRadius: radius.lg,
 ...shadow.card,
 overflow: 'hidden',
 }}
 >
 {accountSettings.map(renderSettingItem)}
 </View>
 )}
 </View>

 {/* Notifications Section */}
 <View style={{ marginTop: space.lg }}>
 <TouchableOpacity
 onPress={() => setShowNotifications(!showNotifications)}
 style={{
 paddingHorizontal: space.lg,
 paddingVertical: space.md,
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 }}
 >
 <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
 Notifications & Privacy
 </Text>
 <Ionicons
 name={showNotifications ? 'chevron-up' : 'chevron-down'}
 size={20}
 color={colors.muted}
 />
 </TouchableOpacity>
 {showNotifications && (
 <View
 style={{
 backgroundColor: colors.white,
 marginHorizontal: space.lg,
 borderRadius: radius.lg,
 ...shadow.card,
 overflow: 'hidden',
 }}
 >
 {notificationSettings.map(renderSettingItem)}
 </View>
 )}
 </View>

 {/* About Section */}
 <View style={{ marginTop: space.lg, marginBottom: space.xl }}>
 <View
 style={{
 backgroundColor: colors.white,
 marginHorizontal: space.lg,
 borderRadius: radius.lg,
 padding: space.lg,
 ...shadow.card,
 }}
 >
 <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: space.md }}>
 About
 </Text>
 <View style={{ gap: space.md }}>
 <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
 <Text style={{ fontSize: 14, color: colors.muted }}>App Version</Text>
 <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>1.0.0</Text>
 </View>
 <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
 <Text style={{ fontSize: 14, color: colors.muted }}>Build</Text>
 <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>2025-12-27</Text>
 </View>
 </View>
 </View>
 </View>

 {/* Sign Out Button */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.xl }}>
 <Button label="Sign Out" onPress={logout} variant="secondary" />
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}
