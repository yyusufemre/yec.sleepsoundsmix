import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import GlassBlur from './GlassBlur';
import AppText from './AppText';
import useMixerStore from '../store/useMixerStore';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

const MiniPlayer = () => {
  const navigation = useNavigation();
  const activeSounds = useMixerStore((state: any) => state.activeSounds) || {};
  const isPausedBySystem = useMixerStore(
    (state: any) => state.isPausedBySystem,
  );
  const setSystemPaused = useMixerStore((state: any) => state.setSystemPaused);

  const activeCount = Object.keys(activeSounds).length;

  if (activeCount === 0) return null;

  const togglePlayPause = () => {
    setSystemPaused(!isPausedBySystem);
  };

  const goToMixer = () => {
    navigation.navigate('Mixer' as never);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={goToMixer}>
        {({ pressed: isCardPressed }) => (
          <View style={[styles.cardContainer, isCardPressed && styles.cardPressed]}>
            <GlassBlur />
            <View style={[styles.content, styles.cardContent]}>
              <View style={styles.leftSection}>
                <Icon
                  name="sliders"
                  size={18}
                  color={colors.text.primary}
                  style={styles.icon}
                />
                <AppText variant="body" weight="medium">
                  {activeCount} ses aktif
                </AppText>
              </View>

              <View style={styles.rightSection}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPausedBySystem ? 'Sesleri oynat' : 'Sesleri duraklat'
                  }
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.playPauseButton,
                    pressed && styles.playPauseButtonPressed,
                  ]}
                  onPress={event => {
                    event.stopPropagation();
                    togglePlayPause();
                  }}
                >
                  <Icon
                    name={isPausedBySystem ? 'play' : 'pause'}
                    size={16}
                    color={colors.text.primary}
                  />
                </Pressable>
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
    position: 'absolute',
    bottom: 92,
    left: layout.spacing.lg,
    right: layout.spacing.lg,
    zIndex: 100,
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
  leftSection: {
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
    width: 40,
    height: 40,
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
