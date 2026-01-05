import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { colors, radius, space } from '../theme';

type Props = {
 label?: string;
 placeholder?: string;
 value: string;
 onChangeText: (t: string) => void;
 secureTextEntry?: boolean;
 keyboardType?: 'default' | 'email-address' | 'numeric';
 autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
 error?: string;
};

export default function Input({
 label,
 placeholder,
 value,
 onChangeText,
 secureTextEntry,
 keyboardType = 'default',
 autoCapitalize = 'none',
 error,
}: Props) {
 return (
 <View style={{ marginTop: space.sm }}>
 {label ? (
 <Text style={{ marginBottom: 6, fontWeight: '700', color: colors.text }}>{label}</Text>
 ) : null}
 <TextInput
 value={value}
 onChangeText={onChangeText}
 placeholder={placeholder}
 placeholderTextColor={colors.muted}
 secureTextEntry={secureTextEntry}
 keyboardType={keyboardType}
 autoCapitalize={autoCapitalize}
 autoCorrect={false}
 style={{
 borderWidth: 1,
 borderColor: error ? colors.red500 : colors.gray200,
 borderRadius: radius.button,
 paddingHorizontal: space.md,
 paddingVertical: 12,
 backgroundColor: colors.white,
 color: colors.text,
 }}
 />
 {error ? (
 <Text style={{ marginTop: 6, color: colors.red500, fontSize: 12, fontWeight: '700' }}>
 {error}
 </Text>
 ) : null}
 </View>
 );
}
