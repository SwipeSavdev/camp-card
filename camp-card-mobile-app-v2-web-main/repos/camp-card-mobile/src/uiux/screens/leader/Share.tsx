import React, { useState } from "react";
import {
 View,
 Text,
 ScrollView,
 Pressable,
 Share,
 Alert,
 ActivityIndicator,
 Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { colors, space, radius } from "../../theme";
import { logLeaderShare } from "../../../services/dashboardService";
import { useAuthStore } from "../../../store/authStore";

// Import app icon
const appIcon = require("../../../../assets/images/appicon_1024.png");

export default function LeaderShare() {
 const user = useAuthStore((s) => s.user);
 const [loading, setLoading] = useState(false);
 const troopLink = `https://campcard.app/troop/${user?.id}`;
 const troopCode = user?.id ? `TROOP-${user.id.substring(0, 6).toUpperCase()}` : "TROOP-000000";

 const handleShare = async () => {
 try {
 setLoading(true);
 await Share.share({
 message: `Lead your troop with Camp Card! Help Scouts earn rewards and raise funds. Join our troop! Code: ${troopCode}. Download here: ${troopLink}`,
 title: "Join as Troop Leader",
 url: troopLink,
 });
 await logLeaderShare('share');
 } catch (error) {
 console.error("Share failed:", error);
 } finally {
 setLoading(false);
 }
 };

 const handleCopy = () => {
 Alert.alert("Copied", `Troop code ${troopCode} copied to clipboard!`);
 };

 const handleShareMethod = (method: string) => {
 Alert.alert("Share via " + method, "Opening " + method + " to share your troop link");
 };

 return (
 <ScrollView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ padding: space.lg, backgroundColor: colors.navy900, paddingTop: space.lg * 2.5 }}>
 <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
 Share Troop Link
 </Text>
 <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
 Recruit new scouts and leaders
 </Text>
 </View>

 <View style={{ padding: space.lg }}>
 {/* Info Card */}
 <View style={{ backgroundColor: "white", borderRadius: radius.card, padding: space.lg, marginBottom: space.lg }}>
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
 Grow Your Troop
 </Text>
 <Text style={{ fontSize: 12, color: colors.muted, marginTop: space.sm, lineHeight: 20 }}>
 Share your unique Troop link with other leaders and scouts. Build a stronger fundraising network together!
 </Text>
 </View>

 {/* Troop Code Display */}
 <View style={{ marginBottom: space.lg }}>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600", marginBottom: space.sm }}>
 YOUR TROOP CODE
 </Text>
 <View
 style={{
 backgroundColor: colors.gray50,
 borderRadius: radius.button,
 paddingHorizontal: space.md,
 paddingVertical: space.md,
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "center",
 }}
 >
 <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, letterSpacing: 1 }}>
 {troopCode}
 </Text>
 <Pressable onPress={handleCopy}>
 <Ionicons name="copy" size={20} color={colors.blue500} />
 </Pressable>
 </View>
 </View>

 {/* Share Link */}
 <View style={{ marginBottom: space.lg }}>
 <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600", marginBottom: space.sm }}>
 SHARE YOUR LINK
 </Text>
 <View
 style={{
 backgroundColor: colors.gray50,
 borderRadius: radius.button,
 paddingHorizontal: space.md,
 paddingVertical: space.md,
 marginBottom: space.md,
 }}
 >
 <Text
 style={{
 fontSize: 12,
 color: colors.muted,
 fontFamily: "Courier New",
 }}
 numberOfLines={1}
 >
 {troopLink}
 </Text>
 </View>

 <Pressable
 onPress={handleShare}
 disabled={loading}
 style={{
 backgroundColor: colors.red500,
 paddingVertical: space.md,
 borderRadius: radius.button,
 flexDirection: "row",
 justifyContent: "center",
 alignItems: "center",
 gap: space.sm,
 opacity: loading ? 0.7 : 1,
 }}
 >
 {loading ? (
 <ActivityIndicator color="white" size="small" />
 ) : (
 <>
 <Ionicons name="share-social" size={18} color="white" />
 <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
 Share Troop Link
 </Text>
 </>
 )}
 </Pressable>
 </View>

 {/* QR Code Section */}
 <View style={{ marginTop: space.lg, marginBottom: space.lg, alignItems: "center" }}>
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: space.md }}>
 Scan to Join
 </Text>
 <View style={{ backgroundColor: "white", borderRadius: radius.card, padding: space.lg, alignItems: "center", justifyContent: "center" }}>
 <View style={{ position: "relative", width: 280, height: 280 }}>
 <QRCode
 value={troopLink}
 size={280}
 color={colors.navy900}
 backgroundColor="white"
 logo={appIcon}
 logoSize={85}
 logoBackgroundColor="white"
 logoMargin={2}
 />
 </View>
 <Text style={{ fontSize: 11, color: colors.muted, marginTop: space.md, textAlign: "center" }}>
 Anyone can scan this code to join your troop
 </Text>
 </View>
 </View>

 {/* Share Methods */}
 <View style={{ marginTop: space.lg }}>
 <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: space.md }}>
 Quick Share Methods
 </Text>
 <View style={{ gap: space.sm }}>
 {[
 { icon: "logo-facebook", label: "Facebook", color: "#1877F2" },
 { icon: "mail-outline", label: "Email", color: colors.blue500 },
 { icon: "logo-whatsapp", label: "WhatsApp", color: "#25D366" },
 { icon: "call-outline", label: "SMS", color: colors.green500 },
 ].map((method) => (
 <Pressable
 key={method.label}
 onPress={() => handleShareMethod(method.label)}
 style={{
 backgroundColor: "white",
 borderRadius: radius.button,
 padding: space.md,
 flexDirection: "row",
 alignItems: "center",
 gap: space.md,
 borderLeftWidth: 4,
 borderLeftColor: method.color,
 }}
 >
 <Ionicons name={method.icon as any} size={20} color={method.color} />
 <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, flex: 1 }}>
 {method.label}
 </Text>
 <Ionicons name="chevron-forward" size={20} color={colors.muted} />
 </Pressable>
 ))}
 </View>
 </View>
 </View>
 </ScrollView>
 );
}
