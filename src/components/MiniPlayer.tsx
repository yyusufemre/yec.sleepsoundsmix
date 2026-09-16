import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import GlassBlur from './GlassBlur';
import AppText from './AppText';
import IconButton from './IconButton';
import useMixerStore from '../store/useMixerStore';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { component, screen } from '../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const MiniPlayer = ({ onOpenMixer }: { onOpenMixer: () => void }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Use targeted selectors to avoid re-rendering on volume changes
  const activeCount = useMixerStore(
    (state: any) => Object.keys(state.activeSounds || {}).length,
  );
  const isPausedBySystem = useMixerStore(
    (state: any) => state.isPausedBySystem,
  );
  const setSystemPaused = useMixerStore((state: any) => state.setSystemPaused);

  if (activeCount === 0) return null;

  const togglePlayPause = () => {
    setSystemPaused(!isPausedBySystem);
  };

  const goToMixer = () => {
    onOpenMixer();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingLeft: insets.left + screen.paddingHorizontal,
          paddingRight: insets.right + screen.paddingHorizontal,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('navigation.mixer')}
        onPress={goToMixer}
      >
        {({ pressed: isCardPressed }) => (
          <View
            style={[styles.cardContainer, isCardPressed && styles.cardPressed]}
          >
            <GlassBlur />
            <View style={[styles.content, styles.cardContent]}>
              <View style={styles.leftSection}>
                <Icon
                  name="sliders"
                  size={18}
                  color={colors.text.primary}
                  style={styles.icon}
                />
                <AppText variant="body" weight="medium" style={styles.label}>
                  {t('mixer.active_count', { count: activeCount })}
                </AppText>
              </View>

              <View style={styles.rightSection}>
                <IconButton
                  name={isPausedBySystem ? 'play' : 'pause'}
                  variant="glass"
                  size="small"
                  accessibilityLabel={
                    isPausedBySystem ? t('mixer.play') : t('mixer.pause')
                  }
                  onPress={event => {
                    event.stopPropagation();
                    togglePlayPause();
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: screen.maxWidth,
    alignSelf: 'center',
    paddingVertical: layout.spacing.sm,
  },
  cardContainer: {
    borderRadius: layout.radius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardContent: {
    paddingVertical: layout.spacing.md,
    paddingHorizontal: layout.spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { flexShrink: 1 },
  leftSection: {
    flex: 1,
    marginRight: layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: layout.spacing.md,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseButton: {
    width: component.touchTarget,
    height: component.touchTarget,
    borderRadius: layout.radius.xl,
    backgroundColor: colors.glass.buttonSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
});

export default MiniPlayer;
