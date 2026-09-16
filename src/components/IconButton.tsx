import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { colors, component } from '../theme/tokens';

export type IconButtonVariant = 'ghost' | 'glass' | 'solid';
export type IconButtonSize = 'large' | 'medium' | 'small';

interface IconButtonProps extends TouchableOpacityProps {
  name: string;
  loading?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
}

const IconButton: React.FC<IconButtonProps> = ({
  name,
  variant = 'ghost',
  size = 'medium',
  iconColor = colors.text.primary,
  style,
  disabled,
  loading,
  accessibilityState,
  ...props
}) => {
  const getContainerSize = () => {
    switch (size) {
      case 'small':
        return component.touchTarget;
      case 'large':
        return component.iconButtonLarge;
      case 'medium':
      default:
        return component.touchTarget;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return component.iconSize.small;
      case 'large':
        return component.iconSize.large;
      case 'medium':
      default:
        return component.iconSize.medium;
    }
  };

  const getBackgroundStyle = () => {
    switch (variant) {
      case 'glass':
        return { backgroundColor: colors.glass.buttonSecondary };
      case 'solid':
        return { backgroundColor: colors.accent.primary };
      case 'ghost':
      default:
        return { backgroundColor: 'transparent' };
    }
  };

  const containerSize = getContainerSize();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
        },
        getBackgroundStyle(),
        disabled && styles.disabled,
        style,
      ]}
      accessibilityState={{
        ...accessibilityState,
        disabled: !!(disabled || loading),
        busy: !!loading,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <Icon
          name={name}
          size={getIconSize()}
          color={disabled ? colors.text.secondary : iconColor}
          solid
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;
