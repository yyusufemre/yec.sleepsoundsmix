import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { Animated, Easing, View } from 'react-native';

import LibraryScreen from '../screens/LibraryScreen';
import MixerScreen from '../screens/MixerScreen';
import TimerScreen from '../screens/TimerScreen';
import PresetsScreen from '../screens/PresetsScreen';
import SettingsScreen from '../screens/SettingsScreen';

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
        })
      ]).start();
    } else {
      // Reset when not focused
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [focused]);

  // Define specific transformations based on routeName
  const getTransform = () => {
    switch (routeName) {
      case 'Library': // Music bounce
        return [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.2, 1.1],
            })
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -2],
            })
          }
        ];
      case 'Timer': // Clock rotate-shake
        return [
          {
            rotate: animatedValue.interpolate({
              inputRange: [0, 0.2, 0.5, 0.8, 1],
              outputRange: ['0deg', '15deg', '-15deg', '10deg', '0deg'],
            })
          },
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.15],
            })
          }
        ];
      case 'Mixer': // Sliders scale
        return [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2],
            })
          },
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, -4, 0],
            })
          }
        ];
      case 'Presets': // Magic scale & pulse
        return [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 1.3, 1.1],
            })
          }
        ];
      case 'Settings': // Gear rotate
        return [
          {
            rotate: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '90deg'],
            })
          },
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            })
          }
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

const AppNavigator = () => {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneStyle: {
            backgroundColor: 'transparent',
          },
          tabBarStyle: {
            backgroundColor: '#19202B',
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
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.2)',
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter-Medium',
            fontWeight: '500',
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName = 'music';
            if (route.name === 'Library') iconName = 'music';
            else if (route.name === 'Timer') iconName = 'clock';
            else if (route.name === 'Mixer') iconName = 'sliders';
            else if (route.name === 'Presets') iconName = 'wand-magic-sparkles';
            else if (route.name === 'Settings') iconName = 'gear';
            
            return (
              <AnimatedTabIcon 
                name={iconName} 
                color={color} 
                size={24} 
                focused={focused} 
                routeName={route.name}
              />
            );
          },
        })}
      >
        <Tab.Screen name="Library" component={LibraryScreen} options={{ tabBarLabel: 'Tüm Sesler' }} />
        <Tab.Screen name="Timer" component={TimerScreen} options={{ tabBarLabel: 'Zamanla' }} />
        <Tab.Screen name="Mixer" component={MixerScreen} options={{ tabBarLabel: 'Mixle' }} />
        <Tab.Screen name="Presets" component={PresetsScreen} options={{ tabBarLabel: 'Hazır Mix' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Ayarlar' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
