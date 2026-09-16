import useReducedMotion from '../hooks/useReducedMotion';
import { spacing } from '../theme/tokens';
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import AppScreen, { ScreenScrollView } from '../layout/AppScreen';
import { useFocusEffect } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import Icon from 'react-native-vector-icons/FontAwesome6';
import HeaderComponent from '../components/HeaderComponent';
import SettingsRow from '../components/SettingsRow';
import LegalFooter from '../components/LegalFooter';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import YecLogo from '../components/YecLogo';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import useMixerStore from '../store/useMixerStore';
import DeveloperInfoModal from '../components/DeveloperInfoModal';
import LanguageSelectorModal from '../components/LanguageSelectorModal';
import InAppReview from 'react-native-in-app-review';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../locales/languages';
import NotificationService from '../services/NotificationService';
import ConsentService from '../services/ConsentService';

const pkg = require('../../package.json');

const SettingsScreen = () => {
  const reducedMotion = useReducedMotion();
  const [showDevModal, setShowDevModal] = React.useState(false);
  const [showLangModal, setShowLangModal] = React.useState(false);
  const hasRated = useMixerStore((state: any) => state.hasRated);
  const setHasRated = useMixerStore((state: any) => state.setHasRated);
  const notificationsEnabled = useMixerStore(
    (state: any) => state.notificationsEnabled,
  );
  const setNotificationsEnabled = useMixerStore(
    (state: any) => state.setNotificationsEnabled,
  );
  const setFcmToken = useMixerStore((state: any) => state.setFcmToken);
  const [isNotificationBusy, setIsNotificationBusy] = React.useState(false);
  const logoShineAnim = React.useRef(new Animated.Value(0)).current;

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://calmix.web.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://calmix.web.app/privacy');
  };

  const handleRate = () => {
    const storeUrl =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/id123456789' // TODO: Update with real App Store ID later
        : 'https://play.google.com/store/apps/details?id=com.yec.sleepsoundsmix';

    try {
      if (!hasRated && InAppReview && InAppReview.isAvailable()) {
        InAppReview.RequestInAppReview()
          .then(hasFlowFinishedSuccessfully => {
            if (hasFlowFinishedSuccessfully) {
              setHasRated(true);
            }
          })
          .catch(error => {
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

  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const currentLangObj =
    LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  const openLanguageSelector = () => {
    setShowLangModal(true);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  React.useEffect(() => {
    let isMounted = true;

    NotificationService.getPermissionStatus().then(isGranted => {
      if (!isMounted) return;
      if (notificationsEnabled && !isGranted) {
        setNotificationsEnabled(false);
        setFcmToken(null);
        NotificationService.deleteFcmToken();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [notificationsEnabled, setFcmToken, setNotificationsEnabled]);

  useFocusEffect(
    React.useCallback(() => {
      logoShineAnim.setValue(0);
      if (reducedMotion) return;
      const animation = Animated.sequence([
        Animated.delay(350),
        Animated.timing(logoShineAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

      animation.start();

      return () => {
        animation.stop();
      };
    }, [logoShineAnim, reducedMotion]),
  );

  const logoShineTranslateX = logoShineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-48, 72],
  });

  const handleNotificationToggle = async (enabled: boolean) => {
    if (isNotificationBusy) return;

    setIsNotificationBusy(true);

    if (!enabled) {
      setNotificationsEnabled(false);
      setFcmToken(null);
      try {
        await NotificationService.deleteFcmToken();
      } finally {
        setIsNotificationBusy(false);
      }
      return;
    }

    try {
      const isGranted = await NotificationService.requestUserPermission();
      if (!isGranted) {
        setNotificationsEnabled(false);
        setFcmToken(null);
        Alert.alert(
          t('settings.notifications_denied_title'),
          t('settings.notifications_denied_msg'),
        );
        return;
      }

      setNotificationsEnabled(true);
      const token = await NotificationService.getFcmToken();
      setFcmToken(token);
    } catch (error) {
      console.log('[Settings] Notification toggle error:', error);
      setNotificationsEnabled(false);
      Alert.alert(t('common.error'), t('settings.notifications_error_msg'));
    } finally {
      setIsNotificationBusy(false);
    }
  };

  return (
    <AppScreen>
      <ScreenScrollView contentContainerStyle={styles.mainContent}>
        <HeaderComponent
          inset={false}
          title={t('navigation.settings')}
          subtitle=""
        />

        <View style={styles.cardsContainer}>
          <SettingsRow
            icon="circle-question"
            title={t('settings.how_to_use_title')}
            description={t('settings.how_to_use_msg')}
            noBackground
          />
          <SettingsRow
            icon="globe"
            title={t('settings.language')}
            value={currentLangObj.nativeName}
            onPress={openLanguageSelector}
          />
          <SettingsRow
            icon="shield-halved"
            title={t('settings.privacy_settings')}
            onPress={() => ConsentService.showPrivacyOptions()}
          />
          <SettingsRow
            icon="bell"
            title={t('settings.notifications_title')}
            description={t('settings.notifications_subtitle')}
            toggle={{
              value: notificationsEnabled,
              disabled: isNotificationBusy,
              onChange: handleNotificationToggle,
            }}
          />
          {/* Bizi Puanla */}
          <View style={styles.rateInlineSection}>
            <AppText
              variant="caption"
              color="secondary"
              style={styles.rateInlineText}
            >
              {t('settings.rate_us_subtitle')}
            </AppText>
            <AppButton
              variant="gradient"
              size="medium"
              gradientColors={colors.accent.titleGradient}
              style={styles.rateButton}
              onPress={handleRate}
            >
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Icon
                    key={i}
                    name="star"
                    size={16}
                    color={colors.accent.star}
                    solid
                  />
                ))}
                <AppText
                  variant="body"
                  weight="semiBold"
                  color="primary"
                  style={styles.rateButtonText}
                >
                  {t('settings.rate_us_button')}
                </AppText>
              </View>
            </AppButton>
          </View>
        </View>

        {/* Footer */}
        <LegalFooter onPrivacy={handlePrivacyPolicy} onTerms={handleTerms}>
          <TouchableOpacity
            style={styles.logoContainer}
            accessibilityRole="button"
            accessibilityLabel="Yusuf Emre Cıbıroğlu"
            onPress={() => setShowDevModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.logoShineClip}>
              <YecLogo fill={colors.background.logo} style={styles.logoBase} />
              <MaskedView
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
                maskElement={<YecLogo fill="#000" />}
              >
                <Animated.View
                  style={[
                    styles.logoShine,
                    {
                      transform: [
                        { translateX: logoShineTranslateX },
                        { rotate: '18deg' },
                      ],
                    },
                  ]}
                />
              </MaskedView>
            </View>
          </TouchableOpacity>
          <AppText variant="tiny" color="inactive" style={styles.versionText}>
            {t('settings.version')} v{pkg.version}
          </AppText>
          <AppText variant="tiny" color="inactive" style={styles.footerSubtext}>
            hey!
          </AppText>
        </LegalFooter>
      </ScreenScrollView>

      <DeveloperInfoModal
        isVisible={showDevModal}
        onClose={() => setShowDevModal(false)}
      />

      <LanguageSelectorModal
        isVisible={showLangModal}
        onClose={() => setShowLangModal(false)}
        currentLanguage={currentLanguage}
        onChangeLanguage={handleLanguageChange}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    flexGrow: 1,
    gap: layout.spacing.xxl,
    justifyContent: 'space-between',
  },
  cardsContainer: {
    gap: spacing.md,
    marginTop: 0,
  },
  rateInlineSection: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: 2,
  },
  rateInlineText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  rateButton: {
    alignSelf: 'center',
  },
  rateButtonText: {
    flexShrink: 1,
    textAlign: 'center',
    marginLeft: spacing.sm,
  },
  starsRow: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoContainer: {
    minHeight: 48,
    minWidth: 48,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShineClip: {
    width: 56,
    height: 37,
    overflow: 'hidden',
  },
  logoBase: {
    opacity: 0.3,
  },
  logoShine: {
    position: 'absolute',
    top: -10,
    left: 0,
    width: 12,
    height: 58,
    backgroundColor: 'rgba(255,255,255,0.42)',
    opacity: 0.8,
  },
  versionText: {
    opacity: 0.5,
  },
  footerSubtext: {
    opacity: 0.5,
    marginTop: -4,
  },
});

export default SettingsScreen;
