import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MixerItem from '../components/MixerItem';
import useMixerStore from '../store/useMixerStore';
import HeaderComponent from '../components/HeaderComponent';
import { MOCK_SOUNDS } from '../data/mockSounds';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import ActionButton from '../components/ActionButton';
import GlassCard from '../components/GlassCard';
import GlassBlur from '../components/GlassBlur';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

const MixerScreen = () => {
  const navigation = useNavigation();
  const activeSounds = useMixerStore((state: any) => state.activeSounds) || {};
  const toggleSound = useMixerStore((state: any) => state.toggleSound);
  const clearMix = useMixerStore((state: any) => state.clearMix);
  const setVolume = useMixerStore((state: any) => state.setVolume);
  const savedMixes = useMixerStore((state: any) => state.savedMixes) || [];
  const saveMix = useMixerStore((state: any) => state.saveMix);
  const loadMix = useMixerStore((state: any) => state.loadMix);
  const deleteSavedMix = useMixerStore((state: any) => state.deleteSavedMix);

  const [mixName, setMixName] = useState('');

  const activeSoundItems = MOCK_SOUNDS.filter(s => activeSounds[s.id] !== undefined);
  const dynamicPadding = activeSoundItems.length > 0
    ? layout.padding.screenBottomWithPlayer
    : layout.padding.screenBottomDefault;

  const handleSave = () => {
    // If mixName is empty, the store will handle the default name (Kaydedilen Mix X)
    const success = saveMix(mixName);
    if (success) {
      setMixName('');
      Alert.alert('Başarılı', 'Mixiniz kaydedildi.');
    }
  };

  const handleLoadMix = (id: string) => {
    loadMix(id);
    // After loading, we stay in MixerScreen to allow volume adjustments
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        title={activeSoundItems.length > 0 ? 'Senfonini Yönet' : 'Kendi Senfonini Oluştur'}
        subtitle={activeSoundItems.length > 0
          ? 'Seçtiğin seslerin dengesini ayarla ve sana özel mükemmel uyku ortamını yönet.'
          : 'Henüz bir ses seçmedin. Rahatlamak için kütüphaneden beğendiğin sesleri eklemeye başla.'
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: dynamicPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {activeSoundItems.length > 0 ? (
          <>
            {/* Active sound list */}
            <View style={styles.listContainer}>
              {activeSoundItems.map(sound => (
                <MixerItem
                  key={sound.id}
                  title={sound.title}
                  iconName={sound.icon}
                  volume={activeSounds[sound.id]}
                  onVolumeChange={(val: number) => setVolume(sound.id, val)}
                  onRemove={() => toggleSound(sound.id)}
                />
              ))}
            </View>

            {/* Save Mix — GlassCard row */}
            <GlassCard
              variant="normal"
              style={styles.saveMixCard}
              contentStyle={styles.saveMixContent}
            >
              <Icon name="floppy-disk" size={15} color="rgba(255, 255, 255, 0.5)" solid />
              <TextInput
                style={styles.saveInput}
                placeholder="Mix adı ver..."
                placeholderTextColor={colors.text.muted}
                value={mixName}
                onChangeText={setMixName}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.75}
              >
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </GlassCard>

            {/* Add more */}
            <View style={styles.addMoreSection}>
              <TouchableOpacity
                style={styles.plusButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Library' as never)}
              >
                <Icon name="plus" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Clear all */}
            <ActionButton
              title={`Tüm Sesleri Kaldır (${activeSoundItems.length})`}
              icon="trash-can"
              onPress={clearMix}
              style={styles.clearAllButton}
            />
          </>
        ) : (
          /* Empty state */
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Icon name="sliders" size={80} color={colors.text.muted} solid />
            </View>

            <TouchableOpacity
              style={styles.addBox}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Library' as never)}
            >
              <GlassBlur blurAmount={12} fallbackColor="rgba(47,52,72,0.7)" />
              <Text style={styles.addText}>
                Mixleyeceğiniz sesleri eklemek için tıklayın.
              </Text>
              <View style={styles.plusCircle}>
                <Icon name="plus" size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Saved Mixes — always visible if any */}
        {savedMixes.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>Kayıtlı Mixlerim</Text>
            {savedMixes.map((mix: any) => (
              <GlassCard
                key={mix.id}
                variant="normal"
                style={styles.savedMixCard}
                contentStyle={styles.savedMixContent}
              >
                {/* Left: icon + name + count */}
                <View style={styles.savedMixLeft}>
                  <View style={styles.savedMixIcon}>
                    <Icon name="music" size={15} color={colors.accent.primary} solid />
                  </View>
                  <View>
                    <Text style={styles.savedMixName}>{mix.name}</Text>
                    <Text style={styles.savedMixMeta}>
                      {Array.isArray(mix.sounds) ? mix.sounds.length : Object.keys(mix.sounds || {}).length} ses
                    </Text>
                  </View>
                </View>

                {/* Right: load + delete */}
                <View style={styles.savedMixActions}>
                  <TouchableOpacity
                    style={styles.loadBtn}
                    onPress={() => handleLoadMix(mix.id)}
                    activeOpacity={0.75}
                  >
                    <Icon name="play" size={16} color={colors.accent.success} solid />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteSavedMix(mix.id)}
                    activeOpacity={0.75}
                  >
                    <Icon name="xmark" size={12} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
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
    paddingHorizontal: layout.padding.screenHorizontal,
    paddingBottom: layout.padding.screenBottomDefault,
    flexGrow: 1,
  },
  listContainer: {
    gap: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  saveMixCard: {
    marginBottom: 24,
  },
  saveMixContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.md,
    paddingVertical: layout.spacing.md,
  },
  saveInput: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: colors.accent.success,
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.sm,
    borderRadius: layout.radius.pill,
  },
  saveBtnText: {
    color: colors.text.dark,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
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
    backgroundColor: 'transparent',
    borderRadius: layout.radius.xxl,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: 'hidden',
  },
  addText: {
    color: colors.text.primary,
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
    marginVertical: 20,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllButton: {
    marginTop: 8,
  },
  savedSection: {
    marginTop: 32,
    gap: layout.spacing.sm,
  },
  savedTitle: {
    color: colors.text.secondary,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.8,
    textTransform: 'capitalize',
    marginBottom: layout.spacing.sm,
  },
  savedMixCard: {
    marginBottom: layout.spacing.sm,
  },
  savedMixContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedMixLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.spacing.md,
    flex: 1,
  },
  savedMixIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedMixName: {
    color: colors.text.primary,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  savedMixMeta: {
    color: colors.text.muted,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  savedMixActions: {
    flexDirection: 'row',
    gap: layout.spacing.sm,
  },
  loadBtn: {
    padding: layout.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: layout.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
});

export default MixerScreen;
