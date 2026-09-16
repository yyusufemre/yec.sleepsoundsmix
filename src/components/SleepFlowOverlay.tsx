import { spacing, fontSize, fontFamily, colors } from '../theme/tokens';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from './IconButton';
import useReducedMotion from '../hooks/useReducedMotion';
import useMixerStore from '../store/useMixerStore';

import { useTranslation } from 'react-i18next';

const DriftingWord = ({
  word,
  onFinished,
}: {
  word: string;
  onFinished: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0.1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const onFinishedRef = useRef(onFinished);
  const screenW = Dimensions.get('window').width;
  const screenH = Dimensions.get('window').height;

  const [position] = useState({
    left: Math.random() * (screenW - 120) + 40,
    top: Math.random() * (screenH - 150) + 50,
  });

  const [fontStyle] = useState(() => {
    const weights = ['300', '500', '700'];
    const families = ['Inter-Light', 'Inter-Medium', 'Inter-Bold'];
    const randomIndex = Math.floor(Math.random() * weights.length);
    const isItalic = Math.random() > 0.7;

    return {
      fontWeight: weights[randomIndex] as any,
      fontFamily: families[randomIndex],
      fontStyle: isItalic ? ('italic' as const) : ('normal' as const),
      fontSize: 8 + Math.random() * 16, // Random size between 8 and 24
    };
  });

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const animation = Animated.sequence([
      // Fade in (1s)
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Stay (1s) - we can use delay or just a static timing with same value
      Animated.delay(1000),
      // Fade out (1s)
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    // Drift slowly downwards during the whole 3s
    Animated.timing(slideAnim, {
      toValue: 40, // Move downwards
      duration: 3000,
      useNativeDriver: true,
    }).start();

    animation.start(({ finished }) => {
      if (finished) onFinishedRef.current();
    });

    return () => {
      animation.stop();
    };
  }, [fadeAnim, slideAnim]);

  return (
    <View
      style={[styles.wordContainer, { left: position.left, top: position.top }]}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={[styles.word, fontStyle]}>{word}</Text>
      </Animated.View>
    </View>
  );
};

const SleepFlowOverlay = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'en';
  const currentWords = useMemo(() => {
    const words = i18n.getResource(
      currentLanguage,
      'translation',
      'sleep_flow.words',
    );
    return Array.isArray(words) ? words : [];
  }, [i18n, currentLanguage]);

  const insets = useSafeAreaInsets();
  const setSleepFlowActive = useMixerStore(state => state.setSleepFlowActive);
  const targetTimestamp = useMixerStore(state => state.targetTimestamp);
  const timer = useMixerStore(state => state.timer);
  const isTimerRunning = useMixerStore(state => state.isTimerRunning);
  const reducedMotion = useReducedMotion();

  const hasTimer = Boolean(isTimerRunning && targetTimestamp && timer > 0);

  const [words, setWords] = useState<{ id: number; text: string }[]>([]);
  const [showControls, setShowControls] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [remainingRatio, setRemainingRatio] = useState(1);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordIdCounter = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setWords([]);
      return;
    }
    // Add a new word every few seconds
    const interval = setInterval(() => {
      wordIdCounter.current += 1;
      const newWord =
        currentWords[Math.floor(Math.random() * currentWords.length)];
      if (newWord) {
        setWords(prev => [
          ...prev,
          { id: wordIdCounter.current, text: newWord },
        ]);
      }
    }, 2000); // More frequent words to allow overlapping and a continuous flow

    return () => clearInterval(interval);
  }, [currentWords, reducedMotion]);

  useEffect(() => {
    const updateTime = () => {
      if (!hasTimer || !targetTimestamp) {
        setRemainingTime('');
        setRemainingRatio(0);
        return;
      }
      const diff = targetTimestamp - Date.now();
      const total = (timer || 1) * 60000;
      if (diff <= 0) {
        setRemainingTime('00:00');
        setRemainingRatio(0);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setRemainingTime(
          `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
        );
        setRemainingRatio(Math.min(1, Math.max(0, diff / total)));
      }
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, [hasTimer, targetTimestamp, timer]);

  const handleScreenPress = () => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    } else {
      setShowControls(true);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      controlsTimer.current = setTimeout(() => setShowControls(false), 5000);
    }
  };

  const removeWord = (id: number) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* 1. Words Layer */}
      <View style={styles.wordsLayer} pointerEvents="none">
        {words.map(word => (
          <DriftingWord
            key={word.id}
            word={word.text}
            onFinished={() => removeWord(word.id)}
          />
        ))}
      </View>

      {/* 2. Interaction Layer */}
      <Pressable style={styles.pressableLayer} onPress={handleScreenPress}>
        {(showControls || reducedMotion) && (
          <View
            style={[
              styles.bottomPanel,
              { paddingBottom: Math.max(insets.bottom, 20) + 20 },
            ]}
          >
            {/* Subtle background for visibility */}
            <View style={styles.panelBg} />

            {/* Progress bar — only shown when timer is active */}
            {hasTimer && (
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${remainingRatio * 100}%` },
                  ]}
                />
              </View>
            )}

            {/* Row: time left + close */}
            <View
              style={[
                styles.controlsRow,
                !hasTimer && styles.controlsRowNoTimer,
              ]}
            >
              {hasTimer ? (
                <Text style={styles.timerText}>{remainingTime}</Text>
              ) : null}
              <IconButton
                name="xmark"
                accessibilityLabel={t('common.close')}
                onPress={event => {
                  event.stopPropagation();
                  setSleepFlowActive(false);
                }}
              />
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  wordsLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  pressableLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
  wordContainer: {
    position: 'absolute',
  },
  word: {
    color: colors.text.primary,
    fontSize: 24,
    fontFamily: fontFamily.light,
    letterSpacing: 2,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  panelBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  progressTrack: {
    width: '100%',
    height: 3, // Slightly thicker
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#47F185', // Match brand success color for better visibility
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  controlsRowNoTimer: {
    justifyContent: 'flex-end',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  timerText: {
    color: colors.text.primary, // Full white for max contrast
    fontSize: fontSize.body,
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
  },
});

export default SleepFlowOverlay;
