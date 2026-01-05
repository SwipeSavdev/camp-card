import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, space } from '../../theme';
import type { RedemptionCode } from '../../services/redemptionService';

type RouteParams = {
 redemption: RedemptionCode;
};

export default function RedemptionCodeScreen({ navigation }: any) {
 const route = useRoute();
 const { redemption } = route.params as RouteParams;

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ flex: 1, padding: space.lg }}>
 <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>Redemption Code</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 Show this to the cashier to redeem your offer.
 </Text>

 <View style={{ marginTop: space.lg }}>
 <Card style={{ alignItems: 'center' }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>{redemption.code}</Text>

 <View style={{ marginTop: space.lg }}>
 <QRCode value={redemption.qr_code_data || redemption.code} size={180} />
 </View>

 {redemption.instructions ? (
 <Text style={{ marginTop: space.lg, color: colors.muted, textAlign: 'center' }}>
 {redemption.instructions}
 </Text>
 ) : null}

 {redemption.expires_at ? (
 <Text style={{ marginTop: 10, color: colors.muted, fontSize: 12 }}>
 Expires: {redemption.expires_at}
 </Text>
 ) : null}
 </Card>
 </View>

 <View style={{ marginTop: space.lg }}>
 <Button label="Done" onPress={() => navigation.goBack()} />
 </View>
 </View>
 </SafeAreaView>
 );
}
