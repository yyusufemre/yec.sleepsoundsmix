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
  const stopTimer = useMixerStore(state => state.stopTimer);

  const [words, setWords] = useState<{ id: number, text: string }[]>([]);
  const [showControls, setShowControls] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
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

  const handleStop = () => {
    stopTimer();
    setSleepFlowActive(false);
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
      <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]} pointerEvents="none">
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
        style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
        onPress={handleScreenPress}
      >
        {showControls && (
          <View style={styles.controlsContainer}>
            <View style={styles.header}>
              <View style={{ width: 44 }} />
              <Text style={styles.timerText}>{remainingTime}</Text>
              <TouchableOpacity
                onPress={() => setSleepFlowActive(false)}
                style={styles.closeButton}
              >
                <Icon name="xmark" size={24} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.stopBtn}
                onPress={handleStop}
              >
                <Text style={styles.stopBtnText}>Zamanlayıcıyı Durdur</Text>
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
  touchArea: {
    flex: 1,
  },
  wordsLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
    elevation: 1,
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
  controlsContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stopBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
});

export default SleepFlowOverlay;
