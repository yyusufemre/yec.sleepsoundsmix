import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import YecLogo from './YecLogo';
import GlassBlur from './GlassBlur';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../services/AnalyticsService';

interface DeveloperInfoModalProps {
  isVisible?: boolean;
  visible?: boolean;
  onClose: () => void;
}

export const DeveloperInfoModal: React.FC<DeveloperInfoModalProps> = ({
  isVisible,
  visible,
  onClose,
}) => {
  const isModalVisible = visible !== undefined ? visible : !!isVisible;
  const { t } = useTranslation();

  const handleOpenLink = (url: string) => {
    trackEvent('developer_link_clicked', { target: 'website' });
    Linking.openURL(url).catch((err) => console.error("Sayfa açılamadı", err));
  };

  const handleEmail = () => {
    trackEvent('developer_link_clicked', { target: 'email' });
    Linking.openURL('mailto:cibiroglu@gmail.com').catch((err) => console.error("E-posta açılamadı", err));
  };

  const handlePlayStore = () => {
    trackEvent('developer_link_clicked', { target: 'google_play' });
    Linking.openURL('https://play.google.com/store/apps/dev?id=6882853239344070177').catch((err) => console.error("Play Store açılamadı", err));
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <GlassBlur blurAmount={25} style={StyleSheet.absoluteFill} />

          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header Info Section */}
              <View style={styles.headerInfo}>
                <View style={styles.logoContainer}>
                  <YecLogo width={72} height={48} fill="#C5AD92" />
                </View>

                <View style={styles.details}>
                  <Text style={styles.name}>Yusuf Emre Cıbıroğlu</Text>

                  <TouchableOpacity onPress={() => handleOpenLink('https://www.yusufemre.com')}>
                    <Text style={styles.webText}>
                      www.<Text style={styles.webBold}>yusufemre</Text>.com
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.mailRow} onPress={handleEmail}>
                    <Ionicons name="mail" size={13} color="#C5AD92" style={styles.mailIcon} />
                    <Text style={styles.mailText}>cibiroglu@gmail.com</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Other Apps Section - Only show Play Store link on Android */}
              {Platform.OS === 'android' && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionTitle}>{t('settings.other_apps')}</Text>

                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayStore}
                    activeOpacity={0.8}
                  >
                    <View style={styles.playButtonContent}>
                      <Ionicons name="logo-google-playstore" size={24} color="#FFFFFF" />
                      <View style={styles.playTextContainer}>
                        <Text style={styles.getItOn}>{t('settings.get_it_on')}</Text>
                        <Text style={styles.googlePlay}>Google Play</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#151320',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
  webText: {
    color: '#C5AD92',
    fontSize: 16,
  },
  webBold: {
    fontWeight: 'bold',
  },
  mailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  mailIcon: {
    opacity: 0.8,
  },
  mailText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 20,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 14,
    textAlign: 'center',
  },
  playButton: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  playButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  playTextContainer: {
    alignItems: 'flex-start',
  },
  getItOn: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
  },
  googlePlay: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DeveloperInfoModal;
