import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { colors, space } from "../theme";

export default function Login() {
 return (
 <View style={{ flex: 1, padding: space.lg, backgroundColor: colors.gray50 }}>
 <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Welcome back</Text>
 <Text style={{ marginTop: 8, color: colors.muted }}>
 One login. Different experiences for Customers, Troop Leaders, and Scouts.
 </Text>

 <View style={{ marginTop: 18, gap: 12 }}>
 <TextInput placeholder="Email" style={{ padding: 12, borderWidth: 1, borderColor: colors.gray200, borderRadius: 14, backgroundColor: colors.white }} />
 <TextInput placeholder="Password" secureTextEntry style={{ padding: 12, borderWidth: 1, borderColor: colors.gray200, borderRadius: 14, backgroundColor: colors.white }} />
 <Pressable style={{ padding: 14, borderRadius: 14, backgroundColor: colors.red500, alignItems: "center" }}>
 <Text style={{ color: "white", fontWeight: "800" }}>Sign in</Text>
 </Pressable>
 </View>
 </View>
 );
}
