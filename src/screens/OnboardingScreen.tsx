import { spacing, fontSize, fontFamily } from '../theme/tokens';
import useReducedMotion from '../hooks/useReducedMotion';
import AppButton from '../components/AppButton';
import IconButton from '../components/IconButton';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ScrollView,
  ViewToken,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import AppScreen from '../layout/AppScreen';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accentColors: string[];
  Visual: React.FC<{ isActive: boolean }>;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

// ─── Visual: Sound Cards Grid ─────────────────────────────────────────────────
const SoundCardsVisual: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const cards = [
    { icon: 'cloud-rain', label: t('onboarding.visuals.rain') },
    { icon: 'wind', label: t('onboarding.visuals.wind') },
    { icon: 'water', label: t('onboarding.visuals.wave') },
    { icon: 'fire', label: t('onboarding.visuals.fire') },
    { icon: 'music', label: t('onboarding.visuals.music') },
    { icon: 'tree', label: t('onboarding.visuals.forest') },
  ];

  const animations = useRef(cards.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (reducedMotion) {
      animations.forEach(anim => anim.setValue(1));
      return;
    }
    if (isActive) {
      const anims = animations.map((anim, i) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: i * 100,
          useNativeDriver: true,
        }),
      );
      Animated.stagger(100, anims).start();
    } else {
      animations.forEach(anim => anim.setValue(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, reducedMotion]);

  return (
    <View style={visual1.grid}>
      {cards.map((card, i) => (
        <Animated.View
          key={card.label}
          style={[
            visual1.cardWrapper,
            {
              opacity: animations[i],
              transform: [
                {
                  scale: animations[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={
              i === 0
                ? ['rgba(71,241,133,0.18)', 'rgba(71,241,133,0.06)']
                : ['rgba(141,165,208,0.14)', 'rgba(72,84,106,0.04)']
            }
            style={[visual1.card, i === 0 && visual1.cardActive]}
          >
            <Icon
              name={card.icon}
              size={22}
              color={i === 0 ? colors.accent.success : 'rgba(255,255,255,0.55)'}
              solid
            />
            <Text style={[visual1.label, i === 0 && visual1.labelActive]}>
              {card.label}
            </Text>
            {i === 0 && <View style={visual1.activeDot} />}
          </LinearGradient>
        </Animated.View>
      ))}
    </View>
  );
};

const visual1 = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  cardWrapper: {
    width: '30%',
    maxWidth: 100,
  },
  card: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: layout.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardActive: {
    borderColor: 'rgba(71,241,133,0.3)',
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  labelActive: {
    color: colors.accent.success,
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.success,
  },
});

// ─── Visual: Mixer Sliders ────────────────────────────────────────────────────
const MixerVisual: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const [trackWidth, setTrackWidth] = useState(0);

  const tracks = [
    {
      icon: 'cloud-rain',
      label: t('onboarding.visuals.rain'),
      value: 0.72,
      color: colors.accent.success,
    },
    {
      icon: 'wind',
      label: t('onboarding.visuals.wind'),
      value: 0.3,
      color: 'rgba(255,255,255,0.5)',
    },
    {
      icon: 'fire',
      label: t('onboarding.visuals.fire'),
      value: 0.6,
      color: 'rgba(255,200,100,0.7)',
    },
  ];

  const animations = useRef(tracks.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (reducedMotion) {
      animations.forEach((anim, index) => anim.setValue(tracks[index].value));
      return;
    }
    if (isActive && trackWidth > 0) {
      const anims = animations.map((anim, i) =>
        Animated.timing(anim, {
          toValue: tracks[i].value,
          duration: 1500 + i * 500, // Slower and independent
          useNativeDriver: true, // Native driver enabled for flawless 60fps!
        }),
      );
      Animated.parallel(anims).start();
    } else if (!isActive) {
      animations.forEach(anim => anim.setValue(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, trackWidth, reducedMotion]);

  const handleTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackWidth(w);
  }, []);

  return (
    <View style={visual2.container}>
      {tracks.map((track, i) => {
        const fillTranslateX = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [-trackWidth, 0],
        });

        const thumbTranslateX = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, trackWidth],
        });

        return (
          <LinearGradient
            key={track.label}
            colors={['rgba(141,165,208,0.13)', 'rgba(72,84,106,0.04)']}
            style={visual2.row}
          >
            <Icon name={track.icon} size={16} color={track.color} solid />
            <Text style={visual2.trackLabel}>{track.label}</Text>
            <View
              style={visual2.trackBar}
              onLayout={i === 0 ? handleTrackLayout : undefined}
            >
              <View style={visual2.trackBg} />
              {trackWidth > 0 && (
                <>
                  <View style={visual2.trackFillContainer}>
                    <Animated.View
                      style={[
                        visual2.trackFill,
                        {
                          width: trackWidth,
                          backgroundColor: track.color,
                          transform: [{ translateX: fillTranslateX }],
                        },
                      ]}
                    />
                  </View>
                  <Animated.View
                    style={[
                      visual2.thumb,
                      {
                        transform: [
                          { translateX: thumbTranslateX },
                          { translateX: -7 },
                        ],
                      },
                    ]}
                  />
                </>
              )}
            </View>
          </LinearGradient>
        );
      })}
    </View>
  );
};

const visual2 = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: layout.radius.lg,
    height: 64,
    paddingVertical: 0,
    paddingHorizontal: spacing.lg,
    borderWidth: 0,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  trackLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamily.medium,
    width: 52,
  },
  trackBar: {
    flex: 1,
    height: 22,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'visible',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 8,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
  },
  trackFillContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 8,
    height: 3,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

// ─── Visual: Timer Ring ───────────────────────────────────────────────────────
const TimerVisual: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const SIZE = 160;
  const STROKE = 4;
  const R = (SIZE - STROKE) / 2;
  const CIRCUM = 2 * Math.PI * R;
  const TARGET_PROGRESS = 0.75;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    progressAnim.stopAnimation();
    pulseAnim.stopAnimation();
    if (reducedMotion || !isActive) {
      progressAnim.setValue(TARGET_PROGRESS);
      pulseAnim.setValue(1);
      return;
    }
    const entrance = Animated.timing(progressAnim, {
      toValue: TARGET_PROGRESS,
      duration: 2000,
      useNativeDriver: true,
    });
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    );
    entrance.start();
    pulse.start();
    return () => {
      entrance.stop();
      pulse.stop();
    };
  }, [isActive, reducedMotion, progressAnim, pulseAnim]);

  const dashOffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUM, 0],
  });

  return (
    <View style={visual3.wrapper}>
      <View style={visual3.container}>
        {/* Outer glow ring with pulse */}
        <Animated.View
          style={[visual3.glowRing, { transform: [{ scale: pulseAnim }] }]}
        />

        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.accent.success}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUM} ${CIRCUM}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>

        <View style={visual3.center}>
          <Text style={visual3.timeText}>13:05</Text>
          <Text style={visual3.timeLabel}>{t('timer.remaining_time')}</Text>
        </View>
      </View>

      {/* Sleep Flow pill moved below */}
      <View style={visual3.pill}>
        <Icon name="wind" size={12} color={colors.accent.success} />
        <Text style={visual3.pillText}>{t('timer.sleep_flow_btn')}</Text>
        <View style={visual3.pillDot} />
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const visual3 = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.xxxl,
  },
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(71, 241, 133, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(71, 241, 133, 0.15)',
  },
  center: {
    alignItems: 'center',
  },
  timeText: {
    color: colors.text.primary,
    fontSize: 34,
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginTop: -2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(71, 241, 133, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: layout.radius.pill,
    borderWidth: 0.5,
    borderColor: 'rgba(71, 241, 133, 0.2)',
  },
  pillText: {
    color: colors.accent.success,
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.success,
  },
});

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES: OnboardingSlide[] = [
  {
    id: 'atmosphere',
    icon: 'leaf',
    title: 'onboarding.slide1.title',
    subtitle: 'onboarding.slide1.subtitle',
    accentColors: ['rgba(71,241,133,0.12)', 'rgba(71,241,133,0.0)'],
    Visual: SoundCardsVisual,
  },
  {
    id: 'mixer',
    icon: 'sliders',
    title: 'onboarding.slide2.title',
    subtitle: 'onboarding.slide2.subtitle',
    accentColors: ['rgba(52,113,236,0.12)', 'rgba(52,113,236,0.0)'],
    Visual: MixerVisual,
  },
  {
    id: 'timer',
    icon: 'moon',
    title: 'onboarding.slide3.title',
    subtitle: 'onboarding.slide3.subtitle',
    accentColors: ['rgba(100,80,180,0.12)', 'rgba(100,80,180,0.0)'],
    Visual: TimerVisual,
  },
];

// ─── Dot indicator ────────────────────────────────────────────────────────────
const DotIndicator: React.FC<{ total: number; active: number }> = ({
  total,
  active,
}) => (
  <View style={dotStyles.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[dotStyles.dot, i === active && dotStyles.dotActive]}
      />
    ))}
  </View>
);

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent.success,
  },
});

const OnboardingSlideItem: React.FC<{
  item: OnboardingSlide;
  isActive: boolean;
  width: number;
}> = ({ item, isActive, width }) => {
  const { Visual } = item;
  const reducedMotion = useReducedMotion();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (reducedMotion) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, reducedMotion]);

  const { t } = useTranslation();
  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={slide.container}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
    >
      {/* Subtle radial accent */}
      <LinearGradient colors={item.accentColors} style={slide.radialAccent} />

      {/* Visual area */}
      <Animated.View
        style={[
          slide.visualArea,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Visual isActive={isActive} />
      </Animated.View>

      {/* Text block */}
      <View style={slide.textBlock}>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <MaskedView
            maskElement={<Text style={slide.title}>{t(item.title)}</Text>}
            style={slide.maskedView}
          >
            <LinearGradient
              colors={['#91B2DF', '#4C1E9A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[slide.title, slide.invisibleTitle]}>
                {t(item.title)}
              </Text>
            </LinearGradient>
          </MaskedView>
        </Animated.View>
        <Animated.Text
          style={[
            slide.subtitle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }],
            },
          ]}
        >
          {t(item.subtitle)}
        </Animated.Text>
      </View>
    </ScrollView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    if (pageWidth > 0)
      flatListRef.current?.scrollToOffset({
        offset: activeIndexRef.current * pageWidth,
        animated: false,
      });
  }, [pageWidth]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        activeIndexRef.current = viewableItems[0].index ?? 0;
        setActiveIndex(activeIndexRef.current);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const { t } = useTranslation();
  const isLast = activeIndex === SLIDES.length - 1;

  const renderItem = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => {
    return (
      <OnboardingSlideItem
        item={item}
        isActive={index === activeIndex}
        width={pageWidth}
      />
    );
  };

  return (
    <AppScreen
      standalone
      onLayout={event => setPageWidth(event.nativeEvent.layout.width)}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Skip */}
      {!isLast && (
        <AppButton
          title={t('onboarding.skip')}
          size="small"
          fullWidth={false}
          variant="ghost"
          style={styles.skipBtn}
          onPress={onComplete}
        />
      )}

      {/* Slides */}
      {pageWidth > 0 && (
        <FlatList
          ref={flatListRef}
          extraData={pageWidth}
          getItemLayout={(_, index) => ({
            length: pageWidth,
            offset: pageWidth * index,
            index,
          })}
          data={SLIDES}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
          style={styles.flatList}
        />
      )}

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <DotIndicator total={SLIDES.length} active={activeIndex} />

        {isLast ? (
          <AppButton
            title={t('onboarding.start')}
            fullWidth={false}
            onPress={goNext}
          />
        ) : (
          <IconButton
            name="arrow-right"
            variant="glass"
            accessibilityLabel={t('common.next')}
            onPress={goNext}
          />
        )}
      </View>
    </AppScreen>
  );
};

// ─── Slide styles ─────────────────────────────────────────────────────────────
const slide = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: layout.padding.screenHorizontal,
    paddingTop: layout.spacing.lg,
  },
  radialAccent: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 300,
    borderRadius: 200,
  },
  visualArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 220,
    marginVertical: spacing.xl,
  },
  textBlock: {
    width: '100%',
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.text.primary,
    fontSize: 36,
    fontFamily: fontFamily.bold,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  invisibleTitle: {
    opacity: 0,
  },
  maskedView: {
    width: '100%',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.small,
    fontFamily: fontFamily.light,
    lineHeight: 22,
  },
});

// ─── Root styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    marginRight: layout.padding.screenHorizontal,
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: fontSize.caption,
    fontFamily: fontFamily.regular,
  },
  flatList: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.padding.screenHorizontal,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.lg,
  },
  nextBtn: {
    borderRadius: layout.radius.pill,
    overflow: 'hidden',
  },
  nextBtnLast: {
    flex: 1,
    marginLeft: spacing.xxxl,
  },
  nextGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  startGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    borderRadius: layout.radius.pill,
  },
  startText: {
    color: '#0D1319',
    fontSize: fontSize.body,
    fontFamily: fontFamily.semiBold,
    letterSpacing: 0.3,
  },
});

export default OnboardingScreen;
