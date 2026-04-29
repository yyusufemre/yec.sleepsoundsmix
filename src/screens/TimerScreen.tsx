import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import useMixerStore from '../store/useMixerStore';
import Icon from 'react-native-vector-icons/FontAwesome6';
import HeaderComponent from '../components/HeaderComponent';
import ActionButton from '../components/ActionButton';

// ─── Circular progress ring ───────────────────────────────────────────────────
const CIRCLE_SIZE = 128;
const STROKE_WIDTH = 3;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface TimerRingProps {
  progress: number;
  displayTime: string;
}

const TimerRing: React.FC<TimerRingProps> = React.memo(({ progress, displayTime }) => {
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={ringStyles.container}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={ringStyles.svg}>
        {/* Background track */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke="#47F185"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
        />
      </Svg>

      {/* Center text */}
      <View style={ringStyles.centerContent}>
        <Text style={ringStyles.timeText}>{displayTime}</Text>
      </View>
    </View>
  );
});

const ringStyles = StyleSheet.create({
  container: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
});

// ─── Glassmorphism preset button ──────────────────────────────────────────────
interface TimerButtonProps {
  minutes: number;
  isActive: boolean;
  onPress: (minutes: number) => void;
}

const TimerButton: React.FC<TimerButtonProps> = React.memo(({ minutes, isActive, onPress }) => (
  <TouchableOpacity onPress={() => onPress(minutes)} activeOpacity={0.7}>
    <LinearGradient
      colors={
        isActive
          ? ['rgba(71, 241, 133, 0.4)', 'rgba(71, 241, 133, 0.1)']
          : ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']
      }
      style={[btnStyles.button, isActive && btnStyles.buttonActive]}
    >
      <Text style={[btnStyles.number, isActive && btnStyles.numberActive]}>{minutes}</Text>
      <Text style={[btnStyles.label, isActive && btnStyles.labelActive]}>DK</Text>
    </LinearGradient>
  </TouchableOpacity>
));

const btnStyles = StyleSheet.create({
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonActive: {
    borderColor: '#47F185',
    borderWidth: 1.5,
  },
  number: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  numberActive: {
    color: '#47F185',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    opacity: 0.4,
  },
  labelActive: {
    color: '#47F185',
    opacity: 0.8,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const PRESET_TIMES = [1, 5, 10, 20, 30, 45, 60, 90];

const TimerScreen = () => {
  const activeSounds = useMixerStore((state: any) => state.activeSounds);
  const timer = useMixerStore(state => state.timer);
  const setTimer = useMixerStore(state => state.setTimer);
  const isTimerRunning = useMixerStore(state => state.isTimerRunning);
  const toggleTimer = useMixerStore(state => state.toggleTimer);
  const targetTimestamp = useMixerStore(state => state.targetTimestamp);
  const isSleepFlowEnabled = useMixerStore(state => state.isSleepFlowEnabled);
  const setSleepFlowEnabled = useMixerStore(state => state.setSleepFlowEnabled);
  const isSleepFlowActive = useMixerStore(state => state.isSleepFlowActive);
  const setSleepFlowActive = useMixerStore(state => state.setSleepFlowActive);

  useFocusEffect(
    React.useCallback(() => {
      // If timer is NOT running, reset the selection when entering the page
      if (!isTimerRunning) {
        setTimer(0);
      }
    }, [isTimerRunning, setTimer])
  );
  const [displayTime, setDisplayTime] = useState('00:00');
  const [progress, setProgress] = useState(0);

  const handleStartStop = React.useCallback(() => {
    if (!isTimerRunning && isSleepFlowEnabled && timer > 0) {
      setSleepFlowActive(true);
    }
    toggleTimer();
  }, [isTimerRunning, isSleepFlowEnabled, timer, toggleTimer, setSleepFlowActive]);

  const handlePresetPress = React.useCallback((minutes: number) => {
    setTimer(minutes);
  }, [setTimer]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const formatTime = (ms: number) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const updateDisplay = () => {
      if (!isTimerRunning || !targetTimestamp) return;
      const remainingMs = targetTimestamp - Date.now();
      const totalMs = (timer || 1) * 60000;

      if (remainingMs <= 0) {
        setDisplayTime('00:00');
        setProgress(0);
      } else {
        setDisplayTime(formatTime(remainingMs));
        setProgress(Math.min(1, Math.max(0, remainingMs / totalMs)));
      }
    };

    if (isTimerRunning && targetTimestamp) {
      updateDisplay();
      intervalId = setInterval(updateDisplay, 1000);
    } else {
      if (timer > 0) {
        setDisplayTime(`${timer.toString().padStart(2, '0')}:00`);
        setProgress(1);
      } else {
        setDisplayTime('00:00');
        setProgress(0);
      }
    }

    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isTimerRunning, targetTimestamp, timer]);

  const dynamicPadding = Object.keys(activeSounds || {}).length > 0 ? 170 : 100;

  return (
    <View style={[styles.container, { paddingBottom: dynamicPadding }]}>
      <HeaderComponent
        title="Huzuru Zamanla"
        subtitle="Uykuya dalarken seslerin ne zaman duracağını belirleyin, enerjinizi koruyun."
      />

      {/* Circle */}
      <View style={styles.circleSection}>
        <TimerRing progress={progress} displayTime={displayTime} />
      </View>

      {/* Sleep Flow Toggle — pill button */}
      <TouchableOpacity
        style={[
          styles.sleepFlowBtn,
          timer > 0 && isSleepFlowEnabled && styles.sleepFlowBtnActive,
          timer === 0 && styles.sleepFlowBtnDisabled,
        ]}
        onPress={() => {
          if (timer === 0) return;
          if (isSleepFlowEnabled) {
            setSleepFlowActive(true);
          } else {
            setSleepFlowEnabled(true);
          }
        }}
        disabled={timer === 0}
        activeOpacity={timer > 0 ? 0.75 : 1}
      >
        <Icon
          name="wind"
          size={14}
          color={timer > 0 && isSleepFlowEnabled ? '#47F185' : 'rgba(255,255,255,0.35)'}
        />
        <Text style={[
          styles.sleepFlowLabel,
          timer > 0 && isSleepFlowEnabled && styles.sleepFlowLabelActive,
        ]}>
          Uyku Akışı Modu
        </Text>
        {/* State indicator dot */}
        <View style={[
          styles.sleepFlowDot,
          timer > 0 && isSleepFlowEnabled && styles.sleepFlowDotActive,
        ]} />
      </TouchableOpacity>

      {/* Preset buttons grid */}
      <View style={styles.presetGrid}>
        {PRESET_TIMES.map(t => (
          <TimerButton
            key={t}
            minutes={t}
            isActive={timer === t}
            onPress={handlePresetPress}
          />
        ))}
      </View>

      {/* Action section — always rendered to avoid layout shift */}
      <View style={styles.actionSection}>
        <View style={styles.actionBtnWrapper}>
          {(timer > 0 || isTimerRunning) && (
            <ActionButton
              title={isTimerRunning ? 'Zamanlayıcıyı Durdur' : 'Zamanlayıcıyı Başlat'}
              icon={isTimerRunning ? 'stop' : 'play'}
              onPress={handleStartStop}
              type={isTimerRunning ? 'danger' : 'success'}
              disabled={timer === 0}
              style={styles.actionBtnContainer}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
  },
  circleSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
  },
  actionBtnWrapper: {
    width: '100%',
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
  },
  actionBtnContainer: {
    width: '90%',
    height: 56,
  },
  reEnterWrapper: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  actionButton: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  sleepFlowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sleepFlowBtnActive: {
    backgroundColor: 'rgba(71, 241, 133, 0.1)',
  },
  sleepFlowBtnDisabled: {
    opacity: 0.4,
  },
  sleepFlowLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  sleepFlowLabelActive: {
    color: '#47F185',
  },
  sleepFlowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 2,
  },
  sleepFlowDotActive: {
    backgroundColor: '#47F185',
  },
  reEnterFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 15,
    backgroundColor: 'rgba(71, 241, 133, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reEnterText: {
    color: '#47F185',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
});

export default TimerScreen;
