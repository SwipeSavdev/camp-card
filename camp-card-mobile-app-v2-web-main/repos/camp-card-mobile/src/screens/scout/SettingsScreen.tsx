import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, space } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function ScoutSettingsScreen() {
 const { user, logout } = useAuthStore();

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ flex: 1, padding: space.lg }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>Settings</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>Scout account settings.</Text>

 <View style={{ marginTop: space.lg }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Account</Text>
 <Text style={{ marginTop: 8, color: colors.muted }}>Email</Text>
 <Text style={{ color: colors.text, fontWeight: '700' }}>{user?.email || ''}</Text>
 <Text style={{ marginTop: 12, color: colors.muted }}>Council ID</Text>
 <Text style={{ color: colors.text, fontWeight: '700' }}>{user?.tenantId || ''}</Text>
 </Card>
 </View>

 <View style={{ marginTop: space.lg }}>
 <Button label="Sign out" onPress={logout} variant="secondary" />
 </View>
 </View>
 </SafeAreaView>
 );
}
