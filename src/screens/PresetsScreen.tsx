import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import HeaderComponent from '../components/HeaderComponent';
import PresetCard from '../components/PresetCard';
import useMixerStore from '../store/useMixerStore';

const EXAMPLES = [
  {
    id: '1',
    title: 'Büyülü Orman',
    description: 'Hafif rüzgarla hışırdayan yapraklar ve uzaklardan gelen kuş cıvıltılarıyla kendinizi doğanın kucağında hissedin.',
    iconName: 'tree',
    isAd: false,
  },
  {
    id: '2',
    title: 'Fırtınalı Gece',
    description: 'Gök gürültüsü ve şiddetli yağmurun huzur veren ritmiyle derin uykuya dalın ve dış dünyadan kopun.',
    iconName: 'cloud-bolt',
    isAd: true,
  },
  {
    id: '3',
    title: 'Deniz Kıyısı',
    description: 'Dalgaların kıyıya vurduğu o eşsiz ses ve martı çığlıklarıyla kumsalda huzurlu bir akşam yaşayın.',
    iconName: 'water',
    isAd: false,
  },
  {
    id: '4',
    title: 'Şehir Yağmuru',
    description: 'Pencereye vuran yağmur damlaları ve uzaktan gelen loş şehir uğultusuyla melankolik ve rahatlatıcı bir atmosfer.',
    iconName: 'cloud-showers-heavy',
    isAd: false,
  },
  {
    id: '5',
    title: 'Kamp Ateşi',
    description: 'Çıtırtıyla yanan odunların sıcaklığı ve gece böceklerinin şarkısı eşliğinde yıldızların altında bir uyku.',
    iconName: 'fire',
    isAd: false,
  },
  {
    id: '6',
    title: 'Derin Uzay',
    description: 'Sonsuzluğun huzur veren düşük frekanslı uğultusuyla zihninizi boşaltın ve evrenin derinliklerine yolculuk yapın.',
    iconName: 'user-astronaut',
    isAd: false,
  }
];

const PresetsScreen = () => {
  const activeSounds = useMixerStore((state: any) => state.activeSounds);
  const dynamicPadding = Object.keys(activeSounds || {}).length > 0 ? 180 : 110;

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent
        title="Hazır Yolculuklar"
        subtitle="Uzmanlarımız tarafından hazırlanan, sizi derin uykuya taşıyacak özel ses kombinasyonlarını keşfedin."
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: dynamicPadding }]}
        showsVerticalScrollIndicator={false}
      >
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
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110, // Space for tab bar
  }
});

export default PresetsScreen;
