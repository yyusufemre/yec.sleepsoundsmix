import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderComponent from '../components/HeaderComponent';
import PresetCard from '../components/PresetCard';
import useMixerStore from '../store/useMixerStore';
import { layout } from '../theme/layout';
import AppText from '../components/AppText';

const EXAMPLES = [
  {
    id: 'e1',
    title: 'Büyülü Orman',
    description: 'Hafif rüzgarla hışırdayan yapraklar ve uzaklardan gelen kuş cıvıltılarıyla kendinizi doğanın kucağında hissedin.',
    iconName: 'tree',
    isAd: false,
  },
  {
    id: 'e2',
    title: 'Fırtınalı Gece',
    description: 'Gök gürültüsü ve şiddetli yağmurun huzur veren ritmiyle derin uykuya dalın ve dış dünyadan kopun.',
    iconName: 'cloud-bolt',
    isAd: true,
  },
  {
    id: 'e3',
    title: 'Deniz Kıyısı',
    description: 'Dalgaların kıyıya vurduğu o eşsiz ses ve martı çığlıklarıyla kumsalda huzurlu bir akşam yaşayın.',
    iconName: 'water',
    isAd: false,
  },
];

const PresetsScreen = () => {
  const activeSounds = useMixerStore((state: any) => state.activeSounds);
  const savedMixes = useMixerStore((state: any) => state.savedMixes);
  const loadMix = useMixerStore((state: any) => state.loadMix);
  const deleteSavedMix = useMixerStore((state: any) => state.deleteSavedMix);

  const dynamicPadding = Object.keys(activeSounds || {}).length > 0
    ? layout.padding.screenBottomWithPlayer
    : layout.padding.screenBottomDefault;

  const handleLongPress = (id: string, name: string) => {
    Alert.alert(
      'Mixi Sil',
      `"${name}" isimli mixi silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteSavedMix(id) }
      ]
    );
  };

  const getSoundCount = (mix: any) => {
    if (!mix.sounds) return 0;
    if (Array.isArray(mix.sounds)) return mix.sounds.length;
    return Object.keys(mix.sounds).length;
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        title="Hazır Yolculuklar"
        subtitle="Uzmanlarımız tarafından hazırlanan veya sizin kaydettiğiniz özel ses kombinasyonlarını keşfedin."
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: dynamicPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {savedMixes.length > 0 && (
          <View style={styles.section}>
            <AppText variant="h2" color="primary" style={styles.sectionTitle}>Sizin Karışımlarınız</AppText>
            {savedMixes.map((mix: any) => (
              <PresetCard
                key={mix.id}
                title={mix.name}
                description={`${getSoundCount(mix)} ses`}
                iconName="music"
                isAd={false}
                onPress={() => loadMix(mix.id)}
                onLongPress={() => handleLongPress(mix.id, mix.name)}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <AppText variant="h2" color="primary" style={styles.sectionTitle}>Önerilenler</AppText>
          {EXAMPLES.map((item) => (
            <PresetCard
              key={item.id}
              title={item.title}
              description={item.description}
              iconName={item.iconName}
              isAd={item.isAd}
              onPress={() => console.log('Playing preset:', item.title)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    paddingHorizontal: layout.padding.screenHorizontal,
    paddingTop: 10,
    paddingBottom: layout.padding.screenBottomDefault,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    marginLeft: 4,
  }
});

export default PresetsScreen;
