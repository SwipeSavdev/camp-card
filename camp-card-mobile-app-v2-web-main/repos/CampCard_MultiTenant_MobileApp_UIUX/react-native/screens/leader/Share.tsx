import React from "react";
import { View, Text } from "react-native";
import { colors, space } from "../../theme";

export default function LeaderShare() {
 return (
 <View style={{ flex: 1, padding: space.md, backgroundColor: colors.gray50 }}>
 <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>Share link</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 Copy + Share CTA + QR block (real QR in production).
 </Text>
 </View>
 );
}
