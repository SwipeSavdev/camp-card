import React, { useState } from 'react';
import {
 View,
 Text,
 ScrollView,
 SafeAreaView,
 ImageBackground,
 TouchableOpacity,
 Animated,
 StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, images, radius, space, shadow } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/Button';
import Card from '../../components/Card';

type Props = {
 navigation: any;
};

export default function CustomerHomeScreen({ navigation }: Props) {
 const { user } = useAuthStore();
 const [isCardFlipped, setIsCardFlipped] = useState(false);
 const flipAnimation = React.useRef(new Animated.Value(0)).current;

 const toggleCardFlip = () => {
 Animated.timing(flipAnimation, {
 toValue: isCardFlipped ? 0 : 1,
 duration: 600,
 useNativeDriver: true,
 }).start();
 setIsCardFlipped(!isCardFlipped);
 };

 const frontInterpolate = flipAnimation.interpolate({
 inputRange: [0, 1],
 outputRange: ['0deg', '180deg'],
 });

 const backInterpolate = flipAnimation.interpolate({
 inputRange: [0, 1],
 outputRange: ['180deg', '360deg'],
 });

 const cardData = {
 firstName: 'Emily',
 lastName: 'Rodriguez',
 cardNumber: '0000 1264 7961 19',
 };

 const shortcuts = [
 { icon: 'map-outline', label: 'Find Offers', screen: 'Map', color: colors.blue500 },
 { icon: 'pricetags-outline', label: 'Browse All', screen: 'OffersTab', color: colors.blue500 },
 { icon: 'qr-code-outline', label: 'Redeem', screen: 'Redemption', color: colors.blue500 },
 { icon: 'settings-outline', label: 'Settings', screen: 'SettingsTab', color: colors.blue500 },
 ];

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
 {/* Header with welcome message */}
 <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>
 Welcome back!
 </Text>
 <Text style={{ fontSize: 16, color: colors.muted, marginTop: space.sm }}>
 {user?.name ? user.name.split(' ')[0] : 'Scout'}
 </Text>
 </View>

 {/* Camp Card Flip Feature */}
 <View style={{ paddingHorizontal: space.lg, marginTop: space.lg, height: 220 }}>
 <View style={{ position: 'relative', height: '100%' }}>
 {/* Front of Card */}
 <Animated.View
 style={[
 styles.cardFace,
 styles.cardFront,
 { transform: [{ rotateY: frontInterpolate }] },
 ]}
 >
 <ImageBackground
 source={images.campCardBg}
 style={styles.cardContent}
 imageStyle={{ borderRadius: radius.card }}
 >
 <View style={{ flex: 1, justifyContent: 'space-between' }}>
 <View>
 <Text style={{ color: colors.white, fontSize: 14, opacity: 0.9 }}>
 CAMP CARD
 </Text>
 </View>
 <Text
 style={{ color: colors.white, fontSize: 18, fontWeight: '700', letterSpacing: 2 }}
 >
    7961
 </Text>
 </View>
 <TouchableOpacity
 style={styles.flipButton}
 onPress={toggleCardFlip}
 activeOpacity={0.7}
 >
 <Ionicons name="swap-horizontal" size={20} color={colors.blue500} />
 </TouchableOpacity>
 </ImageBackground>
 </Animated.View>

 {/* Back of Card */}
 <Animated.View
 style={[
 styles.cardFace,
 styles.cardBack,
 { transform: [{ rotateY: backInterpolate }] },
 ]}
 >
 <View style={[styles.cardContent, { backgroundColor: colors.white }]}>
 <View style={{ flex: 1, justifyContent: 'center' }}>
 <View style={styles.cardBackField}>
 <Text style={styles.cardBackLabel}>CARDHOLDER</Text>
 <Text style={styles.cardBackValue}>
 {cardData.firstName} {cardData.lastName}
 </Text>
 </View>
 <View style={[styles.cardBackField, { marginTop: space.lg }]}>
 <Text style={styles.cardBackLabel}>CARD NUMBER</Text>
 <Text style={[styles.cardBackValue, { fontFamily: 'Courier New' }]}>
 {cardData.cardNumber}
 </Text>
 </View>
 </View>
 <TouchableOpacity
 style={styles.flipButton}
 onPress={toggleCardFlip}
 activeOpacity={0.7}
 >
 <Ionicons name="swap-horizontal" size={20} color={colors.blue500} />
 </TouchableOpacity>
 </View>
 </Animated.View>
 </View>
 </View>

 {/* Quick Shortcuts */}
 <View style={{ marginTop: space.xl, paddingHorizontal: space.lg }}>
 <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: space.md }}>
 Quick Actions
 </Text>
 <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
 {shortcuts.map((shortcut, idx) => (
 <TouchableOpacity
 key={idx}
 style={{
 flex: 0.45,
 backgroundColor: colors.white,
 borderRadius: radius.lg,
 padding: space.md,
 alignItems: 'center',
 ...shadow.card,
 }}
 onPress={() => navigation.navigate(shortcut.screen)}
 >
 <View
 style={{
 width: 48,
 height: 48,
 borderRadius: 24,
 backgroundColor: colors.gray50,
 alignItems: 'center',
 justifyContent: 'center',
 marginBottom: space.sm,
 }}
 >
 <Ionicons name={shortcut.icon as any} size={24} color={shortcut.color} />
 </View>
 <Text
 style={{
 fontSize: 12,
 fontWeight: '600',
 color: colors.text,
 textAlign: 'center',
 }}
 >
 {shortcut.label}
 </Text>
 </TouchableOpacity>
 ))}
 </View>
 </View>

 {/* Account Status */}
 <View style={{ marginTop: space.xl, paddingHorizontal: space.lg, marginBottom: space.xl }}>
 <Card>
 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
 <View style={{ flex: 1 }}>
 <Text style={{ fontSize: 14, color: colors.muted, marginBottom: space.xs }}>
 Account Status
 </Text>
 <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
 Active
 </Text>
 </View>
 <View
 style={{
 width: 12,
 height: 12,
 borderRadius: 6,
 backgroundColor: '#10b981',
 }}
 />
 </View>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.md }}>
 Council: {user?.tenantId || 'Orlando Area Council'}
 </Text>
 </Card>
 </View>

 {/* Featured Info */}
 <View style={{ paddingHorizontal: space.lg, marginBottom: space.xl }}>
 <Card>
 <Ionicons name="bulb-outline" size={24} color={colors.blue500} />
 <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginTop: space.sm }}>
 Pro Tip
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.xs, lineHeight: 18 }}>
 Use the map view to find merchants near you and unlock local savings today!
 </Text>
 </Card>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 cardFace: {
 position: 'absolute',
 width: '100%',
 height: '100%',
 backfaceVisibility: 'hidden',
 },
 cardFront: {
 zIndex: 2,
 },
 cardBack: {
 transform: [{ rotateY: '180deg' }],
 zIndex: 1,
 },
 cardContent: {
 flex: 1,
 padding: space.lg,
 borderRadius: radius.card,
 overflow: 'hidden',
 ...shadow.card,
 },
 flipButton: {
 position: 'absolute',
 top: space.md,
 right: space.md,
 width: 44,
 height: 44,
 borderRadius: 22,
 backgroundColor: 'rgba(255, 255, 255, 0.95)',
 justifyContent: 'center',
 alignItems: 'center',
 elevation: 4,
 shadowColor: colors.navy900,
 shadowOpacity: 0.2,
 shadowRadius: 4,
 shadowOffset: { width: 0, height: 2 },
 },
 cardBackField: {
 justifyContent: 'center',
 },
 cardBackLabel: {
 fontSize: 10,
 fontWeight: '700',
 color: colors.muted,
 textTransform: 'uppercase',
 letterSpacing: 1.5,
 },
 cardBackValue: {
 fontSize: 16,
 fontWeight: '700',
 color: colors.text,
 marginTop: space.xs,
 letterSpacing: 0.5,
 },
});
