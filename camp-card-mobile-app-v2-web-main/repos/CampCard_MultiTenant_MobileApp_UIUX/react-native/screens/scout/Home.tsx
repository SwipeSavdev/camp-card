import React from "react";
import { View, Text, Pressable } from "react-native";
import { colors, space, radius } from "../../theme";

export default function ScoutHome() {
 return (
 <View style={{ flex: 1, padding: space.md, backgroundColor: colors.gray50 }}>
 <View style={{ borderRadius: radius.card, padding: space.md, backgroundColor: colors.navy900 }}>
 <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>Your progress</Text>
 <Text style={{ color: "rgba(255,255,255,0.9)", marginTop: 6 }}>
 Funds raised, Camp Cards sold, and goal progress.
 </Text>
 </View>

 <View style={{ marginTop: space.md }}>
 <Pressable style={{ padding: 14, borderRadius: radius.button, backgroundColor: colors.red500, alignItems: "center" }}>
 <Text style={{ color: "white", fontWeight: "800" }}>Share my link</Text>
 </Pressable>
 </View>
 </View>
 );
}
