import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TouchableOpacityProps } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { colors } from '../theme/colors';

export type IconButtonVariant = 'ghost' | 'glass' | 'solid';
export type IconButtonSize = 'large' | 'medium' | 'small';

interface IconButtonProps extends TouchableOpacityProps {
  name: string;
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
  ...props
}) => {
  const getContainerSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'large': return 56;
      case 'medium':
      default: return 44;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 28;
      case 'medium':
      default: return 24;
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
      activeOpacity={0.7}
      style={[
        styles.container,
        { width: containerSize, height: containerSize, borderRadius: containerSize / 2 },
        getBackgroundStyle(),
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Icon name={name} size={getIconSize()} color={disabled ? colors.text.secondary : iconColor} solid />
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
