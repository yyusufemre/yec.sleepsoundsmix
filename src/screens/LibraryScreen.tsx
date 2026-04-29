import React, { useState, useMemo } from 'react';
import { StyleSheet, FlatList, StatusBar, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SoundCard from '../components/SoundCard';
import HeaderComponent from '../components/HeaderComponent';
import ModeSwitcherComponent from '../components/ModeSwitcherComponent';
import { MOCK_SOUNDS } from '../data/mockSounds';
import useMixerStore from '../store/useMixerStore';
import AppText from '../components/AppText';

const LibraryScreen = () => {
  const activeSounds = useMixerStore((state: any) => state.activeSounds) || {};
  const toggleSound = useMixerStore(state => state.toggleSound);
  const unlockedSoundIds = useMixerStore(state => state.unlockedSoundIds);
  const unlockSounds = useMixerStore(state => state.unlockSounds);
  const [activeMode, setActiveMode] = useState<'nature' | 'music'>('nature');
  const [loadingAdSoundId, setLoadingAdSoundId] = useState<string | null>(null);

  const handleToggleSound = (item: any) => {
    const isActuallyLocked = item.isLocked && !unlockedSoundIds.includes(item.id);

    if (isActuallyLocked) {
      if (loadingAdSoundId) return;

      setLoadingAdSoundId(item.id);

      // Rewarded Ad Mock Akışı
      setTimeout(() => {
        setLoadingAdSoundId(null);
        // %80 başarı ihtimali ile mock ediyoruz
        const success = Math.random() > 0.2;

        if (success) {
          const remainingLockedIds = MOCK_SOUNDS
            .filter(s => s.isLocked && !unlockedSoundIds.includes(s.id))
            .map(s => s.id);

          const idsToUnlock = remainingLockedIds.slice(0, 3); // Her zaman sıradaki ilk 3 sesi açar

          unlockSounds(idsToUnlock);
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
    const isActuallyLocked = item.isLocked && !unlockedSoundIds.includes(item.id);
    const isActive = activeSounds && activeSounds[item.id] !== undefined;

    return (
      <SoundCard
        title={item.title}
        iconName={item.icon}
        isLocked={isActuallyLocked}
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
    unlockedSoundIds,
    loadingAdSoundId
  }), [activeSounds, unlockedSoundIds, loadingAdSoundId]);

  const dynamicPadding = Object.keys(activeSounds || {}).length > 0 ? 180 : 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <HeaderComponent 
        title="Doğanın Sesine Odaklan" 
        subtitle="Kendi huzur dolu ortamınızı yaratmak için onlarca yüksek kaliteli ses arasından seçiminizi yapın." 
      />
      
      <ModeSwitcherComponent 
        activeMode={activeMode} 
        onModeChange={setActiveMode} 
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 100,
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
