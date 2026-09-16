import { spacing } from '../theme/tokens';
import React from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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
  isActive?: boolean;
  isAccessible?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

const PresetCard: React.FC<PresetCardProps> = ({
  title,
  description,
  iconName,
  isAd,
  isActive,
  isAccessible = true,
  isLoading,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{
        selected: !!isActive,
        busy: !!isLoading,
        disabled: !!isLoading,
      }}
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={isLoading}
      style={styles.touchable}
    >
      <GlassCard
        variant={isActive ? 'active' : 'premium'}
        contentStyle={styles.container}
      >
        <View style={styles.content}>
          {/* Left Icon */}
          <View style={styles.iconContainer}>
            <Icon
              name={iconName}
              size={24}
              color={colors.accent.primary}
              solid
            />
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <AppText variant="body" weight="bold" color="primary">
              {title}
            </AppText>
            <AppText
              variant="caption"
              color="secondary"
              style={styles.description}
            >
              {description}
            </AppText>
          </View>

          {/* Right Icon/Ad Label */}
          <View style={styles.rightContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : isActive ? (
              <Icon
                name="pause"
                size={24}
                color={colors.accent.primary}
                solid
              />
            ) : isAd && !isAccessible ? (
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
    marginBottom: spacing.lg,
    width: '100%',
  },
  container: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: spacing.sm,
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
