import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import IconButton from './IconButton';
import {
  component,
  radius,
  spacing,
  colors,
  fontSize,
  fontFamily,
} from '../theme/tokens';
// ─── Circular progress ring ───────────────────────────────────────────────────
const CIRCLE_SIZE = component.timerRingSize;
const STROKE_WIDTH = 3;

interface TimerRingProps {
  progress: number;
  displayTime: string;
  isSleepFlowActive?: boolean;
  isSleepFlowIndefinite?: boolean;
  onCancelSleepFlow?: () => void;
}

export const TimerRing: React.FC<TimerRingProps> = React.memo(
  ({
    progress,
    displayTime,
    isSleepFlowActive,
    isSleepFlowIndefinite,
    onCancelSleepFlow,
  }) => {
    const { fontScale } = useWindowDimensions();
    const { t } = useTranslation();
    const circleSize = CIRCLE_SIZE * Math.max(1, fontScale);
    const ringRadius = (circleSize - STROKE_WIDTH) / 2;
    const circumference = 2 * Math.PI * ringRadius;
    // Never render green progress arc when in Sleep Flow mode or indefinite mode
    const actualProgress =
      isSleepFlowActive || isSleepFlowIndefinite ? 0 : progress;
    const strokeDashoffset = circumference * (1 - actualProgress);

    return (
      <View
        style={[
          ringStyles.container,
          { width: circleSize, height: circleSize },
        ]}
      >
        <Svg width={circleSize} height={circleSize} style={ringStyles.svg}>
          {/* Background track */}
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={ringRadius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress arc (only if actualProgress > 0) */}
          {actualProgress > 0 ? (
            <Circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={ringRadius}
              stroke={colors.accent.success}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${circleSize / 2}, ${circleSize / 2}`}
            />
          ) : null}
        </Svg>

        {/* Center content */}
        <View style={ringStyles.centerContent}>
          {isSleepFlowIndefinite ? (
            <IconButton
              name="xmark"
              variant="glass"
              accessibilityLabel={t('common.cancel')}
              onPress={onCancelSleepFlow}
            />
          ) : (
            <Text style={ringStyles.timeText}>{displayTime}</Text>
          )}
        </View>
      </View>
    );
  },
);

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
    color: colors.text.primary,
    fontSize: 38,
    fontWeight: 'bold',
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  indefiniteCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

// ─── Preset Button ────────────────────────────────────────────────────────────
interface TimerButtonProps {
  minutes: number;
  isActive: boolean;
  disabled?: boolean;
  onPress: (minutes: number) => void;
}

export const TimerButton: React.FC<TimerButtonProps> = React.memo(
  ({ minutes, isActive, disabled, onPress }) => {
    const { t } = useTranslation();
    const { fontScale } = useWindowDimensions();
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${minutes} ${t('timer.minutes_short')}`}
        accessibilityState={{ selected: isActive, disabled: !!disabled }}
        style={[btnStyles.cell, disabled && btnStyles.cellDisabled]}
        onPress={() => !disabled && onPress(minutes)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={
            isActive
              ? ['rgba(71, 241, 133, 0.4)', 'rgba(71, 241, 133, 0.1)']
              : ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']
          }
          style={[
            btnStyles.button,
            {
              minHeight: Math.max(
                component.touchTarget,
                44 * fontScale + spacing.lg * 2,
              ),
            },
            isActive && btnStyles.buttonActive,
            disabled && btnStyles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              btnStyles.number,
              isActive && btnStyles.numberActive,
              disabled && btnStyles.numberDisabled,
            ]}
          >
            {minutes}
          </Text>
          <Text
            style={[
              btnStyles.label,
              isActive && btnStyles.labelActive,
              disabled && btnStyles.labelDisabled,
            ]}
          >
            {t('timer.minutes_short')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  },
);

const btnStyles = StyleSheet.create({
  cell: { flex: 1, maxWidth: component.timerButtonMax },
  cellDisabled: {
    opacity: 0.35,
  },
  button: {
    width: '100%',
    aspectRatio: 1,
    paddingHorizontal: spacing.xs,
    minHeight: component.touchTarget,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonActive: {
    borderColor: '#47F185',
    borderWidth: 1.5,
  },
  buttonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  number: {
    color: colors.text.primary,
    fontSize: fontSize.large,
    fontWeight: 'bold',
    fontFamily: fontFamily.bold,
  },
  numberActive: {
    color: colors.accent.success,
  },
  numberDisabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.text.primary,
    fontSize: fontSize.tiny,
    fontFamily: fontFamily.regular,
    opacity: 0.75,
    marginTop: spacing.xs,
  },
  labelActive: {
    color: colors.accent.success,
    opacity: 0.8,
  },
  labelDisabled: {
    opacity: 0.4,
  },
});
