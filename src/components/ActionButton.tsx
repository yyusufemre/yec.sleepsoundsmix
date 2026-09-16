import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import AppButton from './AppButton';
import { colors } from '../theme/tokens';
interface Props {
  onPress: () => void;
  title: string;
  icon: string;
  type?: 'danger' | 'success' | 'warning';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
export default function ActionButton({ type = 'danger', ...props }: Props) {
  return (
    <AppButton
      {...props}
      variant="gradient"
      gradientColors={colors.action[type]}
      iconColor={colors.accent[type]}
    />
  );
}
