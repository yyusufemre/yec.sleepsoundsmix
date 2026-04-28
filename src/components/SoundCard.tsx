import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import GlassCard from './GlassCard';
import AppText from './AppText';
import AppBadge from './AppBadge';
import { colors } from '../theme/colors';

interface SoundCardProps {
  title: string;
  iconName: string;
  isLocked: boolean;
  isActive: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void;
}

const SoundCard: React.FC<SoundCardProps> = ({ title, iconName, isLocked, isActive, disabled, isLoading, onPress }) => {
  const getVariant = () => {
    if (isActive) return 'active';
    return 'normal';
  };

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || isLoading}
    >
      <GlassCard
        variant={getVariant()}
        contentStyle={styles.container}
        style={[styles.baseBorder, isActive && styles.activeBorder]}
      >
        <Icon 
          name={iconName} 
          size={24} 
          color={isActive ? colors.text.primary : colors.text.secondary} 
          style={styles.icon}
          solid 
        />
        <AppText 
          variant="small" 
          weight="medium" 
          color={isActive ? 'primary' : 'secondary'}
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </AppText>

        {isLoading && (
          <View style={styles.statusBadge}>
            <ActivityIndicator size="small" color={colors.text.primary} />
          </View>
        )}

        {isActive && !isLoading && (
          <View style={styles.statusBadge}>
            <Icon name="circle-check" size={16} color={colors.accent.success} solid />
          </View>
        )}

        {isLocked && !isActive && !isLoading && (
          <AppBadge variant="ad" label="Ad" style={styles.statusBadge} />
        )}
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    maxWidth: '47%',
  },
  baseBorder: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 10,
    paddingRight: 24,
    minHeight: 80,
  },
  activeBorder: {
    borderColor: colors.accent.primary,
  },
  icon: {
  },
  title: {
    flexShrink: 1,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
});

export default SoundCard;
