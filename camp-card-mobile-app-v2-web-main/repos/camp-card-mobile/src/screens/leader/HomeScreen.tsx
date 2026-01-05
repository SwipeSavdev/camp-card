import React from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, space, radius, shadow } from '../../theme';
import { useAuthStore } from '../../store/authStore';

type Metric = {
 icon: string;
 label: string;
 value: string | number;
 color: string;
};

export default function LeaderHomeScreen({ navigation }: any) {
 const { user } = useAuthStore();

 // In a full integration, fetch troop metrics from the backend.
 const metrics = {
 totalScouts: 12,
 subscriptions: 47,
 estimatedFundraising: 5640,
 activeOffers: 28,
 };

 const dashboardMetrics: Metric[] = [
 {
 icon: 'people-outline',
 label: 'Total Scouts',
 value: metrics.totalScouts,
 color: colors.blue500,
 },
 {
 icon: 'card-outline',
 label: 'Subscriptions',
 value: metrics.subscriptions,
 color: '#10b981',
 },
 {
 icon: 'trending-up-outline',
 label: 'Est. Fundraising',
 value: `$${metrics.estimatedFundraising.toLocaleString()}`,
 color: colors.red500,
 },
 {
 icon: 'pricetags-outline',
 label: 'Active Offers',
 value: metrics.activeOffers,
 color: '#f59e0b',
 },
 ];

 const quickActions = [
 {
 icon: 'share-social-outline',
 label: 'Share Link',
 description: 'Share fundraising link',
 screen: 'ShareTab',
 },
 {
 icon: 'people-outline',
 label: 'Manage Scouts',
 description: 'View and manage scouts',
 screen: 'ScoutsTab',
 },
 ];

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <ScrollView showsVerticalScrollIndicator={false}>
 {/* Header */}
 <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>
 Dashboard
 </Text>
 <Text style={{ marginTop: 6, color: colors.muted, fontSize: 14 }}>
 Manage your troop's fundraising performance
 </Text>
 </View>

 {/* Key Metrics Grid */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.lg }}>
 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
 {dashboardMetrics.map((metric, idx) => (
 <View
 key={idx}
 style={{
 flex: 0.48,
 backgroundColor: colors.white,
 borderRadius: radius.lg,
 padding: space.md,
 ...shadow.card,
 }}
 >
 <View
 style={{
 width: 40,
 height: 40,
 borderRadius: 20,
 backgroundColor: metric.color,
 opacity: 0.15,
 justifyContent: 'center',
 alignItems: 'center',
 marginBottom: space.sm,
 }}
 >
 <Ionicons name={metric.icon as any} size={20} color={metric.color} />
 </View>
 <Text style={{ fontSize: 12, color: colors.muted, marginBottom: space.xs }}>
 {metric.label}
 </Text>
 <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
 {metric.value}
 </Text>
 </View>
 ))}
 </View>
 </View>

 {/* Quick Actions */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.lg }}>
 <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: space.md }}>
 Quick Actions
 </Text>
 {quickActions.map((action, idx) => (
 <TouchableOpacity
 key={idx}
 onPress={() => navigation.navigate(action.screen)}
 style={{
 backgroundColor: colors.white,
 borderRadius: radius.lg,
 padding: space.md,
 marginBottom: space.md,
 flexDirection: 'row',
 alignItems: 'center',
 ...shadow.card,
 }}
 >
 <View
 style={{
 width: 48,
 height: 48,
 borderRadius: 24,
 backgroundColor: colors.gray50,
 justifyContent: 'center',
 alignItems: 'center',
 marginRight: space.md,
 }}
 >
 <Ionicons name={action.icon as any} size={24} color={colors.blue500} />
 </View>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
 {action.label}
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 {action.description}
 </Text>
 </View>
 <Ionicons name="chevron-forward" size={20} color={colors.muted} />
 </TouchableOpacity>
 ))}
 </View>

 {/* Council Info */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.xl }}>
 <Card>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
 <View
 style={{
 width: 44,
 height: 44,
 borderRadius: 22,
 backgroundColor: colors.gray50,
 justifyContent: 'center',
 alignItems: 'center',
 }}
 >
 <Ionicons name="home-outline" size={24} color={colors.blue500} />
 </View>
 <View>
 <Text style={{ fontSize: 12, color: colors.muted }}>Your Council</Text>
 <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 4 }}>
 {user?.tenantId || 'Orlando Area Council'}
 </Text>
 </View>
 </View>
 </Card>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}
