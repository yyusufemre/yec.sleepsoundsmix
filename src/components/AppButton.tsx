import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AppText from './AppText';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
export type AppButtonSize = 'large' | 'medium' | 'small';

interface AppButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  size = 'large',
  icon,
  iconPosition = 'left',
  style,
  fullWidth = true,
  disabled,
  children,
  ...props
}) => {
  const getContainerStyles = () => {
    let height = 64;
    let padding = layout.padding.button;

    switch (size) {
      case 'small':
        height = 40;
        padding = layout.padding.buttonSmall;
        break;
      case 'medium':
        height = 48;
        padding = layout.padding.button;
        break;
      case 'large':
      default:
        height = 64;
        break;
    }

    return [
      styles.baseContainer,
      { height, paddingHorizontal: padding },
      fullWidth && styles.fullWidth,
    ];
  };

  const getBackgroundContent = (innerContent: React.ReactNode) => {
    switch (variant) {
      case 'gradient':
        return (
          <LinearGradient
            colors={colors.accent.orangeGradient} // Common gradient for main call to actions
            style={[...getContainerStyles(), disabled && styles.disabled]}
          >
            {innerContent}
          </LinearGradient>
        );
      case 'ghost':
        return (
          <View style={[...getContainerStyles(), styles.ghost, disabled && styles.disabled]}>
            {innerContent}
          </View>
        );
      case 'danger':
        return (
          <View style={[...getContainerStyles(), { backgroundColor: colors.accent.danger }, disabled && styles.disabled]}>
            {innerContent}
          </View>
        );
      case 'secondary':
        return (
          <View style={[...getContainerStyles(), styles.secondary, disabled && styles.disabled]}>
            {innerContent}
          </View>
        );
      case 'primary':
      default:
        return (
          <View style={[...getContainerStyles(), { backgroundColor: colors.accent.success }, disabled && styles.disabled]}>
            {innerContent}
          </View>
        );
    }
  };

  const getTextColor = () => {
    if (disabled) return 'secondary';
    if (variant === 'ghost' || variant === 'secondary') return 'primary';
    return 'primary'; // All solid buttons use primary (white) text
  };
  
  const actualTextColor = getTextColor();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[fullWidth ? styles.fullWidth : undefined, style]}
      disabled={disabled}
      {...props}
    >
      {getBackgroundContent(
        <View style={styles.content}>
          {children ? (
            children
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <Icon name={icon} size={size === 'small' ? 14 : 18} color={colors.text[actualTextColor as keyof typeof colors.text]} solid />
              )}
              {title && (
                <AppText
                  variant={size === 'small' ? 'small' : 'large'}
                  weight="bold"
                  color={actualTextColor}
                >
                  {title}
                </AppText>
              )}
              {icon && iconPosition === 'right' && (
                <Icon name={icon} size={size === 'small' ? 14 : 18} color={colors.text[actualTextColor as keyof typeof colors.text]} solid />
              )}
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  baseContainer: {
    borderRadius: layout.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.sm,
  },
  secondary: {
    backgroundColor: colors.glass.buttonSecondary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AppButton;
