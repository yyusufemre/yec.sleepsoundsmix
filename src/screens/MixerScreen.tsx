import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import MixerItem from '../components/MixerItem';
import useMixerStore from '../store/useMixerStore';
import HeaderComponent from '../components/HeaderComponent';
import { MOCK_SOUNDS } from '../data/mockSounds';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import ActionButton from '../components/ActionButton';

const MixerScreen = () => {
  const navigation = useNavigation();
  const { activeSounds, toggleSound, clearMix, setVolume } = useMixerStore();

  const activeSoundItems = MOCK_SOUNDS.filter(s => activeSounds[s.id] !== undefined);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        title={activeSoundItems.length > 0 ? "Senfonini Yönet" : "Kendi Senfonini Oluştur"}
        subtitle={activeSoundItems.length > 0
          ? "Seçtiğin seslerin dengesini ayarla ve sana özel mükemmel uyku ortamını yönet."
          : "Henüz bir ses seçmedin. Rahatlamak için kütüphaneden beğendiğin sesleri eklemeye başla."
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeSoundItems.length > 0 ? (
          <>
            <View style={styles.listContainer}>
              {activeSoundItems.map(sound => (
                <MixerItem
                  key={sound.id}
                  title={sound.title}
                  iconName={sound.icon}
                  volume={activeSounds[sound.id]}
                  onVolumeChange={(val) => setVolume(sound.id, val)}
                  onRemove={() => toggleSound(sound.id)}
                />
              ))}
            </View>

            {/* Add more button */}
            <View style={styles.addMoreSection}>
              <TouchableOpacity
                style={styles.plusButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Library' as never)}
              >
                <Icon name="plus" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.addMoreText}>Başka Sesler Eklemek için + Tıklayın</Text>
            </View>

            {/* Clear all button */}
            <ActionButton 
              title={`Tüm Sesleri Kaldır (${activeSoundItems.length})`}
              icon="trash-can"
              onPress={clearMix}
              style={styles.clearAllButton}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Icon name="sliders" size={80} color="rgba(255, 255, 255, 0.2)" solid />
            </View>

            <TouchableOpacity
              style={styles.addBox}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Library' as never)}
            >
              <Text style={styles.addText}>
                Mixleyeceğiniz sesleri eklemek için tıklayın.
              </Text>
              <View style={styles.plusCircle}>
                <Icon name="plus" size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140, // Space for tab bar and footer
    flexGrow: 1,
  },
  listContainer: {
    gap: 20,
    marginTop: 10,
    marginBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginTop: -40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBox: {
    width: '100%',
    backgroundColor: 'rgba(47, 52, 72, 0.5)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter-Light',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
  },
  plusCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreSection: {
    alignItems: 'center',
    gap: 16,
    marginVertical: 30,
  },
  plusButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3471EC',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addMoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Light',
    opacity: 0.8,
  },
  clearAllButton: {
    marginTop: 10,
  },
});

export default MixerScreen;
