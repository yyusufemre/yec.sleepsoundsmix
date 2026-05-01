import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import GlassCard from './GlassCard';
import AppText from './AppText';
import AppBadge from './AppBadge';
import { colors } from '../theme/colors';

interface PresetCardProps {
  title: string;
  description: string;
  iconName: string;
  isAd?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const PresetCard: React.FC<PresetCardProps> = ({ 
  title, 
  description, 
  iconName, 
  isAd, 
  onPress,
  onLongPress 
}) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      onLongPress={onLongPress}
      style={styles.touchable}
    >
      <GlassCard
        variant={isAd ? 'ad' : 'premium'}
        contentStyle={styles.container}
      >
        <View style={styles.content}>
          {/* Left Icon */}
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={24} color={colors.accent.primary} solid />
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <AppText variant="body" weight="medium" color="primary">{title}</AppText>
            <AppText variant="caption" color="secondary" style={styles.description} numberOfLines={3}>
              {description}
            </AppText>
          </View>

          {/* Right Icon/Ad Label */}
          <View style={styles.rightContainer}>
            {isAd ? (
              <AppBadge variant="ad" label="Ad" />
            ) : (
              <Icon name="play" size={24} color={colors.accent.success} solid />
            )}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 16,
    width: '100%',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  description: {
    lineHeight: 16,
  },
  rightContainer: {
    width: 32,
    alignItems: 'center',
  },
});

export default PresetCard;
