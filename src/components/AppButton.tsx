import React from 'react';
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AppText from './AppText';
import { colors, component, spacing, radius } from '../theme/tokens';
export type AppButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'gradient';
export type AppButtonSize = 'large' | 'medium' | 'small';
interface Props extends TouchableOpacityProps {
  title?: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  children?: React.ReactNode;
  gradientColors?: string[];
  iconColor?: string;
  loading?: boolean;
}
export default function AppButton({
  title,
  variant = 'primary',
  size = 'large',
  icon,
  iconPosition = 'left',
  style,
  fullWidth = true,
  disabled,
  loading,
  children,
  gradientColors,
  iconColor,
  accessibilityState,
  ...props
}: Props) {
  const unavailable = disabled || loading;
  const textColor =
    variant === 'primary' ? colors.text.dark : colors.text.primary;
  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : icon && iconPosition === 'left' ? (
        <Icon
          name={icon}
          size={component.iconSize.small}
          color={iconColor || textColor}
          solid
        />
      ) : null}
      {children ||
        (title ? (
          <AppText
            variant={size === 'small' ? 'small' : 'body'}
            weight="bold"
            color={textColor}
            align="center"
            style={styles.label}
          >
            {title}
          </AppText>
        ) : null)}
      {!loading && icon && iconPosition === 'right' && (
        <Icon
          name={icon}
          size={component.iconSize.small}
          color={iconColor || textColor}
          solid
        />
      )}
    </View>
  );
  const surface = [
    styles.surface,
    {
      minHeight: Math.max(component.touchTarget, component.buttonHeight[size]),
    },
  ];
  const backgroundColor =
    variant === 'primary'
      ? colors.accent.success
      : variant === 'danger'
      ? colors.accent.danger
      : variant === 'secondary'
      ? colors.glass.buttonSecondary
      : 'transparent';
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled: !!unavailable,
        busy: !!loading,
      }}
      activeOpacity={0.75}
      {...props}
      disabled={unavailable}
      style={[
        fullWidth && styles.fullWidth,
        unavailable && styles.disabled,
        style,
      ]}
    >
      {variant === 'gradient' ? (
        <LinearGradient
          colors={gradientColors || colors.accent.orangeGradient}
          style={surface}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[surface, { backgroundColor }]}>{content}</View>
      )}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  surface: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    maxWidth: '100%',
  },
  label: { flexShrink: 1 },
  disabled: { opacity: 0.5 },
});
