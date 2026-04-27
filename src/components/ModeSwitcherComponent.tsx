import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

const { width } = Dimensions.get('window');
const CONTAINER_PADDING = 6;
const CONTAINER_MARGIN = 16;
const GAP = 10;
const SWITCHER_WIDTH = width - (CONTAINER_MARGIN * 2);
const TAB_WIDTH = (SWITCHER_WIDTH - (CONTAINER_PADDING * 2) - GAP) / 2;

interface ModeSwitcherProps {
  activeMode: 'nature' | 'music';
  onModeChange: (mode: 'nature' | 'music') => void;
}

const ModeSwitcherComponent: React.FC<ModeSwitcherProps> = ({ activeMode, onModeChange }) => {
  const slideAnim = useRef(new Animated.Value(activeMode === 'nature' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeMode === 'nature' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [activeMode]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TAB_WIDTH + GAP],
  });

  const backgroundColor = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(50, 239, 120, 0.25)', 'rgba(52, 113, 236, 0.25)'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Background Indicator */}
      <Animated.View 
        style={[
          styles.indicator, 
          { 
            transform: [{ translateX }],
            backgroundColor 
          }
        ]} 
      />

      <TouchableOpacity 
        style={styles.tab} 
        onPress={() => onModeChange('nature')}
        activeOpacity={0.8}
      >
        <Icon 
          name="leaf" 
          size={24} 
          color={activeMode === 'nature' ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} 
          solid 
        />
        <Text style={[styles.title, activeMode !== 'nature' && styles.inactiveText]}>Doğal Sesler</Text>
        <Text style={styles.subtitle}>Yağmur, rüzgar ve orman fısıltıları.</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab} 
        onPress={() => onModeChange('music')}
        activeOpacity={0.8}
      >
        <Icon 
          name="music" 
          size={24} 
          color={activeMode === 'music' ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} 
          solid 
        />
        <Text style={[styles.title, activeMode !== 'music' && styles.inactiveText]}>Rahatlatıcı Ses</Text>
        <Text style={styles.subtitle}>Piyano, kase ve derin frekanslar.</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 24,
    padding: CONTAINER_PADDING,
    marginHorizontal: CONTAINER_MARGIN,
    marginBottom: 16,
    gap: GAP,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  indicator: {
    position: 'absolute',
    top: CONTAINER_PADDING,
    left: CONTAINER_PADDING,
    width: TAB_WIDTH,
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(50,239,120,0.3)',
    bottom: CONTAINER_PADDING,
  },
  tab: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  inactiveText: {
    opacity: 0.6,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    opacity: 0.4,
    marginTop: 6,
    textAlign: 'center',
  }
});

export default ModeSwitcherComponent;
