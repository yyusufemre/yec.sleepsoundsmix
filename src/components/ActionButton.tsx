import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';

interface ActionButtonProps {
  onPress: () => void;
  title: string;
  icon: string;
  type?: 'danger' | 'success' | 'warning';
  disabled?: boolean;
  style?: ViewStyle;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onPress, title, icon, type = 'danger', disabled, style }) => {
  const getColors = () => {
    switch (type) {
      case 'success': return ['rgba(50, 239, 120, 0.4)', 'rgba(50, 239, 120, 0.1)'];
      case 'warning': return ['rgba(239, 172, 50, 0.4)', 'rgba(239, 172, 50, 0.1)'];
      default: return ['rgba(239, 50, 75, 0.4)', 'rgba(239, 50, 75, 0.1)'];
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success': return '#47F185';
      case 'warning': return '#EFAC32';
      default: return '#EF324B';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient colors={getColors()} style={styles.button}>
        <Icon name={icon} size={20} color={getAccentColor()} solid />
        <Text style={[styles.text, { color: '#FFFFFF' }]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 64,
  },
  button: {
    flexDirection: 'row',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
});

export default ActionButton;
