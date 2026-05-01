import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import GlassBlur from './GlassBlur';
import YecLogo from './YecLogo';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

interface DeveloperInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const DeveloperInfoModal: React.FC<DeveloperInfoModalProps> = ({ isVisible, onClose }) => {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  const handleEmail = () => {
    Linking.openURL('mailto:cibiroglu@gmail.com').catch((err) => console.error("Couldn't open mail", err));
  };

  const handlePlayStore = () => {
    Linking.openURL('https://play.google.com/store/apps/dev?id=6882853239344070177').catch((err) => console.error("Couldn't open Play Store", err));
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <GlassBlur style={StyleSheet.absoluteFill} blurAmount={12} fallbackColor="rgba(0,0,0,0.85)" />
          
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header Info Section */}
              <View style={styles.headerInfo}>
                <View style={styles.logoContainer}>
                  <YecLogo width={76} height={51} fill="#45556F" />
                </View>

                <View style={styles.details}>
                  <Text style={styles.name}>Yusuf Emre Cıbıroğlu</Text>

                  <TouchableOpacity onPress={() => handleOpenLink('https://www.yusufemre.com')}>
                    <Text style={styles.webText}>
                      www.<Text style={styles.webBold}>yusufemre</Text>.com
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.mailRow} onPress={handleEmail}>
                    <Icon name="envelope" size={12} color="#45556F" style={styles.mailIcon} />
                    <Text style={styles.mailText}>cibiroglu@gmail.com</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Other Apps Section */}
              <Text style={styles.sectionTitle}>Diğer Uygulamalar</Text>

              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayStore}
                activeOpacity={0.8}
              >
                <View style={styles.playButtonContent}>
                  <Icon name="google-play" size={24} color="#FFFFFF" />
                  <View style={styles.playTextContainer}>
                    <Text style={styles.getItOn}>GET IT ON</Text>
                    <Text style={styles.googlePlay}>Google Play</Text>
                  </View>
                </View>
              </TouchableOpacity>
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
    backgroundColor: '#1F232F',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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
    color: '#45556F',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  webText: {
    color: '#63738D',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  webBold: {
    fontFamily: 'Inter-Bold',
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
    color: '#45556F',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 20,
  },
  sectionTitle: {
    color: '#63738D',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    opacity: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  playButton: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    opacity: 0.9, // Matching the translucent feel in screenshot
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
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    opacity: 0.8,
  },
  googlePlay: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
  },
});

export default DeveloperInfoModal;
