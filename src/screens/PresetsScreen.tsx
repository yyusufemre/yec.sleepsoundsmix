import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import AppScreen, { ScreenScrollView } from '../layout/AppScreen';
import HeaderComponent from '../components/HeaderComponent';
import SavedMixRow from '../components/SavedMixRow';
import PresetCard from '../components/PresetCard';
import useMixerStore from '../store/useMixerStore';
import { spacing } from '../theme/tokens';
import AppText from '../components/AppText';
import BannerAdView from '../components/BannerAdView';
import { useNetInfo } from '@react-native-community/netinfo';
import GlassToast from '../components/GlassToast';
import RewardedAdManager from '../services/RewardedAdManager';
import { useTranslation } from 'react-i18next';

const EXAMPLES = [
  {
    id: 'p1',
    title: 'Yağmurlu Gece',
    description:
      'Yumuşak yağmur ve hafif rüzgarın kusursuz uyumuyla derin bir uykuya hazırlanın.',
    iconName: 'cloud-showers-heavy',
    isAd: false,
    sounds: { 'yagmur-sesi-1': 0.62, 'firtina-sesi-1': 0.28, 'fan-sesi': 0.18 },
  },
  {
    id: 'p2',
    title: 'Sahil Uykusu',
    description:
      'Kıyıya vuran huzurlu dalgalar ve uzaklardan gelen sakin melodiler.',
    iconName: 'water',
    isAd: true,
    sounds: {
      'deniz-sesi-1': 0.68,
      'hafif-muzik': 0.22,
      'firtina-sesi-1': 0.16,
    },
  },
  {
    id: 'p3',
    title: 'Kamp Ateşi',
    description:
      'Çatırdayan ateş ve doğanın gece sesleriyle sıcak bir atmosfer.',
    iconName: 'fire',
    isAd: false,
    sounds: { 'ates-sesi-1': 0.64, 'firtina-sesi-1': 0.22, 'kus-sesi-1': 0.12 },
  },
  {
    id: 'p4',
    title: 'Derin Orman',
    description:
      'Gürül gürül akan bir dere ve orman sakinlerinin huzur veren fısıltıları.',
    iconName: 'tree',
    isAd: true,
    sounds: {
      'orman-sesi': 0.58,
      'dere-kenari': 0.34,
      'bulbul-sesi-1': 0.18,
      'cekirge-sesi-1': 0.14,
    },
  },
  {
    id: 'p5',
    title: 'Cam Kenarında Yağmur',
    description:
      'Cama vuran yağmur damlaları ve uzaktan gelen piyano eşliğinde premium uyku.',
    iconName: 'umbrella',
    isAd: true,
    sounds: {
      'yagmur-sesi-2': 0.66,
      'gok-gurultusu-sesi-2': 0.2,
      'fan-sesi': 0.16,
      'hafif-piyano-muzik': 0.12,
    },
  },
  {
    id: 'p6',
    title: 'Okyanus Derinliği',
    description:
      'Okyanusun derinlerinden gelen ambient seslerle meditasyon ve uyku arası bir yolculuk.',
    iconName: 'fish',
    isAd: true,
    sounds: {
      'deniz-alti-sesi': 0.56,
      'okyanus-sesi': 0.32,
      'ambiyans-music': 0.18,
      'derin-dusunce-ses': 0.14,
    },
  },
  {
    id: 'p7',
    title: 'Lo-Fi Odak',
    description:
      'Bir kafede çalışıyormuş gibi hissetmenizi sağlayacak lo-fi ritimler ve arka plan gürültüsü.',
    iconName: 'mug-hot',
    isAd: true,
    sounds: {
      'lo-fi-sabah-muzik': 0.46,
      'cafe-ambiyansi': 0.24,
      'fan-sesi': 0.12,
    },
  },
  {
    id: 'p8',
    title: 'Kış Sessizliği',
    description:
      'Karda yürürken duyulan o eşsiz sessizlik ve derin soğuk esintinin karakteri.',
    iconName: 'snowflake',
    isAd: true,
    sounds: {
      'karda-yuruyus': 0.52,
      'firtina-sesi-1': 0.24,
      'derin-dusunce-ses': 0.16,
      'fan-sesi': 0.1,
    },
  },
  {
    id: 'p9',
    title: 'Şömine Akşamı',
    description: 'Şömine ateşi, hafif rüzgar ve sıcak bir gece atmosferi.',
    iconName: 'fire-flame-curved',
    isAd: true,
    sounds: { 'somine-atesi': 0.62, 'firtina-sesi-1': 0.18, 'fan-sesi': 0.1 },
  },
  {
    id: 'p10',
    title: 'Orman Sabahı',
    description:
      'Orman dokusu, hafif akan dere ve doğal sabah sesleriyle ferah bir başlangıç.',
    iconName: 'leaf',
    isAd: true,
    sounds: { 'orman-kuslari': 0.52, 'orman-sesi': 0.3, 'dere-kenari': 0.18 },
  },
];
const PresetsScreen = () => {
  const { t } = useTranslation();
  const savedMixes = useMixerStore((state: any) => state.savedMixes);
  const loadMix = useMixerStore((state: any) => state.loadMix);
  const deleteSavedMix = useMixerStore((state: any) => state.deleteSavedMix);
  const applyPreset = useMixerStore((state: any) => state.applyPreset);
  const grantMultipleAdAccess = useMixerStore(
    (state: any) => state.grantMultipleAdAccess,
  );
  const isSoundAccessible = useMixerStore(
    (state: any) => state.isSoundAccessible,
  );
  const activePresetId = useMixerStore((state: any) => state.activePresetId);
  const activeSounds = useMixerStore((state: any) => state.activeSounds) || {};
  const isPausedBySystem = useMixerStore(
    (state: any) => state.isPausedBySystem,
  );
  const setSystemPaused = useMixerStore((state: any) => state.setSystemPaused);

  const [loadingAdPresetId, setLoadingAdPresetId] = useState<string | null>(
    null,
  );
  const [loadingAdMixId, setLoadingAdMixId] = useState<string | null>(null);
  const [showNetworkToast, setShowNetworkToast] = useState(false);
  const { isConnected } = useNetInfo();

  const handlePresetPress = async (item: any) => {
    // If already active, toggle pause
    if (activePresetId === item.id) {
      setSystemPaused(!isPausedBySystem);
      return;
    }

    if (item.isAd) {
      if (isConnected === false) {
        setShowNetworkToast(true);
        return;
      }

      // Check if any sound in preset is actually locked
      const someLocked = Object.keys(item.sounds).some(
        id => !isSoundAccessible(id),
      );

      if (someLocked) {
        if (loadingAdPresetId) return;

        setLoadingAdPresetId(item.id);
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
            const soundIds = Object.keys(item.sounds);
            grantMultipleAdAccess(soundIds);
            applyPreset(item.sounds, item.id);
          });
        } catch (error) {
          console.log('[AdMob] Show error:', error);
          Alert.alert(t('common.error'), t('library.ad_error_msg'));
        } finally {
          setLoadingAdPresetId(null);
        }
        return;
      }
    }

    // Free or already unlocked
    applyPreset(item.sounds, item.id);
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
        console.log(
          '[AdMob] Show error while loading mix from Presets:',
          error,
        );
        Alert.alert(t('common.error'), t('library.ad_error_msg'));
      } finally {
        setLoadingAdMixId(null);
      }
      return;
    }

    loadMix(id);
  };

  const handleLongPress = (id: string, name: string) => {
    Alert.alert(
      t('presets.delete_mix_title'),
      t('presets.delete_mix_msg', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteSavedMix(id),
        },
      ],
    );
  };

  const getSoundCount = (mix: any) => {
    if (!mix.sounds) return 0;
    if (Array.isArray(mix.sounds)) return mix.sounds.length;
    return Object.keys(mix.sounds).length;
  };

  return (
    <AppScreen>
      <ScreenScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderComponent
          inset={false}
          title={t('presets.header_title')}
          subtitle={t('presets.header_subtitle')}
        />

        {savedMixes.length > 0 && (
          <View style={styles.section}>
            <AppText variant="h3" color="primary" style={styles.sectionTitle}>
              {t('presets.your_mixes')}
            </AppText>
            {savedMixes.map((mix: any) => (
              <SavedMixRow
                key={mix.id}
                name={mix.name}
                count={getSoundCount(mix)}
                loading={loadingAdMixId === mix.id}
                disabled={loadingAdMixId !== null}
                onPlay={() => handleLoadMix(mix.id)}
                onDelete={() => handleLongPress(mix.id, mix.name)}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <AppText variant="h3" color="primary" style={styles.sectionTitle}>
            {t('presets.recommended')}
          </AppText>
          {EXAMPLES.map(item => {
            const isAccessible =
              !item.isAd ||
              Object.keys(item.sounds).every(id => isSoundAccessible(id));

            return (
              <PresetCard
                key={item.id}
                title={t(`presets.items.${item.id}.title`)}
                description={t(`presets.items.${item.id}.description`)}
                iconName={item.iconName}
                isAd={item.isAd}
                isActive={
                  activePresetId === item.id &&
                  !isPausedBySystem &&
                  Object.keys(activeSounds).length > 0
                }
                isAccessible={isAccessible}
                isLoading={loadingAdPresetId === item.id}
                onPress={() => handlePresetPress(item)}
              />
            );
          })}
        </View>
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
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  scrollContent: {},
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
});

export default PresetsScreen;
