import React from 'react';
import { SafeAreaView, Share, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, space } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function ScoutShareScreen() {
 const { user } = useAuthStore();

 // Placeholder share URL. In full integration, fetch a tracked referral link from backend.
 const shareUrl = `https://campcard.app/join?scout_id=${encodeURIComponent(user?.id || 'unknown')}`;

 const onCopy = async () => {
 await Clipboard.setStringAsync(shareUrl);
 };

 const onShare = async () => {
 await Share.share({
 message: `Support my Scouting fundraiser by purchasing a Camp Card subscription!

${shareUrl}`,
 });
 };

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ flex: 1, padding: space.lg }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>Share</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 Share your personal link and QR code.
 </Text>

 <View style={{ marginTop: space.lg }}>
 <Card style={{ alignItems: 'center' }}>
 <QRCode value={shareUrl} size={180} />
 <Text style={{ marginTop: space.lg, fontWeight: '800', color: colors.text }}>
 {shareUrl}
 </Text>

 <View style={{ marginTop: space.lg, width: '100%' }}>
 <Button label="Copy link" onPress={onCopy} />
 </View>
 <View style={{ marginTop: space.md, width: '100%' }}>
 <Button label="Share" onPress={onShare} variant="secondary" />
 </View>
 </Card>
 </View>
 </View>
 </SafeAreaView>
 );
}
