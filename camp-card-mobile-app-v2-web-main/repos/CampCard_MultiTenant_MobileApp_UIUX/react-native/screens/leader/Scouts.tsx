import React from "react";
import { View, Text } from "react-native";
import { colors, space } from "../../theme";

export default function LeaderScouts() {
 return (
 <View style={{ flex: 1, padding: space.md, backgroundColor: colors.gray50 }}>
 <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>Scouts</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 List of Scouts with cards sold + funds raised. Add Scout flow.
 </Text>
 </View>
 );
}
