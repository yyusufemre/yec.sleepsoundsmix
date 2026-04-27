import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { colors } from '../theme/colors';
import SoundCard from '../components/SoundCard';
import HeaderComponent from '../components/HeaderComponent';
import ModeSwitcherComponent from '../components/ModeSwitcherComponent';
import { MOCK_SOUNDS } from '../data/mockSounds';
import useMixerStore from '../store/useMixerStore';

const LibraryScreen = () => {
  const { activeSounds, toggleSound } = useMixerStore();
  const [activeMode, setActiveMode] = useState<'nature' | 'music'>('nature');

  const renderItem = ({ item }: { item: any }) => (
    <SoundCard
      title={item.title}
      iconName={item.icon}
      isLocked={item.isLocked}
      isActive={activeSounds[item.id] !== undefined}
      onPress={() => toggleSound(item.id)}
    />
  );

  const filteredSounds = MOCK_SOUNDS.filter(sound => sound.category === activeMode);

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
        contentContainerStyle={styles.listContent}
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
  }
});

export default LibraryScreen;
