import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

interface MixerItemProps {
  title: string;
  iconName: string;
  volume: number;
  onVolumeChange: (val: number) => void;
  onRemove: () => void;
}

const MixerItem: React.FC<MixerItemProps> = ({ title, iconName, volume, onVolumeChange, onRemove }) => {
  const [lastVolume, setLastVolume] = useState(50); // Default fallback

  const handleMuteToggle = () => {
    if (volume > 0) {
      setLastVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(lastVolume || 50);
    }
  };

  return (
    <LinearGradient
      colors={['rgba(141, 165, 208, 0.2)', 'rgba(72, 84, 106, 0.2)']}
      style={styles.container}
    >
      {/* Top Row: Icon, Title, Trash */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Icon name={iconName} size={22} color="#3471EC" solid style={styles.mainIcon} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity 
          onPress={onRemove} 
          activeOpacity={0.7} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="trash-can" size={18} color="rgba(255, 255, 255, 0.5)" solid />
        </TouchableOpacity>
      </View>

      {/* Bottom Row: Volume Icon, Slider, Percentage */}
      <View style={styles.volumeRow}>
        <Pressable 
          onPress={handleMuteToggle} 
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
        >
          <Icon 
            name={volume > 0 ? "volume-low" : "volume-xmark"} 
            size={18} 
            color={volume > 0 ? "rgba(255, 255, 255, 0.4)" : colors.accent.danger} 
            solid 
          />
        </Pressable>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={volume}
          onValueChange={onVolumeChange}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
          thumbTintColor="#FFFFFF"
        />
        <Text style={styles.percentage}>%{Math.round(volume)}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 24,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainIcon: {
    width: 28,
    textAlign: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 10,
  },
  percentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    opacity: 0.2,
    width: 35,
    textAlign: 'right',
  },
});

export default MixerItem;
