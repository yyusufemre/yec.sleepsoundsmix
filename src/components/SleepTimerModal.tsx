import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, BackHandler } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GlassBlur from './GlassBlur';
import Icon from 'react-native-vector-icons/FontAwesome6';
import useMixerStore from '../store/useMixerStore';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

const SleepTimerModal = () => {
  const showSleepModal = useMixerStore(state => state.showSleepModal);
  const setShowSleepModal = useMixerStore(state => state.setShowSleepModal);
  const [countdown, setCountdown] = useState(30);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didExitRef = useRef(false);

  // 1. Manage countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (showSleepModal) {
      setCountdown(30);
      didExitRef.current = false;
      
      interval = setInterval(() => {
        setCountdown((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      // We DON'T clear exitTimeoutRef here because we want it to fire 
      // even after the modal starts hiding (which triggers this cleanup).
    };
  }, [showSleepModal]);

  // 2. Handle side effects when countdown reaches 0
  useEffect(() => {
    if (!showSleepModal || countdown > 0 || didExitRef.current) return;

    didExitRef.current = true;

    // Get actions directly from store to ensure we are not in a render hook context
    const { clearMix, setShowSleepModal: hideModal } = useMixerStore.getState();
    
    // Clear the mix and close app
    clearMix();
    hideModal(false);
    
    // Use a small delay for BackHandler to ensure state updates are flushed
    exitTimeoutRef.current = setTimeout(() => {
      BackHandler.exitApp();
    }, 100);
  }, [showSleepModal, countdown]);

  const handleStay = () => {
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    didExitRef.current = false;
    setShowSleepModal(false);
  };

  if (!showSleepModal) return null;

  return (
    <Modal transparent animationType="fade" visible={showSleepModal}>
      <GlassBlur
        style={styles.overlay}
        blurAmount={12}
        fallbackColor="rgba(0,0,0,0.85)"
      >
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Icon name="moon" size={22} color={colors.accent.success} solid />
          </View>

          {/* Text */}
          <Text style={styles.title}>Uyudun mu?</Text>
          <Text style={styles.subtitle}>
            Uygulama {countdown} saniye içinde kapanacak.
          </Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(countdown / 30) * 100}%` as any }]} />
          </View>

          {/* Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStay}
            style={styles.btnWrapper}
          >
            <LinearGradient
              colors={colors.accent.orangeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Icon name="hand" size={14} color="#fff" solid />
              <Text style={styles.btnText}>Hayır, Uyanığım</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GlassBlur>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.background.modal,
    borderRadius: layout.radius.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: layout.spacing.xl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(71, 241, 133, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: layout.spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: layout.spacing.lg,
    lineHeight: 18,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginBottom: layout.spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.success,
    borderRadius: 2,
  },
  btnWrapper: {
    width: '100%',
    height: 48,
  },
  btn: {
    flex: 1,
    borderRadius: layout.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: colors.text.primary,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
});

export default SleepTimerModal;
