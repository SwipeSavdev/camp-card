import React from 'react';
import { View, ViewProps } from 'react-native';

import { colors, radius, shadow, space } from '../theme';

type Props = ViewProps & {
 padded?: boolean;
};

export default function Card({ padded = true, style, ...rest }: Props) {
 return (
 <View
 {...rest}
 style={[
 {
 backgroundColor: colors.white,
 borderRadius: radius.card,
 borderWidth: 1,
 borderColor: colors.gray200,
 ...(shadow.card as any),
 padding: padded ? space.lg : 0,
 },
 style,
 ]}
 />
 );
}
