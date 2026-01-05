import React from 'react';
import { SafeAreaView, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, space, radius, shadow } from '../../theme';

type Stat = {
 icon: string;
 label: string;
 value: string | number;
 color: string;
};

export default function ScoutHomeScreen({ navigation }: any) {
 // In a full integration, fetch /scouts/:id/dashboard
 const metrics = {
 linkClicks: 47,
 qrScans: 23,
 subscriptionsTotal: 20,
 estimatedFundraising: 240,
 };

 const stats: Stat[] = [
 {
 icon: 'link-outline',
 label: 'Link Clicks',
 value: metrics.linkClicks,
 color: colors.blue500,
 },
 {
 icon: 'qr-code-outline',
 label: 'QR Scans',
 value: metrics.qrScans,
 color: '#8b5cf6',
 },
 {
 icon: 'card-outline',
 label: 'Subscriptions',
 value: metrics.subscriptionsTotal,
 color: '#10b981',
 },
 {
 icon: 'trending-up-outline',
 label: 'Est. Fundraising',
 value: `$${metrics.estimatedFundraising.toLocaleString()}`,
 color: colors.red500,
 },
 ];

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <ScrollView showsVerticalScrollIndicator={false}>
 {/* Header */}
 <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>
 Your Dashboard
 </Text>
 <Text style={{ marginTop: 6, color: colors.muted, fontSize: 14 }}>
 Track your fundraising progress
 </Text>
 </View>

 {/* Stats Grid */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.lg }}>
 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
 {stats.map((stat, idx) => (
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
 backgroundColor: stat.color,
 opacity: 0.15,
 justifyContent: 'center',
 alignItems: 'center',
 marginBottom: space.sm,
 }}
 >
 <Ionicons name={stat.icon as any} size={20} color={stat.color} />
 </View>
 <Text style={{ fontSize: 12, color: colors.muted, marginBottom: space.xs }}>
 {stat.label}
 </Text>
 <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
 {stat.value}
 </Text>
 </View>
 ))}
 </View>
 </View>

 {/* Primary CTA */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.lg }}>
 <Card>
 <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
 <View
 style={{
 width: 48,
 height: 48,
 borderRadius: 24,
 backgroundColor: colors.red500,
 opacity: 0.15,
 justifyContent: 'center',
 alignItems: 'center',
 }}
 >
 <Ionicons name="share-social-outline" size={24} color={colors.red500} />
 </View>
 <View>
 <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
 Share Your Link
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
 Get more subscriptions
 </Text>
 </View>
 </View>
 <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: space.md }}>
 Share your personal fundraising link with friends and family. Every subscription helps your Scout goals!
 </Text>
 <Button label="Share My Link" onPress={() => navigation.navigate('ShareTab')} />
 </Card>
 </View>

 {/* Tips */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.xl }}>
 <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: space.md }}>
 Pro Tips
 </Text>
 <Card>
 <View style={{ gap: space.md }}>
 <View style={{ flexDirection: 'row', gap: space.md }}>
 <Text style={{ fontSize: 12, color: colors.red500, fontWeight: '700' }}>1.</Text>
 <Text style={{ fontSize: 12, color: colors.muted, flex: 1, lineHeight: 18 }}>
 Share on social media to reach more people
 </Text>
 </View>
 <View style={{ flexDirection: 'row', gap: space.md }}>
 <Text style={{ fontSize: 12, color: colors.red500, fontWeight: '700' }}>2.</Text>
 <Text style={{ fontSize: 12, color: colors.muted, flex: 1, lineHeight: 18 }}>
 Use your QR code for quick mobile sharing
 </Text>
 </View>
 <View style={{ flexDirection: 'row', gap: space.md }}>
 <Text style={{ fontSize: 12, color: colors.red500, fontWeight: '700' }}>3.</Text>
 <Text style={{ fontSize: 12, color: colors.muted, flex: 1, lineHeight: 18 }}>
 Track your progress with real-time stats
 </Text>
 </View>
 </View>
 </Card>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}
