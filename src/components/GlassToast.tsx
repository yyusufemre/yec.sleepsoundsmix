import useReducedMotion from '../hooks/useReducedMotion';
import {component, spacing, fontSize, fontFamily} from '../theme/tokens';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import GlassBlur from './GlassBlur';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

interface GlassToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number;
  type?: 'error' | 'success' | 'info';
}

const GlassToast: React.FC<GlassToastProps> = ({
  visible,
  message,
  onHide,
  duration = 3000,
  type = 'info'
}) => {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const hide = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: reducedMotion ? 0 : 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: reducedMotion ? 0 : 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [opacity, translateY, onHide, reducedMotion]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: reducedMotion ? 0 : 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: reducedMotion ? 0 : 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible, duration, hide, opacity, translateY, reducedMotion]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error': return 'circle-exclamation';
      case 'success': return 'circle-check';
      default: return 'circle-info';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error': return colors.accent.danger;
      case 'success': return colors.accent.success;
      default: return colors.accent.primary;
    }
  };

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] }
      ]}
    >
      <View style={styles.content}>
        <GlassBlur
          style={StyleSheet.absoluteFill}
          blurAmount={12}
          fallbackColor="rgba(25,32,43,0.9)"
        />
        <View style={styles.inner}>
          <Icon name={getIcon()} size={16} color={getIconColor()} solid />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: layout.spacing.lg, // The scene already ends above the complete bottom dock
    left: layout.spacing.xl,
    right: layout.spacing.xl,
    zIndex: 9999,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: component.modalMaxWidth,
    borderRadius: layout.radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  text: {
    color: colors.text.primary,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.medium,
    flex: 1,
  },
});

export default GlassToast;
