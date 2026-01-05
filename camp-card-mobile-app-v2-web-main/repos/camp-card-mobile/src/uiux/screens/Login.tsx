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

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function Login({ navigation }: Props) {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [emailError, setEmailError] = useState("");
 const [passwordError, setPasswordError] = useState("");

 const login = useAuthStore((state) => state.login);

 const validateForm = () => {
 let valid = true;
 setEmailError("");
 setPasswordError("");

 if (!email.trim()) {
 setEmailError("Email is required");
 valid = false;
 } else if (!email.includes("@")) {
 setEmailError("Please enter a valid email");
 valid = false;
 }

 if (!password.trim()) {
 setPasswordError("Password is required");
 valid = false;
 } else if (password.length < 6) {
 setPasswordError("Password must be at least 6 characters");
 valid = false;
 }

 return valid;
 };

 const handleLogin = async () => {
 if (!validateForm()) return;

 setLoading(true);
 try {
 await login({ email: email.trim(), password });

 // The store's login method handles navigation internally
 const user = useAuthStore.getState().user;
 if (user) {
 // Navigate based on user role
 const role = user.role?.toUpperCase();
 if (role === "CUSTOMER") {
 navigation.replace("CustomerTabs");
 } else if (role === "LEADER") {
 navigation.replace("LeaderTabs");
 } else if (role === "SCOUT") {
 navigation.replace("ScoutTabs");
 } else {
 Alert.alert("Error", "Unknown user role");
 }
 }
 } catch (error: any) {
 const errorMessage =
 error.response?.data?.message ||
 error.message ||
 "Login failed. Please try again.";
 Alert.alert("Login Error", errorMessage);
 } finally {
 setLoading(false);
 }
 };

 return (
 <View style={{ flex: 1, padding: space.lg, backgroundColor: colors.gray50, justifyContent: "center" }}>
 <View style={{ marginBottom: space.xl }}>
 <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>Welcome back</Text>
 <Text style={{ marginTop: 8, color: colors.muted }}>
 One login. Different experiences for Customers, Troop Leaders, and Scouts.
 </Text>
 </View>

 <View style={{ gap: 12 }}>
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
 borderColor: passwordError ? colors.red500 : colors.gray200,
 borderRadius: 14,
 backgroundColor: colors.white,
 color: colors.text,
 }}
 />
 {passwordError ? (
 <Text style={{ color: colors.red500, fontSize: 12, marginTop: 4 }}>
 {passwordError}
 </Text>
 ) : null}
 </View>

 {/* Forgot Password Link */}
 <View style={{ alignItems: "flex-end" }}>
 <Pressable onPress={() => navigation.navigate("ForgotPassword")} disabled={loading}>
 <Text style={{ color: colors.red500, fontWeight: "600", fontSize: 13 }}>
 Forgot password?
 </Text>
 </Pressable>
 </View>

 <Pressable
 onPress={handleLogin}
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
 <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>Sign in</Text>
 )}
 </Pressable>
 </View>

 <View style={{ marginTop: space.xl, alignItems: "center" }}>
 <Text style={{ color: colors.muted }}>Don't have an account?</Text>
 <Pressable onPress={() => navigation.navigate("Signup")} disabled={loading}>
 <Text
 style={{
 color: colors.red500,
 fontWeight: "700",
 marginTop: 4,
 fontSize: 14,
 }}
 >
 Create Account
 </Text>
 </Pressable>
 </View>
 </View>
 );
}
