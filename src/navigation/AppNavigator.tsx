import AppText from '../components/AppText';
import useReducedMotion from '../hooks/useReducedMotion';
import React, { useEffect, useRef } from 'react';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Animated, Easing, StyleSheet, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import AppTabBar from '../layout/AppTabBar';
import { colors, component, spacing, fontFamily } from '../theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassBlur from '../components/GlassBlur';

const Tab = createBottomTabNavigator();

const getLibraryScreen = () => require('../screens/LibraryScreen').default;
const getTimerScreen = () => require('../screens/TimerScreen').default;
const getMixerScreen = () => require('../screens/MixerScreen').default;
const getPresetsScreen = () => require('../screens/PresetsScreen').default;
const getSettingsScreen = () => require('../screens/SettingsScreen').default;

const AnimatedTabIcon = ({ name, color, size, focused, routeName }: any) => {
  const reducedMotion = useReducedMotion();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {animatedValue.setValue(0); return;} 
    if (focused) {
      // Trigger animation when focused
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.spring(animatedValue, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset when not focused
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [animatedValue, focused, reducedMotion]);

  // Define specific transformations based on routeName
  const getTransform = () => {
    switch (routeName) {
      case 'Library': // Music bounce
        return [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.2, 1.1],
            }),
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -2],
            }),
          },
        ];
      case 'Timer': // Clock rotate-shake
        return [
          {
            rotate: animatedValue.interpolate({
              inputRange: [0, 0.2, 0.5, 0.8, 1],
              outputRange: ['0deg', '15deg', '-15deg', '10deg', '0deg'],
            }),
          },
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.15],
            }),
          },
        ];
      case 'Mixer': // Sliders scale
        return [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2],
            }),
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, -4, 0],
            }),
          },
        ];
      case 'Presets': // Magic scale & pulse
        return [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.3, 1.1],
            }),
          },
        ];
      case 'Settings': // Gear rotate
        return [
          {
            rotate: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '90deg'],
            }),
          },
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          },
        ];
      default:
        return [{ scale: 1 }];
    }
  };

  return (
    <Animated.View style={{ transform: getTransform() }}>
      <Icon name={name} size={size} color={color} solid />
    </Animated.View>
  );
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const getTabBarIcon = (
  routeName: string,
  color: string,
  size: number,
  focused: boolean,
) => {
  let iconName = 'music';
  if (routeName === 'Library') iconName = 'music';
  else if (routeName === 'Timer') iconName = 'clock';
  else if (routeName === 'Mixer') iconName = 'sliders';
  else if (routeName === 'Presets') iconName = 'wand-magic-sparkles';
  else if (routeName === 'Settings') iconName = 'gear';

  return (
    <AnimatedTabIcon
      name={iconName}
      color={color}
      size={Math.round(size * 0.75)}
      focused={focused}
      routeName={routeName}
    />
  );
};

const renderTabLabel = ({color, children}: {color: string; children: string}) => <AppText color={color} align="center" variant="tiny" style={tabLabelStyle}>{children}</AppText>;
const tabLabelStyle = {fontSize: component.tabLabelSize, lineHeight: 14};

const renderAppTabBar = (props: BottomTabBarProps) => <AppTabBar {...props} />;

const TabBarBackground = () => <GlassBlur fallbackColor={colors.navigation.background} />;

const AppNavigator = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();

  return (
    <NavigationContainer theme={navTheme}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Tab.Navigator
          tabBar={renderAppTabBar}
          screenOptions={({ route }) => ({
            headerShown: false,
            sceneStyle: {
              backgroundColor: 'transparent',
            },
            tabBarStyle: {
              backgroundColor: 'rgba(25, 32, 43, 0.75)',
              borderTopWidth: 0,
              elevation: 0,
              height: Math.max(component.tabBarMinHeight, 40 + 28 * fontScale) + insets.bottom,
              paddingBottom: Math.max(insets.bottom, spacing.sm),
              paddingTop: spacing.sm,
            },
            tabBarBackground: TabBarBackground,
            tabBarLabelPosition: 'below-icon',
            tabBarLabel: renderTabLabel,
            tabBarActiveTintColor: colors.text.primary,
            tabBarInactiveTintColor: colors.navigation.inactiveIcon,
            tabBarLabelStyle: {
              fontSize: component.tabLabelSize,
              fontFamily: fontFamily.medium,
              fontWeight: '500',
              marginTop: 6,
            },
            tabBarIconStyle: {
              marginBottom: 0,
            },
            tabBarIcon: ({ color, size, focused }) =>
              getTabBarIcon(route.name, color, size, focused),
          })}
        >
          <Tab.Screen
            name="Library"
            getComponent={getLibraryScreen}
            options={{ title: t('navigation.library') }}
          />
          <Tab.Screen
            name="Timer"
            getComponent={getTimerScreen}
            options={{ title: t('navigation.timer') }}
          />
          <Tab.Screen
            name="Mixer"
            getComponent={getMixerScreen}
            options={{ title: t('navigation.mixer') }}
          />
          <Tab.Screen
            name="Presets"
            getComponent={getPresetsScreen}
            options={{ title: t('navigation.presets') }}
          />
          <Tab.Screen
            name="Settings"
            getComponent={getSettingsScreen}
            options={{ title: t('navigation.settings') }}
          />
        </Tab.Navigator>
      </KeyboardAvoidingView>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;
