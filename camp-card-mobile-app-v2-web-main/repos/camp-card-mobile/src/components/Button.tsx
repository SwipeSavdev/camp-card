import React from 'react';
import { ActivityIndicator, Pressable, Text, ViewStyle } from 'react-native';

import { colors, radius, space } from '../theme';

type Props = {
 label: string;
 onPress: () => void;
 variant?: 'primary' | 'secondary';
 loading?: boolean;
 disabled?: boolean;
 style?: ViewStyle;
};

export default function Button({
 label,
 onPress,
 variant = 'primary',
 loading = false,
 disabled = false,
 style,
}: Props) {
 const isPrimary = variant === 'primary';
 const bg = isPrimary ? colors.red500 : colors.white;
 const borderColor = isPrimary ? colors.red500 : colors.gray200;
 const textColor = isPrimary ? colors.white : colors.text;

 return (
 <Pressable
 onPress={onPress}
 disabled={disabled || loading}
 style={({ pressed }) => [
 {
 paddingVertical: 14,
 paddingHorizontal: space.md,
 borderRadius: radius.button,
 backgroundColor: bg,
 borderWidth: 1,
 borderColor,
 alignItems: 'center',
 justifyContent: 'center',
 opacity: disabled || loading ? 0.65 : pressed ? 0.9 : 1,
 },
 style,
 ]}
 >
 {loading ? (
 <ActivityIndicator color={textColor} />
 ) : (
 <Text style={{ color: textColor, fontWeight: '800' }}>{label}</Text>
 )}
 </Pressable>
 );
}
