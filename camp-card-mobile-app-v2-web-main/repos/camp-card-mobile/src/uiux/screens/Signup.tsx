import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, space } from "../theme";
import { apiClient } from "../../services/apiClient";
import { useAuthStore } from "../../store/authStore";

type RootStackParamList = {
 Login: undefined;
 Signup: undefined;
 ForgotPassword: undefined;
 CustomerTabs: undefined;
 ScoutTabs: undefined;
 LeaderTabs: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function Signup({ navigation }: Props) {
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [inviteCode, setInviteCode] = useState("");
 const [loading, setLoading] = useState(false);
 const [errors, setErrors] = useState({
 name: "",
 email: "",
 password: "",
 });

 const signup = useAuthStore((state) => state.signup);

 const validateForm = () => {
 const newErrors = { name: "", email: "", password: "" };
 let valid = true;

 if (!name.trim()) {
 newErrors.name = "Full name is required";
 valid = false;
 }

 if (!email.trim()) {
 newErrors.email = "Email is required";
 valid = false;
 } else if (!email.includes("@")) {
 newErrors.email = "Please enter a valid email";
 valid = false;
 }

 if (!password.trim()) {
 newErrors.password = "Password is required";
 valid = false;
 } else if (password.length < 6) {
 newErrors.password = "Password must be at least 6 characters";
 valid = false;
 }

 setErrors(newErrors);
 return valid;
 };

 const handleSignup = async () => {
 if (!validateForm()) return;

 setLoading(true);
 try {
 await signup({
 fullName: name.trim(),
 email: email.trim(),
 password,
 invitationCode: inviteCode.trim() || undefined
 });

 // The store's signup method handles navigation internally
 const user = useAuthStore.getState().user;
 if (user) {
 // Auto-navigate after signup
 const role = user.role?.toUpperCase();
 if (role === "CUSTOMER") {
 navigation.replace("CustomerTabs");
 } else if (role === "SCOUT") {
 navigation.replace("ScoutTabs");
 } else if (role === "LEADER") {
 navigation.replace("LeaderTabs");
 } else {
 Alert.alert("Welcome!", "Account created successfully");
 navigation.replace("Login");
 }
 }
 } catch (error: any) {
 const errorMessage =
 error.response?.data?.message ||
 error.message ||
 "Signup failed. Please try again.";
 Alert.alert("Signup Error", errorMessage);
 } finally {
 setLoading(false);
 }
 };

 return (
 <View style={{ flex: 1, padding: space.lg, backgroundColor: colors.gray50, justifyContent: "center" }}>
 <View style={{ marginBottom: space.xl }}>
 <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Create account</Text>
 <Text style={{ marginTop: 8, color: colors.muted }}>
 Leaders/Scouts can be invited via a code. Tenant (council) is part of your account.
 </Text>
 </View>

 <View style={{ gap: 12 }}>
 <View>
 <TextInput
 placeholder="Full name"
 value={name}
 onChangeText={setName}
 editable={!loading}
 style={{
 padding: 12,
 borderWidth: 1,
 borderColor: errors.name ? colors.red500 : colors.gray200,
 borderRadius: 14,
 backgroundColor: colors.white,
 color: colors.text,
 }}
 />
 {errors.name ? (
 <Text style={{ color: colors.red500, fontSize: 12, marginTop: 4 }}>
 {errors.name}
 </Text>
 ) : null}
 </View>

 <View>
 <TextInput
 placeholder="Email"
 value={email}
 onChangeText={setEmail}
 keyboardType="email-address"
 autoCapitalize="none"
 editable={!loading}
 style={{
 padding: 12,
 borderWidth: 1,
 borderColor: errors.email ? colors.red500 : colors.gray200,
 borderRadius: 14,
 backgroundColor: colors.white,
 color: colors.text,
 }}
 />
 {errors.email ? (
 <Text style={{ color: colors.red500, fontSize: 12, marginTop: 4 }}>
 {errors.email}
 </Text>
 ) : null}
 </View>

 <View>
 <TextInput
 placeholder="Password"
 value={password}
 onChangeText={setPassword}
 secureTextEntry
 editable={!loading}
 style={{
 padding: 12,
 borderWidth: 1,
 borderColor: errors.password ? colors.red500 : colors.gray200,
 borderRadius: 14,
 backgroundColor: colors.white,
 color: colors.text,
 }}
 />
 {errors.password ? (
 <Text style={{ color: colors.red500, fontSize: 12, marginTop: 4 }}>
 {errors.password}
 </Text>
 ) : null}
 </View>

 <View>
 <TextInput
 placeholder="Invitation code (optional)"
 value={inviteCode}
 onChangeText={setInviteCode}
 editable={!loading}
 autoCapitalize="characters"
 style={{
 padding: 12,
 borderWidth: 1,
 borderColor: colors.gray200,
 borderRadius: 14,
 backgroundColor: colors.white,
 color: colors.text,
 }}
 />
 </View>

 <Pressable
 onPress={handleSignup}
 disabled={loading}
 style={{
 padding: 14,
 borderRadius: 14,
 backgroundColor: loading ? colors.gray200 : colors.red500,
 alignItems: "center",
 justifyContent: "center",
 minHeight: 48,
 }}
 >
 {loading ? (
 <ActivityIndicator color={colors.text} />
 ) : (
 <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
 Create account
 </Text>
 )}
 </Pressable>
 </View>

 <View style={{ marginTop: space.xl, alignItems: "center" }}>
 <Text style={{ color: colors.muted }}>Already have an account?</Text>
 <Pressable onPress={() => navigation.navigate("Login")} disabled={loading}>
 <Text
 style={{
 color: colors.red500,
 fontWeight: "700",
 marginTop: 4,
 fontSize: 14,
 }}
 >
 Sign In
 </Text>
 </Pressable>
 </View>
 </View>
 );
}
