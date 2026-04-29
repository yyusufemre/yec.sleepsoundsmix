import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Pressable,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import useMixerStore from '../store/useMixerStore';

import { PEACEFUL_WORDS } from '../data/sleepFlowWords';

const DriftingWord = ({ word, onFinished }: { word: string, onFinished: () => void }) => {
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
      fontStyle: isItalic ? 'italic' as const : 'normal' as const,
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
      })
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
      style={[
        styles.wordContainer,
        { left: position.left, top: position.top }
      ]}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <Text style={[styles.word, fontStyle]}>{word}</Text>
      </Animated.View>
    </View>
  );
};

const SleepFlowOverlay = () => {
  const setSleepFlowActive = useMixerStore(state => state.setSleepFlowActive);
  const targetTimestamp = useMixerStore(state => state.targetTimestamp);
  const timer = useMixerStore(state => state.timer);
  const stopTimer = useMixerStore(state => state.stopTimer);

  const [words, setWords] = useState<{ id: number, text: string }[]>([]);
  const [showControls, setShowControls] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [remainingRatio, setRemainingRatio] = useState(1);
  const totalMsRef = useRef<number>(0);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordIdCounter = useRef(0);

  useEffect(() => {
    // Add a new word every few seconds
    const interval = setInterval(() => {
      wordIdCounter.current += 1;
      const newWord = PEACEFUL_WORDS[Math.floor(Math.random() * PEACEFUL_WORDS.length)];
      if (newWord) {
        setWords(prev => [
          ...prev,
          { id: wordIdCounter.current, text: newWord }
        ]);
      }
    }, 2000); // More frequent words to allow overlapping and a continuous flow

    return () => clearInterval(interval);
  }, []);

  // Set total duration once on mount from the store's timer value (minutes)
  useEffect(() => {
    if (timer > 0) totalMsRef.current = timer * 60 * 1000;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const updateTime = () => {
      if (!targetTimestamp) return;
      const diff = targetTimestamp - Date.now();
      if (diff <= 500) {
        stopTimer();
        setSleepFlowActive(false);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setRemainingTime(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        const total = totalMsRef.current > 0 ? totalMsRef.current : diff;
        setRemainingRatio(Math.min(1, Math.max(0, diff / total)));
      }
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, [setSleepFlowActive, stopTimer, targetTimestamp]);

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

  const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

  return (
    <View style={[styles.container, { width: screenWidth, height: screenHeight }]}>
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
      <Pressable
        style={styles.pressableLayer}
        onPress={handleScreenPress}
      >
        {showControls && (
          <View style={styles.bottomPanel}>
            {/* Progress bar — full width, minimal */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${remainingRatio * 100}%` }]} />
            </View>

            {/* Row: time left + close */}
            <View style={styles.controlsRow}>
              <Text style={styles.timerText}>{remainingTime}</Text>
              <TouchableOpacity
                onPress={() => setSleepFlowActive(false)}
                style={styles.closeButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Icon name="xmark" size={18} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000ff',
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
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter-Light',
    letterSpacing: 2,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
    zIndex: 2,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    letterSpacing: 1,
  },
});

export default SleepFlowOverlay;
