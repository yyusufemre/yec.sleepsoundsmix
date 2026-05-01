import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, StatusBar, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SoundCard from '../components/SoundCard';
import HeaderComponent from '../components/HeaderComponent';
import ModeSwitcherComponent from '../components/ModeSwitcherComponent';
import { MOCK_SOUNDS } from '../data/mockSounds';
import useMixerStore from '../store/useMixerStore';
import AppText from '../components/AppText';
import { layout } from '../theme/layout';
import { useNetInfo } from '@react-native-community/netinfo';
import GlassToast from '../components/GlassToast';

const LibraryScreen = () => {
  const [tick, setTick] = useState(0);
  const activeSounds = useMixerStore((state: any) => state.activeSounds) || {};
  const adAccess = useMixerStore((state: any) => state.adAccess) || {};

  // Force re-render periodically to update lock states if access expires
  React.useEffect(() => {
    const hasActiveAdAccess = Object.values(adAccess).some((a: any) => a.expiresAt > Date.now());
    if (!hasActiveAdAccess) return;

    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [adAccess]);

  const toggleSound = useMixerStore(state => state.toggleSound);
  const isSoundAccessible = useMixerStore(state => state.isSoundAccessible);
  const grantAdAccess = useMixerStore(state => state.grantAdAccess);
  const [activeMode, setActiveMode] = useState<'nature' | 'music' | 'ambience'>('nature');
  const [loadingAdSoundId, setLoadingAdSoundId] = useState<string | null>(null);
  const [showNetworkToast, setShowNetworkToast] = useState(false);

  const { isConnected } = useNetInfo();

  const handleToggleSound = (item: any) => {
    const isActive = activeSounds && activeSounds[item.id] !== undefined;
    
    if (isActive) {
      toggleSound(item.id);
      return;
    }

    const hasAccess = isSoundAccessible(item.id);

    if (!hasAccess) {
      // İnternet kontrolü: Reklam izlemek için internet gerekir
      if (isConnected === false) {
        setShowNetworkToast(true);
        return;
      }

      if (loadingAdSoundId) return;

      setLoadingAdSoundId(item.id);

      // Rewarded Ad Mock Akışı
      setTimeout(() => {
        setLoadingAdSoundId(null);
        // %85 başarı ihtimali ile mock ediyoruz
        const success = Math.random() > 0.15;

        if (success) {
          // Yeni model: 1 reklam = tıklanan ses + sıradaki 1 kilitli ses (1 saatlik)
          grantAdAccess(item.id);
          // Açıldıktan sonra otomatik aktifleştir
          toggleSound(item.id);
        } else {
          Alert.alert(
            'Bağlantı Hatası',
            'Reklam yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.',
            [{ text: 'Tamam', style: 'cancel' }]
          );
        }
      }, 1500);

      return;
    }

    toggleSound(item.id);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isLocked = !isSoundAccessible(item.id);
    const isActive = activeSounds && activeSounds[item.id] !== undefined;

    return (
      <SoundCard
        title={item.title}
        iconName={item.icon}
        isLocked={isLocked}
        isActive={isActive}
        isLoading={loadingAdSoundId === item.id}
        disabled={loadingAdSoundId !== null && loadingAdSoundId !== item.id}
        onPress={() => handleToggleSound(item)}
      />
    );
  };

  const filteredSounds = MOCK_SOUNDS.filter(sound => sound.category === activeMode);

  const flatListExtraData = useMemo(() => ({
    activeSounds,
    isSoundAccessible,
    loadingAdSoundId,
    tick
  }), [activeSounds, isSoundAccessible, loadingAdSoundId, tick]);

  const dynamicPadding = Object.keys(activeSounds || {}).length > 0
    ? layout.padding.screenBottomWithPlayer
    : layout.padding.screenBottomDefault;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <HeaderComponent 
        title="Doğanın Sesine Odaklan" 
        subtitle="Kendi huzur dolu ortamınızı yaratmak için onlarca yüksek kaliteli ses arasından seçiminizi yapın." 
      />
      
      <ModeSwitcherComponent 
        activeMode={activeMode} 
        onModeChange={(mode: any) => setActiveMode(mode)} 
      />
      
      <FlatList
        data={filteredSounds}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[styles.listContent, { paddingBottom: dynamicPadding }, filteredSounds.length === 0 && styles.emptyListContent]}
        extraData={flatListExtraData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText variant="body" color="secondary" style={styles.emptyText}>Bu kategoride henüz ses bulunmuyor.</AppText>
          </View>
        }
      />
      <GlassToast 
        visible={showNetworkToast} 
        message="İnternet bağlantınız yok. Yeni sesler eklemek için lütfen internetinizi kontrol edin." 
        type="error"
        onHide={() => setShowNetworkToast(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: layout.padding.screenHorizontal - 6, // Offset the SoundCard's margin (20-6=14)
    paddingBottom: layout.padding.screenBottomDefault,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
  }
});

export default LibraryScreen;
