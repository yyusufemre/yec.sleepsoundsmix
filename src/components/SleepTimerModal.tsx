import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, BackHandler } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import useMixerStore from '../store/useMixerStore';

const SleepTimerModal = () => {
  const { showSleepModal, setShowSleepModal } = useMixerStore();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (showSleepModal) {
      setCountdown(30);
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            const { clearMix } = useMixerStore.getState();
            clearMix();
            BackHandler.exitApp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showSleepModal]);

  if (!showSleepModal) return null;

  const handleStay = () => {
    setShowSleepModal(false);
  };

  return (
    <Modal transparent animationType="fade" visible={showSleepModal}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#1F2633', '#161B26']}
          style={styles.modalContainer}
        >
          <Text style={styles.title}>Uyudun mu?</Text>
          <Text style={styles.subtitle}>Uygulamadan çıkılıyor.</Text>

          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.8}
            onPress={handleStay}
          >
            <LinearGradient
              colors={['#EF720D', '#E05D00']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Hayır ({countdown})</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    opacity: 0.6,
    marginBottom: 40,
  },
  confirmButton: {
    width: '100%',
    height: 64,
  },
  gradientButton: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
  },
});

export default SleepTimerModal;
