import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ViewToken,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Svg, { Circle } from 'react-native-svg';
import YecLogo from '../components/YecLogo';
import DeveloperInfoModal from '../components/DeveloperInfoModal';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const cards = [
    { icon: 'cloud-rain', label: 'Yağmur' },
    { icon: 'wind', label: 'Rüzgar' },
    { icon: 'water', label: 'Dalga' },
    { icon: 'fire', label: 'Ateş' },
    { icon: 'music', label: 'Müzik' },
    { icon: 'tree', label: 'Orman' },
  ];

  const animations = useRef(cards.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isActive) {
      const anims = animations.map((anim, i) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: i * 100,
          useNativeDriver: true,
        })
      );
      Animated.stagger(100, anims).start();
    } else {
      animations.forEach(anim => anim.setValue(0));
    }
  }, [isActive]);

  return (
    <View style={visual1.grid}>
      {cards.map((card, i) => (
        <Animated.View
          key={card.label}
          style={[
            visual1.cardWrapper,
            {
              opacity: animations[i],
              transform: [{ scale: animations[i].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
            }
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
    gap: 10,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  cardWrapper: {
    width: (SCREEN_WIDTH - layout.padding.screenHorizontal * 2 - 16 - 20) / 3,
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
    fontFamily: 'Inter-Medium',
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
  const [trackWidth, setTrackWidth] = useState(0);

  const tracks = [
    { icon: 'cloud-rain', label: 'Yağmur', value: 0.72, color: colors.accent.success },
    { icon: 'wind', label: 'Rüzgar', value: 0.30, color: 'rgba(255,255,255,0.5)' },
    { icon: 'fire', label: 'Ateş', value: 0.60, color: 'rgba(255,200,100,0.7)' },
  ];

  const animations = useRef(tracks.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isActive && trackWidth > 0) {
      const anims = animations.map((anim, i) =>
        Animated.timing(anim, {
          toValue: tracks[i].value,
          duration: 1500 + i * 500, // Slower and independent
          useNativeDriver: false, // width/left doesn't support native driver easily here
        })
      );
      Animated.parallel(anims).start();
    } else if (!isActive) {
      animations.forEach(anim => anim.setValue(0));
    }
  }, [isActive, trackWidth]);

  const handleTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    <View style={visual2.container}>
      {tracks.map((track, i) => {
        const fillWidth = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, trackWidth],
        });
        const thumbLeft = animations[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, trackWidth - 14],
        });

        return (
          <LinearGradient
            key={track.label}
            colors={['rgba(141,165,208,0.13)', 'rgba(72,84,106,0.04)']}
            style={visual2.row}
          >
            <Icon name={track.icon} size={16} color={track.color} solid />
            <Text style={visual2.trackLabel}>{track.label}</Text>
            <View style={visual2.trackBar} onLayout={handleTrackLayout}>
              <View style={visual2.trackBg} />
              {trackWidth > 0 && (
                <>
                  <Animated.View
                    style={[visual2.trackFill, { width: fillWidth, backgroundColor: track.color }]}
                  />
                  <Animated.View style={[visual2.thumb, { left: thumbLeft }]} />
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
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: layout.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  trackLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    width: 48,
  },
  trackBar: {
    flex: 1,
    height: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  trackBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 3,
    borderRadius: 2,
    opacity: 0.85,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    marginTop: -5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

// ─── Visual: Timer Ring ───────────────────────────────────────────────────────
const TimerVisual: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const SIZE = 160;
  const STROKE = 4;
  const R = (SIZE - STROKE) / 2;
  const CIRCUM = 2 * Math.PI * R;
  const TARGET_PROGRESS = 0.75;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      // 1. Progress ring entrance
      Animated.timing(progressAnim, {
        toValue: TARGET_PROGRESS,
        duration: 2000,
        useNativeDriver: true,
      }).start();

      // 2. Loop pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 2500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      progressAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const dashOffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUM, 0],
  });

  return (
    <View style={visual3.wrapper}>
      <View style={visual3.container}>
        {/* Outer glow ring with pulse */}
        <Animated.View style={[visual3.glowRing, { transform: [{ scale: pulseAnim }] }]} />

        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
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
          <Text style={visual3.timeLabel}>kalan süre</Text>
        </View>
      </View>

      {/* Sleep Flow pill moved below */}
      <View style={visual3.pill}>
        <Icon name="wind" size={12} color={colors.accent.success} />
        <Text style={visual3.pillText}>Uyku Akışı Moduna Geç</Text>
        <View style={visual3.pillDot} />
      </View>
    </View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const visual3 = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 32,
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
    color: '#FFFFFF',
    fontSize: 34,
    fontFamily: 'Inter-Bold',
    letterSpacing: 1,
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: -2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(71, 241, 133, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: layout.radius.pill,
    borderWidth: 0.5,
    borderColor: 'rgba(71, 241, 133, 0.2)',
  },
  pillText: {
    color: colors.accent.success,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
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
    title: 'Huzuru kendi\ntarzınla kur',
    subtitle: 'Doğadan ve hayatın içinden sevdiğin sesleri bir araya getir, sana en iyi gelen atmosferi yarat.',
    accentColors: ['rgba(71,241,133,0.12)', 'rgba(71,241,133,0.0)'],
    Visual: SoundCardsVisual,
  },
  {
    id: 'mixer',
    icon: 'sliders',
    title: 'Mükemmel dengeni\nkolayca bul',
    subtitle: 'Her sesin seviyesini dilediğin gibi ayarla, senin için en doğru huzur katmanlarını yakala.',
    accentColors: ['rgba(52,113,236,0.12)', 'rgba(52,113,236,0.0)'],
    Visual: MixerVisual,
  },
  {
    id: 'timer',
    icon: 'moon',
    title: 'Zihnini uyku\nakışına teslim et',
    subtitle: 'Sleep Flow moduyla her şey sadeleşir. Gecenin huzurlu ritmine kapıl ve derin bir dinlenmenin seni sarmasına izin ver.',
    accentColors: ['rgba(100,80,180,0.12)', 'rgba(100,80,180,0.0)'],
    Visual: TimerVisual,
  },
];

// ─── Dot indicator ────────────────────────────────────────────────────────────
const DotIndicator: React.FC<{ total: number; active: number }> = ({ total, active }) => (
  <View style={dotStyles.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          dotStyles.dot,
          i === active && dotStyles.dotActive,
        ]}
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

const OnboardingSlideItem: React.FC<{ item: OnboardingSlide; isActive: boolean }> = ({ item, isActive }) => {
  const { Visual } = item;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
  }, [isActive]);

  return (
    <View style={slide.container}>
      {/* Subtle radial accent */}
      <LinearGradient
        colors={item.accentColors}
        style={slide.radialAccent}
      />

      {/* Visual area */}
      <Animated.View style={[slide.visualArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Visual isActive={isActive} />
      </Animated.View>

      {/* Text block */}
      <View style={slide.textBlock}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <MaskedView
            maskElement={<Text style={slide.title}>{item.title}</Text>}
            style={slide.maskedView}
          >
            <LinearGradient
              colors={['#91B2DF', '#4C1E9A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[slide.title, { opacity: 0 }]}>{item.title}</Text>
            </LinearGradient>
          </MaskedView>
        </Animated.View>
        <Animated.Text style={[slide.subtitle, { opacity: fadeAnim, transform: [{ translateY: Animated.multiply(slideAnim, 1.2) }] }]}>
          {item.subtitle}
        </Animated.Text>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDevModal, setShowDevModal] = useState(false);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onComplete();
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;

  const renderItem = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return <OnboardingSlideItem item={item} isActive={index === activeIndex} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={onComplete} activeOpacity={0.6}>
          <Text style={styles.skipText}>Geç</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <DotIndicator total={SLIDES.length} active={activeIndex} />

        <TouchableOpacity
          style={[styles.nextBtn, isLast && styles.nextBtnLast]}
          onPress={goNext}
          activeOpacity={0.8}
        >
          {isLast ? (
            <LinearGradient
              colors={['rgba(71,241,133,0.9)', 'rgba(55,200,105,0.9)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startGradient}
            >
              <Text style={styles.startText}>Başla</Text>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
              style={styles.nextGradient}
            >
              <Icon name="arrow-right" size={16} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>

      {/* YEC Logo at the very bottom - only on last slide */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: activeIndex === SLIDES.length - 1 ? 1 : 0,
            transform: [{ translateY: activeIndex === SLIDES.length - 1 ? 0 : 10 }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => setShowDevModal(true)}
          activeOpacity={0.7}
        >
          <YecLogo width={48} height={32} fill="rgba(255,255,255,0.12)" />
        </TouchableOpacity>
      </Animated.View>

      <DeveloperInfoModal
        isVisible={showDevModal}
        onClose={() => setShowDevModal(false)}
      />
    </SafeAreaView>
  );
};

// ─── Slide styles ─────────────────────────────────────────────────────────────
const slide = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: layout.padding.screenHorizontal,
    paddingTop: 56,
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
    maxHeight: 320,
  },
  textBlock: {
    width: '100%',
    gap: 10,
    paddingBottom: 16,
  },
  title: {
    color: colors.text.primary,
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  maskedView: {
    height: 96,
    width: '100%',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    fontFamily: 'Inter-Light',
    lineHeight: 22,
  },
});

// ─── Root styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: layout.padding.screenHorizontal,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  flatList: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.padding.screenHorizontal,
    paddingBottom: 32,
    paddingTop: 16,
  },
  nextBtn: {
    borderRadius: layout.radius.pill,
    overflow: 'hidden',
  },
  nextBtnLast: {
    flex: 1,
    marginLeft: 32,
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
    paddingHorizontal: 32,
    borderRadius: layout.radius.pill,
  },
  startText: {
    color: '#0D1319',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 0.3,
  },
  logoContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
});

export default OnboardingScreen;
