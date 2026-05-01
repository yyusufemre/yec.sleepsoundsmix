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
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const hide = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [opacity, translateY, onHide]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
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
  }, [visible, duration, hide, opacity, translateY]);

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
    bottom: 100, // Above the tab bar
    left: layout.spacing.xl,
    right: layout.spacing.xl,
    zIndex: 9999,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    borderRadius: layout.radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  text: {
    color: colors.text.primary,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
});

export default GlassToast;
