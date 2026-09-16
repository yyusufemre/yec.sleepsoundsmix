import { fontFamily, colors } from '../theme/tokens';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AppScreen, { ScreenScrollView } from '../layout/AppScreen';
import useMixerStore from '../store/useMixerStore';
import AppButton from '../components/AppButton';
import { TimerRing, TimerButton } from '../components/TimerControls';
import HeaderComponent from '../components/HeaderComponent';
import ActionButton from '../components/ActionButton';
import GlassToast from '../components/GlassToast';
import { layout } from '../theme/layout';
import { spacing } from '../theme/tokens';
import { useTranslation } from 'react-i18next';

// ─── Main Screen ──────────────────────────────────────────────────────────────
const TimerScreen = () => {
  const { t } = useTranslation();
  const timer = useMixerStore(state => state.timer);
  const setTimer = useMixerStore(state => state.setTimer);
  const isTimerRunning = useMixerStore(state => state.isTimerRunning);
  const toggleTimer = useMixerStore(state => state.toggleTimer);
  const stopTimer = useMixerStore(state => state.stopTimer);
  const targetTimestamp = useMixerStore(state => state.targetTimestamp);
  const isSleepFlowEnabled = useMixerStore(state => state.isSleepFlowEnabled);
  const isSleepFlowActive = useMixerStore(state => state.isSleepFlowActive);
  const setSleepFlowEnabled = useMixerStore(
    (state: any) => state.setSleepFlowEnabled,
  );
  const setSleepFlowActive = useMixerStore(
    (state: any) => state.setSleepFlowActive,
  );
  const [showSleepFlowToast, setShowSleepFlowToast] = useState(false);

  const [displayTime, setDisplayTime] = useState('00:00');
  const [progress, setProgress] = useState(0);

  const handleStartStop = React.useCallback(() => {
    if (!isTimerRunning && isSleepFlowEnabled && timer > 0) {
      setSleepFlowActive(true);
    }
    toggleTimer();
  }, [
    isTimerRunning,
    isSleepFlowEnabled,
    timer,
    toggleTimer,
    setSleepFlowActive,
  ]);

  const handleCancelSleepFlow = React.useCallback(() => {
    setSleepFlowActive(false);
    setSleepFlowEnabled(false);
    if (isTimerRunning) {
      stopTimer();
    }
  }, [setSleepFlowActive, setSleepFlowEnabled, isTimerRunning, stopTimer]);

  const handlePresetPress = React.useCallback(
    (minutes: number) => {
      if (timer === minutes) {
        stopTimer();
      } else {
        setTimer(minutes);
      }
    },
    [setTimer, timer, stopTimer],
  );

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const formatTime = (ms: number) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`;
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

    if (isTimerRunning && targetTimestamp && !isSleepFlowActive) {
      updateDisplay();
      intervalId = setInterval(updateDisplay, 1000);
    } else {
      if (timer > 0) {
        setDisplayTime(`${timer.toString().padStart(2, '0')}:00`);
      } else {
        setDisplayTime('00:00');
      }
      setProgress(0); // Progress ring is strictly 0 when not actively running a timed timer
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning, targetTimestamp, timer, isSleepFlowActive]);

  return (
    <AppScreen>
      <ScreenScrollView contentContainerStyle={styles.contentContainer}>
        {/* Fixed Header */}
        <HeaderComponent
          inset={false}
          title={t('timer.header_title')}
          subtitle={t('timer.header_subtitle')}
        />

        {/* Fixed Ring Display */}
        <View style={styles.circleSection}>
          <TimerRing
            progress={progress}
            displayTime={displayTime}
            isSleepFlowActive={isSleepFlowActive}
            isSleepFlowIndefinite={isSleepFlowActive && timer === 0}
            onCancelSleepFlow={handleCancelSleepFlow}
          />
        </View>

        {/* Sleep Flow Button — single green variation */}
        <AppButton
          title={t('timer.sleep_flow_btn')}
          icon="wind"
          variant="secondary"
          size="medium"
          onPress={() => {
            const nextActive = !isSleepFlowActive;
            setSleepFlowActive(nextActive);
            setSleepFlowEnabled(nextActive);
          }}
        />

        {/* Preset buttons grid — strictly 2 rows of 4 buttons */}
        <View style={styles.presetGrid}>
          <View style={styles.presetRow}>
            {[1, 5, 10, 20].map(time => (
              <TimerButton
                key={time}
                minutes={time}
                isActive={timer === time}
                onPress={handlePresetPress}
              />
            ))}
          </View>
          <View style={styles.presetRow}>
            {[30, 45, 60, 90].map(time => (
              <TimerButton
                key={time}
                minutes={time}
                isActive={timer === time}
                onPress={handlePresetPress}
              />
            ))}
          </View>
        </View>

        {/* Action section — only show start/stop if a timer duration > 0 is selected/running */}
        <View style={styles.actionSection}>
          {isTimerRunning ? (
            <ActionButton
              title={t('timer.stop_timer')}
              icon="stop"
              onPress={handleStartStop}
              type="danger"
              style={styles.actionBtnContainer}
            />
          ) : timer > 0 ? (
            <ActionButton
              title={t('timer.start_timer')}
              icon="play"
              onPress={handleStartStop}
              type="success"
              style={styles.actionBtnContainer}
            />
          ) : null}
        </View>
      </ScreenScrollView>

      <GlassToast
        visible={showSleepFlowToast}
        message={t('timer.sleep_flow_required_msg')}
        type="info"
        onHide={() => setShowSleepFlowToast(false)}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flexGrow: 1,
    gap: layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  presetGrid: {
    width: '100%',
    marginVertical: 2,
    gap: spacing.sm,
  },
  presetRow: {
    gap: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '100%',
  },
  actionSection: {
    width: '100%',
    height: 52,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionBtnContainer: {
    width: '100%',
    height: 52,
    minHeight: 52,
  },
  sleepFlowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(71, 241, 133, 0.15)',
    borderWidth: 1,
    borderColor: '#47F185',
    marginVertical: 6,
  },
  sleepFlowLabel: {
    color: colors.accent.success,
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
  },
});

export default TimerScreen;
