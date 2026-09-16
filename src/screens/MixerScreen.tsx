import { spacing, fontSize, fontFamily } from '../theme/tokens';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AppScreen, { ScreenScrollView } from '../layout/AppScreen';
import MixerItem from '../components/MixerItem';
import useMixerStore from '../store/useMixerStore';
import HeaderComponent from '../components/HeaderComponent';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import ActionButton from '../components/ActionButton';
import SaveMixForm from '../components/SaveMixForm';
import SavedMixRow from '../components/SavedMixRow';
import EmptyState from '../components/EmptyState';
import IconButton from '../components/IconButton';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import BannerAdView from '../components/BannerAdView';
import { useTranslation } from 'react-i18next';
import { getLocalizedSoundTitle } from '../utils/soundUtils';
import { useNetInfo } from '@react-native-community/netinfo';
import RewardedAdManager from '../services/RewardedAdManager';
import GlassToast from '../components/GlassToast';

const MixerScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const activeSounds = useMixerStore((state: any) => state.activeSounds) || {};
  const toggleSound = useMixerStore((state: any) => state.toggleSound);
  const clearMix = useMixerStore((state: any) => state.clearMix);
  const setVolume = useMixerStore((state: any) => state.setVolume);
  const savedMixes = useMixerStore((state: any) => state.savedMixes) || [];
  const saveMix = useMixerStore((state: any) => state.saveMix);
  const loadMix = useMixerStore((state: any) => state.loadMix);
  const deleteSavedMix = useMixerStore((state: any) => state.deleteSavedMix);
  const activePresetId = useMixerStore((state: any) => state.activePresetId);
  const activeMixId = useMixerStore((state: any) => state.activeMixId);
  const sounds = useMixerStore((state: any) => state.sounds) || [];
  const metronomBpm = useMixerStore(
    (state: any) => state.metronomBpm,
  ) as number;
  const setMetronomBpm = useMixerStore((state: any) => state.setMetronomBpm);
  const isSoundAccessible = useMixerStore(
    (state: any) => state.isSoundAccessible,
  );
  const grantMultipleAdAccess = useMixerStore(
    (state: any) => state.grantMultipleAdAccess,
  );

  const [mixName, setMixName] = useState('');
  const [loadingAdMixId, setLoadingAdMixId] = useState<string | null>(null);
  const [showNetworkToast, setShowNetworkToast] = useState(false);
  const { isConnected } = useNetInfo();

  const activeSoundItems = (sounds || []).filter(
    (s: any) => activeSounds[s.id] !== undefined,
  );

  const handleSave = () => {
    // If mixName is empty, the store will handle the default name using the i18n key
    const success = saveMix(mixName);
    if (success) {
      setMixName('');
      Alert.alert(t('common.success'), t('mixer.mix_saved_success'));
    }
  };

  const handleLoadMix = async (id: string) => {
    const mix = savedMixes.find((m: any) => m.id === id);
    if (!mix) return;

    // Find locked and currently inaccessible sounds in the mix
    const inaccessibleIds: string[] = [];

    const checkSoundAccess = (soundId: string) => {
      if (!isSoundAccessible(soundId)) {
        inaccessibleIds.push(soundId);
      }
    };

    if (Array.isArray(mix.sounds)) {
      mix.sounds.forEach((s: any) => checkSoundAccess(s.id));
    } else if (mix.sounds && typeof mix.sounds === 'object') {
      Object.keys(mix.sounds).forEach(checkSoundAccess);
    }

    if (inaccessibleIds.length > 0) {
      if (isConnected === false) {
        setShowNetworkToast(true);
        return;
      }

      if (loadingAdMixId) return;
      setLoadingAdMixId(id);

      try {
        const isReady =
          RewardedAdManager.isReady() ||
          (await RewardedAdManager.waitUntilReady());
        if (!isReady) {
          if (RewardedAdManager.getLastError()) {
            Alert.alert(t('common.error'), t('library.ad_error_msg'));
            return;
          }
          Alert.alert(
            t('library.ad_not_ready_title'),
            t('library.ad_not_ready_msg'),
          );
          return;
        }

        await RewardedAdManager.show(() => {
          grantMultipleAdAccess(inaccessibleIds);
          loadMix(id);
        });
      } catch (error) {
        console.log('[AdMob] Show error while loading mix:', error);
        Alert.alert(t('common.error'), t('library.ad_error_msg'));
      } finally {
        setLoadingAdMixId(null);
      }
      return;
    }

    loadMix(id);
  };

  let displayName = null;
  if (activePresetId) {
    displayName = t(`presets.items.${activePresetId}.title`);
  } else if (activeMixId) {
    const mix = savedMixes.find((m: any) => m.id === activeMixId);
    if (mix) displayName = mix.name;
  }

  return (
    <AppScreen>
      <ScreenScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderComponent
          inset={false}
          title={
            activeSoundItems.length > 0
              ? t('mixer.header_title_active')
              : t('mixer.header_title_empty')
          }
          subtitle={
            activeSoundItems.length > 0
              ? t('mixer.header_subtitle_active')
              : t('mixer.header_subtitle_empty')
          }
        />

        {activeSoundItems.length > 0 ? (
          <>
            {displayName && (
              <View style={styles.presetBadge}>
                <Icon
                  name="wand-magic-sparkles"
                  size={12}
                  color={colors.accent.primary}
                  solid
                />
                <Text style={styles.presetNameText}>
                  {t('mixer.mix_badge', { name: displayName })}
                </Text>
              </View>
            )}

            {/* Active sound list */}
            <View style={styles.listContainer}>
              {activeSoundItems.map((sound: any) => (
                <MixerItem
                  key={sound.id}
                  id={sound.id}
                  title={getLocalizedSoundTitle(sound, i18n.language, t)}
                  iconName={sound.icon}
                  volume={activeSounds[sound.id]}
                  onVolumeChange={(val: number) => setVolume(sound.id, val)}
                  onRemove={() => toggleSound(sound.id)}
                  isMetronome={!!sound.isMetronome}
                  bpm={sound.isMetronome ? metronomBpm : undefined}
                  onBpmChange={sound.isMetronome ? setMetronomBpm : undefined}
                />
              ))}
            </View>

            <SaveMixForm
              value={mixName}
              onChangeText={setMixName}
              onSave={handleSave}
            />
            <View style={styles.addMoreSection}>
              <IconButton
                name="plus"
                size="large"
                variant="solid"
                accessibilityLabel={t('mixer.add_sounds_msg')}
                onPress={() => navigation.navigate('Library' as never)}
              />
            </View>
            {/* Clear all */}
            <ActionButton
              title={t('mixer.clear_all', { count: activeSoundItems.length })}
              icon="trash-can"
              onPress={clearMix}
              style={styles.clearAllButton}
            />
          </>
        ) : (
          <EmptyState
            icon="sliders"
            actionLabel={t('mixer.add_sounds_msg')}
            onAction={() => navigation.navigate('Library' as never)}
          />
        )}

        {/* Saved Mixes — always visible if any */}
        {savedMixes.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>{t('mixer.saved_mixes')}</Text>
            {savedMixes.map((mix: any) => (
              <SavedMixRow
                key={mix.id}
                name={mix.name}
                count={
                  Array.isArray(mix.sounds)
                    ? mix.sounds.length
                    : Object.keys(mix.sounds || {}).length
                }
                loading={loadingAdMixId === mix.id}
                disabled={loadingAdMixId !== null}
                onPlay={() => handleLoadMix(mix.id)}
                onDelete={() => deleteSavedMix(mix.id)}
              />
            ))}
          </View>
        )}
        <BannerAdView />
      </ScreenScrollView>
      <GlassToast
        visible={showNetworkToast}
        message={t('common.network_error')}
        type="error"
        onHide={() => setShowNetworkToast(false)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  presetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(145, 178, 223, 0.1)',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: 'rgba(145, 178, 223, 0.2)',
    marginBottom: spacing.md,
  },
  presetNameText: {
    color: colors.accent.primary,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.semiBold,
  },
  listContainer: {
    gap: spacing.lg,
    marginTop: 10,
    marginBottom: spacing.xl,
  },
  addMoreSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  clearAllButton: {
    marginTop: spacing.sm,
  },
  savedSection: {
    marginTop: spacing.xxxl,
    gap: layout.spacing.sm,
  },
  savedTitle: {
    color: colors.text.secondary,
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    letterSpacing: 0.8,
    textTransform: 'capitalize',
    marginBottom: layout.spacing.sm,
  },
});

export default MixerScreen;
