import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

const { width } = Dimensions.get('window');
const CONTAINER_PADDING = 6;
const CONTAINER_MARGIN = 20;
const GAP = 8;
const SWITCHER_WIDTH = width - (CONTAINER_MARGIN * 2);
const TAB_WIDTH = (SWITCHER_WIDTH - (CONTAINER_PADDING * 2) - (GAP * 2)) / 3;

interface ModeSwitcherProps {
  activeMode: 'nature' | 'music' | 'ambience';
  onModeChange: (mode: 'nature' | 'music' | 'ambience') => void;
}

const ModeSwitcherComponent: React.FC<ModeSwitcherProps> = ({ activeMode, onModeChange }) => {
  const getIndex = (mode: string) => {
    if (mode === 'nature') return 0;
    if (mode === 'music') return 1;
    return 2;
  };

  const slideAnim = useRef(new Animated.Value(getIndex(activeMode))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: getIndex(activeMode),
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [activeMode]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, TAB_WIDTH + GAP, (TAB_WIDTH + GAP) * 2],
  });

  const backgroundColor = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      'rgba(50, 239, 120, 0.25)', // Nature - Greenish
      'rgba(52, 113, 236, 0.25)', // Music - Bluish
      'rgba(236, 52, 113, 0.25)'  // Ambience - Pinkish
    ],
  });

  return (
    <View style={styles.container}>
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
          size={20} 
          color={activeMode === 'nature' ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} 
          solid 
        />
        <Text style={[styles.title, activeMode !== 'nature' && styles.inactiveText]}>Doğa</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab} 
        onPress={() => onModeChange('music')}
        activeOpacity={0.8}
      >
        <Icon 
          name="music" 
          size={20} 
          color={activeMode === 'music' ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} 
          solid 
        />
        <Text style={[styles.title, activeMode !== 'music' && styles.inactiveText]}>Müzik</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab} 
        onPress={() => onModeChange('ambience')}
        activeOpacity={0.8}
      >
        <Icon 
          name="couch" 
          size={20} 
          color={activeMode === 'ambience' ? '#FFFFFF' : 'rgba(255,255,255,0.4)'} 
          solid 
        />
        <Text style={[styles.title, activeMode !== 'ambience' && styles.inactiveText]}>Ortam</Text>
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
    borderRadius: 18,
    bottom: CONTAINER_PADDING,
  },
  tab: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },
  inactiveText: {
    opacity: 0.6,
  },
});

export default ModeSwitcherComponent;
