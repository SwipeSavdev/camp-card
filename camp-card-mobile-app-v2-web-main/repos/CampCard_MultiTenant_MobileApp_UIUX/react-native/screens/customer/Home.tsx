import React from "react";
import { View, Text, Pressable } from "react-native";
import { colors, space, radius } from "../../theme";

export default function CustomerHome() {
 return (
 <View style={{ flex: 1, padding: space.md, backgroundColor: colors.gray50 }}>
 <View style={{
 borderRadius: radius.card,
 padding: space.md,
 backgroundColor: colors.navy900,
 }}>
 <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>Support local Scouts with Camp Card</Text>
 <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 6 }}>
 Browse discounts, redeem offers, and get notified when youre near participating locations.
 </Text>
 </View>

 <View style={{ marginTop: space.md, gap: 12 }}>
 <Pressable style={{ padding: 14, borderRadius: radius.button, backgroundColor: colors.red500, alignItems: "center" }}>
 <Text style={{ color: "white", fontWeight: "800" }}>Browse offers</Text>
 </Pressable>
 <Pressable style={{ padding: 14, borderRadius: radius.button, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, alignItems: "center" }}>
 <Text style={{ color: colors.text, fontWeight: "800" }}>Find stores</Text>
 </Pressable>
 </View>
 </View>
 );
}
