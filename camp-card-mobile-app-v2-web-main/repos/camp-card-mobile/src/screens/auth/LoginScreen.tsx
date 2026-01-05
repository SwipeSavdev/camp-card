import React from 'react';
import { Image, SafeAreaView, Text, View } from 'react-native';

import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors, images, radius, space } from '../../theme';
import { useAuthStore } from '../../store/authStore';

type Props = {
 navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
 const { login, error } = useAuthStore();
 const [email, setEmail] = React.useState('');
 const [password, setPassword] = React.useState('');
 const [loading, setLoading] = React.useState(false);
 const [localError, setLocalError] = React.useState<string | null>(null);

 const onSubmit = async () => {
 setLocalError(null);
 const trimmed = email.trim();

 if (!trimmed.includes('@')) {
 setLocalError('Please enter a valid email address.');
 return;
 }
 if (password.length < 1) {
 setLocalError('Please enter your password.');
 return;
 }

 setLoading(true);
 try {
 await login({ email: trimmed, password });
 } catch {
 // store.error will render
 } finally {
 setLoading(false);
 }
 };

 return (
 <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray50 }}>
 <View style={{ flex: 1, padding: space.lg }}>
 <View
 style={{
 alignItems: 'center',
 paddingVertical: space.xl,
 }}
 >
 <Image
 source={images.councilLogo}
 style={{ width: 88, height: 88, borderRadius: 44, marginBottom: space.md }}
 />
 <Image
 source={images.campCardLockup}
 style={{ width: 220, height: 54, resizeMode: 'contain' }}
 />
 <Text style={{ marginTop: 10, color: colors.muted, textAlign: 'center' }}>
 Sign in to access your Camp Card offers and fundraising dashboard.
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
 placeholder=""
 value={password}
 onChangeText={setPassword}
 secureTextEntry
 />

 {(localError || error) ? (
 <Text style={{ marginTop: space.sm, color: colors.red500, fontWeight: '700' }}>
 {localError || error}
 </Text>
 ) : null}

 <View style={{ marginTop: space.lg }}>
 <Button label="Sign in" onPress={onSubmit} loading={loading} />
 </View>

 <View style={{ marginTop: space.md }}>
 <Button
 label="Create account"
 onPress={() => navigation.navigate('Signup')}
 variant="secondary"
 />
 </View>

 <Text style={{ marginTop: space.md, color: colors.muted, fontSize: 12, textAlign: 'center' }}>
 Tip: In mock mode, use emails like{' '}
 <Text style={{ fontWeight: '800', color: colors.text }}>leader@example.com</Text> or{' '}
 <Text style={{ fontWeight: '800', color: colors.text }}>scout@example.com</Text>
 {' '}to preview role-based UI.
 </Text>
 </View>
 </View>
 </SafeAreaView>
 );
}
