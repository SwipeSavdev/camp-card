import React from 'react';
import { ActivityIndicator, SafeAreaView, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, space } from '../../theme';
import { getOffer } from '../../services/offersService';
import { activateOffer } from '../../services/redemptionService';

type RouteParams = {
 offerId: number;
};

export default function OfferDetailsScreen({ navigation }: any) {
 const route = useRoute();
 const { offerId } = route.params as RouteParams;

 const { data: offer, isLoading } = useQuery({
 queryKey: ['offer', offerId],
 queryFn: () => getOffer(offerId),
 });

 const [activating, setActivating] = React.useState(false);

 const onActivate = async () => {
 if (!offer) return;
 setActivating(true);
 try {
 const redemption = await activateOffer({
 offerId: offer.id,
 location_id: offer.locations?.[0]?.id,
 });

 navigation.navigate('RedemptionCode', {
 redemption,
 });
 } finally {
 setActivating(false);
 }
 };

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ flex: 1, padding: space.lg }}>
 {isLoading ? (
 <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
 <ActivityIndicator />
 </View>
 ) : !offer ? (
 <Text style={{ color: colors.muted }}>Offer not found.</Text>
 ) : (
 <>
 <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>{offer.title}</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 {offer.merchant?.business_name}  {offer.category}
 </Text>

 <View style={{ marginTop: space.lg }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Details</Text>
 <Text style={{ marginTop: 8, color: colors.text }}>{offer.description}</Text>
 {offer.valid_until ? (
 <Text style={{ marginTop: 10, color: colors.muted, fontSize: 12 }}>
 Valid until: {offer.valid_until}
 </Text>
 ) : null}
 </Card>
 </View>

 <View style={{ marginTop: space.lg }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Location</Text>
 <Text style={{ marginTop: 8, color: colors.muted }}>
 {offer.locations?.[0]?.address || 'See merchant for participating locations'}
 </Text>
 </Card>
 </View>

 <View style={{ marginTop: space.lg }}>
 {offer.can_redeem === false ? (
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Redemption</Text>
 <Text style={{ marginTop: 8, color: colors.red600, fontWeight: '800' }}>
 Subscription required to redeem.
 </Text>
 </Card>
 ) : (
 <Button label="Generate redemption code" onPress={onActivate} loading={activating} />
 )}
 </View>
 </>
 )}
 </View>
 </SafeAreaView>
 );
}
