import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import LibraryScreen from '../screens/LibraryScreen';
import MixerScreen from '../screens/MixerScreen';
import TimerScreen from '../screens/TimerScreen';
import PresetsScreen from '../screens/PresetsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MiniPlayer from '../components/MiniPlayer';
import GlassBlur from '../components/GlassBlur';

const Tab = createBottomTabNavigator();

const AnimatedTabIcon = ({ name, color, size, focused, routeName }: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, [animatedValue, focused]);

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

const AppNavigator = () => {
  return (
    <NavigationContainer theme={navTheme}>
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            sceneStyle: {
              backgroundColor: 'transparent',
            },
            tabBarStyle: {
              backgroundColor: 'rgba(25, 32, 43, 0.75)',
              borderTopWidth: 0,
              elevation: 0,
              height: 80,
              paddingBottom: 20,
              paddingTop: 10,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            },
            tabBarBackground: () => (
              <GlassBlur fallbackColor="#19202B" />
            ),
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.2)',
            tabBarLabelStyle: {
              fontSize: 11,
              fontFamily: 'Inter-Medium',
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
            component={LibraryScreen}
            options={{ tabBarLabel: 'Tüm Sesler' }}
          />
          <Tab.Screen
            name="Timer"
            component={TimerScreen}
            options={{ tabBarLabel: 'Zamanla' }}
          />
          <Tab.Screen
            name="Mixer"
            component={MixerScreen}
            options={{ tabBarLabel: 'Mixle' }}
          />
          <Tab.Screen
            name="Presets"
            component={PresetsScreen}
            options={{ tabBarLabel: 'Hazır Mix' }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ tabBarLabel: 'Ayarlar' }}
          />
        </Tab.Navigator>
        <MiniPlayer />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;
