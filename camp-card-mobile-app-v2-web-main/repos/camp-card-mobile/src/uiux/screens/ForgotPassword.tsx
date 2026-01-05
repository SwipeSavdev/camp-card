import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, space } from "../theme";
import { apiClient } from "../../services/apiClient";

type RootStackParamList = {
 Login: undefined;
 ForgotPassword: undefined;
 ResetPassword: { email: string; token: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function ForgotPassword({ navigation }: Props) {
 const [email, setEmail] = useState("");
 const [loading, setLoading] = useState(false);
 const [emailError, setEmailError] = useState("");
 const [submitted, setSubmitted] = useState(false);

 const validateEmail = () => {
 setEmailError("");

 if (!email.trim()) {
 setEmailError("Email is required");
 return false;
 }

 if (!email.includes("@")) {
 setEmailError("Please enter a valid email");
 return false;
 }

 return true;
 };

 const handleResetRequest = async () => {
 if (!validateEmail()) return;

 setLoading(true);
 try {
 const response = await apiClient.post("/users/password-reset/request", {
 email: email.trim(),
 });

 if (response.status === 200 || response.status === 201) {
 setSubmitted(true);
 Alert.alert(
 "Check Your Email",
 "We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password."
 );
 // Auto-navigate back to login after 5 seconds
 setTimeout(() => {
 navigation.replace("Login");
 }, 5000);
 }
 } catch (error: any) {
 const errorMessage =
 error.response?.data?.message ||
 error.message ||
 "Failed to process reset request. Please try again.";
 Alert.alert("Error", errorMessage);
 } finally {
 setLoading(false);
 }
 };

 if (submitted) {
 return (
 <View
 style={{
 flex: 1,
 padding: space.lg,
 backgroundColor: colors.gray50,
 justifyContent: "center",
 alignItems: "center",
 }}
 >
 <View style={{ alignItems: "center", gap: space.md }}>
 <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text, textAlign: "center" }}>
 Check Your Email
 </Text>
 <Text style={{ color: colors.muted, textAlign: "center", lineHeight: 22 }}>
 We've sent a password reset link to {email}. Click the link in your email to reset your
 password.
 </Text>
 <Text style={{ color: colors.muted, fontSize: 12, marginTop: space.lg }}>
 Redirecting to login in a few seconds...
 </Text>
 </View>
 </View>
 );
 }

 return (
 <View
 style={{
 flex: 1,
 padding: space.lg,
 backgroundColor: colors.gray50,
 justifyContent: "center",
 }}
 >
 <View style={{ marginBottom: space.xl }}>
 <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
 Reset Your Password
 </Text>
 <Text style={{ marginTop: 8, color: colors.muted }}>
 Enter your email address and we'll send you a link to reset your password.
 </Text>
 </View>

 <View style={{ gap: 12 }}>
 <View>
 <TextInput
 placeholder="Email Address"
 value={email}
 onChangeText={setEmail}
 keyboardType="email-address"
 autoCapitalize="none"
 editable={!loading}
 style={{
 padding: 12,
 borderWidth: 1,
 borderColor: emailError ? colors.red500 : colors.gray200,
 borderRadius: 14,
 backgroundColor: colors.white,
 color: colors.text,
 }}
 />
 {emailError ? (
 <Text style={{ color: colors.red500, fontSize: 12, marginTop: 4 }}>
 {emailError}
 </Text>
 ) : null}
 </View>

 <Pressable
 onPress={handleResetRequest}
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
 Send Reset Link
 </Text>
 )}
 </Pressable>
 </View>

 <View style={{ marginTop: space.xl, alignItems: "center" }}>
 <Pressable onPress={() => navigation.goBack()} disabled={loading}>
 <Text
 style={{
 color: colors.red500,
 fontWeight: "700",
 fontSize: 14,
 }}
 >
 Back to Login
 </Text>
 </Pressable>
 </View>
 </View>
 );
}
