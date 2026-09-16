import useReducedMotion from '../hooks/useReducedMotion';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, fontSize, fontFamily } from '../theme/tokens';

interface ModeSwitcherProps {
  activeMode: 'nature' | 'music' | 'ambience';
  onModeChange: (mode: 'nature' | 'music' | 'ambience') => void;
}

const ModeSwitcherComponent: React.FC<ModeSwitcherProps> = ({
  activeMode,
  onModeChange,
}) => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const tabWidth = Math.max(
    0,
    (width - spacing.sm * 2 - 2 - spacing.sm * 2) / 3,
  );
  const getIndex = (mode: string) => {
    if (mode === 'nature') return 0;
    if (mode === 'music') return 1;
    return 2;
  };

  const slideAnim = useRef(new Animated.Value(getIndex(activeMode))).current;

  useEffect(() => {
    if (reducedMotion) {
      slideAnim.setValue(getIndex(activeMode));
      return;
    }
    Animated.spring(slideAnim, {
      toValue: getIndex(activeMode),
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, reducedMotion]); // slideAnim is a stable Animated.Value ref, safe to omit

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth + spacing.sm, (tabWidth + spacing.sm) * 2],
  });

  const backgroundColor = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      'rgba(50, 239, 120, 0.25)', // Nature - Greenish
      'rgba(52, 113, 236, 0.25)', // Music - Bluish
      'rgba(236, 52, 113, 0.25)', // Ambience - Pinkish
    ],
  });

  return (
    <View
      style={styles.container}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.indicator,
          { width: tabWidth },
          {
            transform: [{ translateX }],
            backgroundColor,
          },
        ]}
      />

      <TouchableOpacity
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeMode === 'nature' }}
        onPress={() => onModeChange('nature')}
        activeOpacity={0.8}
      >
        <Icon
          name="leaf"
          size={20}
          color={activeMode === 'nature' ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
          solid
        />
        <Text
          style={[styles.title, activeMode !== 'nature' && styles.inactiveText]}
        >
          {t('library.categories.nature')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeMode === 'music' }}
        onPress={() => onModeChange('music')}
        activeOpacity={0.8}
      >
        <Icon
          name="music"
          size={20}
          color={activeMode === 'music' ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
          solid
        />
        <Text
          style={[styles.title, activeMode !== 'music' && styles.inactiveText]}
        >
          {t('library.categories.music')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeMode === 'ambience' }}
        onPress={() => onModeChange('ambience')}
        activeOpacity={0.8}
      >
        <Icon
          name="couch"
          size={20}
          color={
            activeMode === 'ambience' ? '#FFFFFF' : 'rgba(255,255,255,0.4)'
          }
          solid
        />
        <Text
          style={[
            styles.title,
            activeMode !== 'ambience' && styles.inactiveText,
          ]}
        >
          {t('library.categories.ambience')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.xxl,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  indicator: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: radius.lg,
    bottom: spacing.sm,
  },
  tab: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    color: colors.text.primary,
    fontSize: fontSize.small,
    fontFamily: fontFamily.bold,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },
  inactiveText: {
    opacity: 0.6,
  },
});

export default ModeSwitcherComponent;
