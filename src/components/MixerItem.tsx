import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import IconButton from './IconButton';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import AppText from './AppText';
import GlassCard from './GlassCard';
import { colors } from '../theme/colors';
import { spacing, radius, fontFamily, fontSize } from '../theme/spacing';
import { layout } from '../theme/layout';
import NativeSoundManager from '../services/NativeSoundManager';

interface MixerItemProps {
  id: string;
  title: string;
  iconName: string;
  volume: number;
  onVolumeChange: (val: number) => void;
  onRemove: () => void;
  // Metronome-specific
  isMetronome?: boolean;
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
}

const MixerItem: React.FC<MixerItemProps> = React.memo(
  ({
    id,
    title,
    iconName,
    volume,
    onVolumeChange,
    onRemove,
    isMetronome = false,
    bpm = 60,
    onBpmChange,
  }) => {
    const { t } = useTranslation();
    const [localVolume, setLocalVolume] = useState(volume);
    const [localBpm, setLocalBpm] = useState(bpm);
    const [lastVolume, setLastVolume] = useState(50);
    const isSliding = useRef(false);
    const isBpmSliding = useRef(false);

    useEffect(() => {
      if (!isSliding.current) {
        setLocalVolume(volume);
      }
    }, [volume]);

    useEffect(() => {
      if (!isBpmSliding.current) {
        setLocalBpm(bpm);
      }
    }, [bpm]);

    const updateVolume = (val: number) => {
      setLocalVolume(val);
      // Only call NativeSoundManager for real audio (not metronome — MetronomeService handles it)
      if (!isMetronome) {
        NativeSoundManager.setVolume(id, val / 100);
      }
    };

    const handleMuteToggle = () => {
      if (localVolume > 0) {
        setLastVolume(localVolume);
        updateVolume(0);
        onVolumeChange(0);
      } else {
        const target = lastVolume || 50;
        updateVolume(target);
        onVolumeChange(target);
      }
    };

    const handleValueChange = (val: number) => {
      isSliding.current = true;
      updateVolume(val);
    };

    const handleSlidingComplete = (val: number) => {
      isSliding.current = false;
      onVolumeChange(val);
    };

    const handleBpmChange = (val: number) => {
      const roundedValue = Math.round(val);
      isBpmSliding.current = true;
      setLocalBpm(roundedValue);
      onBpmChange?.(roundedValue);
    };

    const handleBpmSlidingComplete = (val: number) => {
      isBpmSliding.current = false;
      onBpmChange?.(Math.round(val));
    };

    return (
      <GlassCard
        variant="normal"
        style={styles.card}
        contentStyle={styles.container}
      >
        {/* Top Row: Icon + Title + Delete */}
        <View style={styles.topRow}>
          <View style={styles.titleGroup}>
            <View style={styles.iconSlot}>
              <Icon
                name={iconName}
                size={18}
                color={
                  isMetronome ? colors.accent.success : colors.accent.primary
                }
                solid
                style={styles.mainIcon}
              />
            </View>
            <AppText variant="body" weight="semiBold" style={styles.title}>
              {title}
            </AppText>
          </View>

          <View style={styles.actionSlot}>
            <IconButton
              name="trash-can"
              size="small"
              style={styles.compactBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel={`${t('common.delete')}: ${title}`}
              onPress={onRemove}
            />
          </View>
        </View>

        {/* Volume Row */}
        <View style={styles.volumeRow}>
          <View style={styles.iconSlot}>
            <IconButton
              name={localVolume > 0 ? 'volume-low' : 'volume-xmark'}
              size="small"
              style={styles.compactBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              iconColor={
                localVolume > 0 ? colors.text.secondary : colors.accent.danger
              }
              accessibilityLabel={`${t('mixer.volume')}: ${title}`}
              accessibilityState={{ selected: localVolume === 0 }}
              onPress={handleMuteToggle}
            />
          </View>

          <View style={styles.sliderWrapper}>
            <Slider
              accessibilityLabel={`${t('mixer.volume')}: ${title}`}
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={localVolume}
              onValueChange={handleValueChange}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor="rgba(255,255,255,0.9)"
              maximumTrackTintColor="rgba(255,255,255,0.12)"
              thumbTintColor="#FFFFFF"
            />
          </View>

          <View style={styles.actionSlot}>
            <AppText variant="caption" color="muted" style={styles.percentage}>
              %{Math.round(localVolume)}
            </AppText>
          </View>
        </View>

        {/* BPM Row — only shown when this is the metronome card */}
        {isMetronome && (
          <View style={styles.bpmRow}>
            <View style={styles.iconSlot}>
              <Icon
                name="heart-pulse"
                size={13}
                color={colors.accent.success}
                solid
              />
            </View>

            <View style={styles.sliderWrapper}>
              <Slider
                accessibilityLabel={`BPM: ${title}`}
                style={styles.slider}
                minimumValue={20}
                maximumValue={180}
                step={1}
                value={localBpm}
                onValueChange={handleBpmChange}
                onSlidingComplete={handleBpmSlidingComplete}
                minimumTrackTintColor={colors.accent.success}
                maximumTrackTintColor="rgba(255,255,255,0.12)"
                thumbTintColor={colors.accent.success}
              />
            </View>

            <View style={styles.actionSlotBpm}>
              <AppText variant="caption" color="muted" style={styles.bpmLabel}>
                {localBpm} BPM
              </AppText>
            </View>
          </View>
        )}
      </GlassCard>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  container: {
    paddingHorizontal: layout.padding.card,
    paddingTop: 10,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    zIndex: 2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.xs,
  },
  iconSlot: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSlot: {
    width: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionSlotBpm: {
    minWidth: 54,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  compactBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainIcon: {
    textAlign: 'center',
  },
  title: {
    flexShrink: 1,
    fontSize: fontSize.medium,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    zIndex: 1,
  },
  sliderWrapper: {
    flex: 1,
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
    borderRadius: radius.sm,
    marginHorizontal: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 28,
  },
  percentage: {
    textAlign: 'right',
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
  },
  bpmLabel: {
    textAlign: 'right',
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
  },
});

export default MixerItem;
