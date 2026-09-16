import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, StatusBar, Alert, useWindowDimensions } from 'react-native';
import AppScreen from '../layout/AppScreen';
import SoundCard from '../components/SoundCard';
import HeaderComponent from '../components/HeaderComponent';
import ModeSwitcherComponent from '../components/ModeSwitcherComponent';
import useMixerStore from '../store/useMixerStore';
import EmptyState from '../components/EmptyState';
import { screen, spacing } from '../theme/spacing';
import { useNetInfo } from '@react-native-community/netinfo';
import GlassToast from '../components/GlassToast';
import BannerAdView from '../components/BannerAdView';
import RewardedAdManager from '../services/RewardedAdManager';
import { useTranslation } from 'react-i18next';
import { getLocalizedSoundTitle } from '../utils/soundUtils';

const LibraryScreen = () => {
  const { t, i18n } = useTranslation();
  const {fontScale, width} = useWindowDimensions();
  const columns = fontScale > 1.3 || width < 360 ? 1 : 2;
  const [tick, setTick] = useState(0);
  const activeSoundsRaw = useMixerStore((state: any) => state.activeSounds);
  const adAccessRaw = useMixerStore((state: any) => state.adAccess);
  const soundsRaw = useMixerStore((state: any) => state.sounds);
  // Stabilize with useMemo to avoid changing object references on every render
  const activeSounds = React.useMemo(
    () => activeSoundsRaw || {},
    [activeSoundsRaw],
  );
  const adAccess = React.useMemo(() => adAccessRaw || {}, [adAccessRaw]);
  const sounds = React.useMemo(() => soundsRaw || [], [soundsRaw]);
  const toggleSound = useMixerStore((state: any) => state.toggleSound);
  const isSoundAccessible = useMixerStore(
    (state: any) => state.isSoundAccessible,
  );
  const grantAdAccess = useMixerStore((state: any) => state.grantAdAccess);

  // Force re-render periodically to update lock states if access expires
  React.useEffect(() => {
    const hasActiveAdAccess = Object.values(adAccess).some(
      (a: any) => a.expiresAt > Date.now(),
    );
    if (!hasActiveAdAccess) return;

    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [adAccess]);

  const [activeMode, setActiveMode] = useState<'nature' | 'music' | 'ambience'>(
    'nature',
  );
  const [loadingAdSoundId, setLoadingAdSoundId] = useState<string | null>(null);
  const [showNetworkToast, setShowNetworkToast] = useState(false);

  const { isConnected } = useNetInfo();

  const handleToggleSound = React.useCallback(
    async (item: any) => {
      const isActive = activeSounds && activeSounds[item.id] !== undefined;

      if (isActive) {
        toggleSound(item.id);
        return;
      }

      const hasAccess = isSoundAccessible(item.id);

      if (!hasAccess) {
        if (isConnected === false) {
          setShowNetworkToast(true);
          return;
        }

        if (loadingAdSoundId) return;

        setLoadingAdSoundId(item.id);
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
              [{ text: t('common.ok') }],
            );
            return;
          }

          await RewardedAdManager.show(() => {
            grantAdAccess(item.id);
            toggleSound(item.id);
          });
        } catch (error) {
          console.log('[AdMob] Show error:', error);
          Alert.alert(t('common.error'), t('library.ad_error_msg'));
        } finally {
          setLoadingAdSoundId(null);
        }
        return;
      }

      toggleSound(item.id);
    },
    [
      activeSounds,
      isSoundAccessible,
      isConnected,
      loadingAdSoundId,
      grantAdAccess,
      toggleSound,
      t,
    ],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: any }) => {
      const isLocked = !isSoundAccessible(item.id);
      const isActive = activeSounds && activeSounds[item.id] !== undefined;

      return (
        <SoundCard
          title={getLocalizedSoundTitle(item, i18n.language, t)}
          iconName={item.icon}
          isLocked={isLocked}
          isActive={isActive}
          isLoading={loadingAdSoundId === item.id}
          disabled={loadingAdSoundId !== null && loadingAdSoundId !== item.id}
          onPress={() => handleToggleSound(item)}
        />
      );
    },
    [
      activeSounds,
      isSoundAccessible,
      loadingAdSoundId,
      handleToggleSound,
      t,
      i18n.language,
    ],
  );

  const filteredSounds = useMemo(
    () => (sounds || []).filter((sound: any) => sound.category === activeMode),
    [activeMode, sounds],
  );

  const flatListExtraData = useMemo(
    () => ({
      activeSounds,
      isSoundAccessible,
      loadingAdSoundId,
      tick,
    }),
    [activeSounds, isSoundAccessible, loadingAdSoundId, tick],
  );

  return (
    <AppScreen>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <FlatList
        key={columns}
        ListHeaderComponent={
          <>
            <HeaderComponent
              inset={false}
              title={t('library.header_title')}
              subtitle={t('library.header_subtitle')}
            />

            <ModeSwitcherComponent
              activeMode={activeMode}
              onModeChange={(mode: any) => setActiveMode(mode)}
            />
          </>
        }
        data={filteredSounds}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.columns : undefined}
        contentContainerStyle={[
          styles.listContent,
          filteredSounds.length === 0 && styles.emptyListContent,
        ]}
        extraData={flatListExtraData}
        initialNumToRender={8}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={<EmptyState message={t('library.no_sounds')} />}
        ListFooterComponent={<BannerAdView />}
      />
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
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: screen.paddingHorizontal,
    paddingBottom: screen.paddingBottom,
  },
  columns: { gap: spacing.md },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.huge,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default LibraryScreen;
