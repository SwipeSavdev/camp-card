import React from 'react';
import { FlatList, SafeAreaView, Text, View } from 'react-native';

import Card from '../../components/Card';
import { colors, space } from '../../theme';

type Scout = {
 id: string;
 name: string;
 subscriptions: number;
};

const mockScouts: Scout[] = [
 { id: 's1', name: 'Emily J.', subscriptions: 12 },
 { id: 's2', name: 'Alex P.', subscriptions: 8 },
 { id: 's3', name: 'Sam R.', subscriptions: 5 },
];

export default function LeaderScoutsScreen() {
 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ padding: space.lg, paddingBottom: 0 }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>Scouts</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 Track performance for your troop.
 </Text>
 </View>

 <FlatList
 contentContainerStyle={{ padding: space.lg }}
 data={mockScouts}
 keyExtractor={item => item.id}
 renderItem={({ item }) => (
 <View style={{ marginBottom: space.md }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>{item.name}</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 Subscriptions: {item.subscriptions}
 </Text>
 </Card>
 </View>
 )}
 />
 </SafeAreaView>
 );
}
