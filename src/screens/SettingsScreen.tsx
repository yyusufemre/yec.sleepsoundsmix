import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Svg from 'react-native-svg';
import HeaderComponent from '../components/HeaderComponent';
import GlassCard from '../components/GlassCard';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import YecLogo from '../components/YecLogo';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import useMixerStore from '../store/useMixerStore';
import DeveloperInfoModal from '../components/DeveloperInfoModal';
import InAppReview from 'react-native-in-app-review';

const pkg = require('../../package.json');


const SettingsScreen = () => {
  const activeSounds = useMixerStore((state: any) => state.activeSounds);
  const dynamicPadding = Object.keys(activeSounds || {}).length > 0
    ? layout.padding.screenBottomWithPlayer
    : layout.padding.screenBottomDefault;

  const [showDevModal, setShowDevModal] = React.useState(false);
  const hasRated = useMixerStore((state: any) => state.hasRated);
  const setHasRated = useMixerStore((state: any) => state.setHasRated);

  const handleEmail = () => {
    Linking.openURL('mailto:info@yusufemre.com');
  };

  const handleRate = () => {
    const storeUrl = 'https://play.google.com/store/apps/details?id=com.yec.sleepsoundsmix';
    
    try {
      if (!hasRated && InAppReview && InAppReview.isAvailable()) {
        InAppReview.RequestInAppReview()
          .then((hasFlowFinishedSuccessfully) => {
            if (hasFlowFinishedSuccessfully) {
              setHasRated(true);
            }
          })
          .catch((error) => {
            console.log('[InAppReview] Error:', error);
            Linking.openURL(storeUrl);
          });
      } else {
        Linking.openURL(storeUrl);
      }
    } catch (e) {
      console.log('[handleRate] Error:', e);
      Linking.openURL(storeUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderComponent 
        title="Deneyimini Özelleştir" 
        subtitle="Uygulama kullanımı hakkında bilgi alabilir, bize ulaşabilir veya gelişmemize destek olabilirsiniz." 
      />
      
      <View style={[styles.mainContent, { paddingBottom: dynamicPadding }]}>
        <View style={styles.cardsContainer}>
          {/* Nasıl Kullanılır - No Background */}
          <GlassCard noBackground contentStyle={styles.glassCardContent}>
            <View style={styles.cardHeader}>
              <Icon name="circle-question" size={20} color={colors.text.muted} solid style={styles.cardIcon} />
              <View style={styles.cardTextContent}>
                <AppText variant="medium" weight="bold">Nasıl Kullanılır</AppText>
                <AppText variant="caption" color="secondary" style={styles.lineHeightFix}>
                  SleepMix, doğanın en saf seslerini harmanlayarak size özel bir huzur alanı yaratır. 'Tüm Sesler' sekmesinden dilediğiniz sesleri seçin, 'Mixle' kısmından seviyelerini ayarlayın ve derin uykunun tadını çıkarın.
                </AppText>
              </View>
            </View>
          </GlassCard>

          {/* Geliştiriciye Ulaş */}
          <TouchableOpacity onPress={handleEmail} activeOpacity={0.8}>
            <GlassCard contentStyle={styles.glassCardContent}>
              <View style={styles.cardHeader}>
                <Icon name="pen" size={20} color={colors.text.muted} solid style={styles.cardIcon} />
                <View style={styles.cardTextContent}>
                  <AppText variant="medium" weight="bold">Geliştiriciye Ulaş</AppText>
                  <AppText variant="caption" color="secondary" style={styles.lineHeightFix}>
                    Uygulama içerisinde yaşadığınız bir hata varsa lütfen bize bildirin.{' '}
                    <AppText variant="caption" weight="bold" color="primary">info@yusufemre.com</AppText>
                  </AppText>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>

          {/* Bizi Puanla */}
          <GlassCard contentStyle={styles.glassCardContent}>
            <View style={styles.cardHeader}>
              <Icon name="stars" size={20} color={colors.text.muted} solid style={styles.cardIcon} />
              <View style={styles.cardTextContent}>
                <AppText variant="medium" weight="bold">Bizi Puanla</AppText>
                <AppText variant="caption" color="secondary" style={styles.lineHeightFix}>
                  Destek olmak için lütfen uygulamayı değerlendirin.
                </AppText>
              </View>
            </View>
            
            <AppButton 
              variant="gradient"
              size="medium"
              gradientColors={colors.accent.titleGradient}
              style={styles.rateButton}
              onPress={handleRate}
            >
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} name="star" size={16} color={colors.accent.star} solid />
                ))}
                <AppText variant="body" weight="semiBold" color="primary" style={styles.rateButtonText}>
                  Puanla!
                </AppText>
              </View>
            </AppButton>
          </GlassCard>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.logoContainer} 
            onPress={() => setShowDevModal(true)}
            activeOpacity={0.7}
          >
            <YecLogo fill={colors.background.logo} />
          </TouchableOpacity>
          <AppText variant="tiny" color="inactive" style={styles.versionText}>Sürüm v{pkg.version}</AppText>
          <AppText variant="tiny" color="inactive" style={styles.footerSubtext}>hey!</AppText>
        </View>
      </View>

      <DeveloperInfoModal 
        isVisible={showDevModal} 
        onClose={() => setShowDevModal(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: layout.padding.screenHorizontal,
    justifyContent: 'space-between',
    paddingBottom: layout.padding.screenBottomDefault,
  },
  cardsContainer: {
    gap: 12,
    marginTop: 0,
  },
  glassCardContent: {
    padding: 16,
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  cardIcon: {
    width: 24,
    textAlign: 'center',
    marginTop: 2,
  },
  cardTextContent: {
    flex: 1,
    gap: 4,
  },
  lineHeightFix: {
    lineHeight: 16,
  },
  rateButton: {
    marginTop: 12,
  },
  rateButtonText: {
    marginLeft: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    opacity: 0.3,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    opacity: 0.5,
  },
  footerSubtext: {
    opacity: 0.5,
    marginTop: -6,
  },
});

export default SettingsScreen;
