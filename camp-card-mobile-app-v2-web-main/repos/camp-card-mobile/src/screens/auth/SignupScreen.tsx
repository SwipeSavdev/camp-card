import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors, radius, space } from '../../theme';
import { useAuthStore } from '../../store/authStore';

type Props = {
 navigation: any;
};

export default function SignupScreen({ navigation }: Props) {
 const { signup, error } = useAuthStore();
 const [fullName, setFullName] = React.useState('');
 const [email, setEmail] = React.useState('');
 const [password, setPassword] = React.useState('');
 const [invitationCode, setInvitationCode] = React.useState('');
 const [loading, setLoading] = React.useState(false);
 const [localError, setLocalError] = React.useState<string | null>(null);

 const onSubmit = async () => {
 setLocalError(null);

 if (fullName.trim().length < 2) {
 setLocalError('Please enter your full name.');
 return;
 }
 if (!email.trim().includes('@')) {
 setLocalError('Please enter a valid email address.');
 return;
 }
 if (password.length < 8) {
 setLocalError('Password must be at least 8 characters.');
 return;
 }

 setLoading(true);
 try {
 await signup({
 fullName: fullName.trim(),
 email: email.trim(),
 password,
 invitationCode: invitationCode.trim() || undefined,
 });
 } catch {
 // store.error will render
 } finally {
 setLoading(false);
 }
 };

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ flex: 1, padding: space.lg }}>
 <View style={{ marginBottom: space.lg }}>
 <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>Create account</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 Your role and council tenant are assigned based on your account.
 </Text>
 </View>

 <View
 style={{
 backgroundColor: colors.white,
 borderRadius: radius.card,
 padding: space.lg,
 borderWidth: 1,
 borderColor: colors.gray200,
 }}
 >
 <Input label="Full name" placeholder="Alex Johnson" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
 <Input
 label="Email"
 placeholder="you@example.com"
 value={email}
 onChangeText={setEmail}
 keyboardType="email-address"
 autoCapitalize="none"
 />
 <Input
 label="Password"
 placeholder="At least 8 characters"
 value={password}
 onChangeText={setPassword}
 secureTextEntry
 />
 <Input
 label="Invitation / Referral code (optional)"
 placeholder="SCOUT-A3F9X2"
 value={invitationCode}
 onChangeText={setInvitationCode}
 autoCapitalize="characters"
 />

 {(localError || error) ? (
 <Text style={{ marginTop: space.sm, color: colors.red500, fontWeight: '700' }}>
 {localError || error}
 </Text>
 ) : null}

 <View style={{ marginTop: space.lg }}>
 <Button label="Create account" onPress={onSubmit} loading={loading} />
 </View>

 <View style={{ marginTop: space.md }}>
 <Button
 label="Back to sign in"
 onPress={() => navigation.goBack()}
 variant="secondary"
 />
 </View>
 </View>
 </View>
 </SafeAreaView>
 );
}
