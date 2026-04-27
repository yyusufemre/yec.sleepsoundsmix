import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { colors } from '../theme/colors';

interface SoundCardProps {
  title: string;
  iconName: string;
  isLocked: boolean;
  isActive: boolean;
  onPress: () => void;
}

const SoundCard: React.FC<SoundCardProps> = ({ title, iconName, isLocked, isActive, onPress }) => {
  const gradientColors = isActive
    ? [colors.glass.cardNormal[0], 'rgba(52, 113, 236, 0.2)']
    : isLocked ? colors.glass.cardAd : colors.glass.cardNormal;

  return (
    <TouchableOpacity
      style={[styles.touchable, isActive && styles.activeBorder, isLocked && styles.lockedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Icon name={iconName} size={24} color={isActive || isLocked ? colors.text.primary : colors.text.secondary} style={[styles.icon, isLocked && styles.lockedTextOpacity]} solid />
        <Text style={[styles.title, isLocked && styles.lockedTextOpacity]}>{title}</Text>

        {isActive && (
          <View style={styles.statusBadge}>
            <Icon name="circle-check" size={16} color={colors.accent.success} solid />
          </View>
        )}

        {isLocked && (
          <View style={[styles.statusBadge, styles.adBadge]}>
            <Text style={styles.adBadgeText}>Ad</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    overflow: 'hidden', // to clip gradient
    borderColor: colors.glass.border,
    borderWidth: 0,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
    minHeight: 80,
  },
  activeBorder: {
    borderColor: 'transparent',
    borderWidth: 1,
  },
  lockedContainer: {
    opacity: 0.7,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    color: colors.text.primary,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    flexShrink: 1,
  },
  lockedTextOpacity: {
    opacity: 0.3,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  adBadge: {
    backgroundColor: '#FABB18',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adBadgeText: {
    color: '#000000',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    fontWeight: 'bold',
  }
});

export default SoundCard;
