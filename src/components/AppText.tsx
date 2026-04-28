import React from 'react';
import { Text, TextProps } from 'react-native';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';

export type AppTextVariant = keyof typeof typography.size;
export type AppTextWeight = keyof typeof typography.family;
export type AppTextColor = keyof typeof colors.text;

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  weight?: AppTextWeight;
  color?: AppTextColor | string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  children: React.ReactNode;
}

const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}) => {
  const isThemeColor = color in colors.text;
  const textColor = isThemeColor ? colors.text[color as AppTextColor] : color;

  return (
    <Text
      style={[
        {
          fontFamily: typography.family[weight],
          fontSize: typography.size[variant],
          color: textColor,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AppText;
