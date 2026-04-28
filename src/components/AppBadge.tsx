import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import AppText from './AppText';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

export type AppBadgeVariant = 'ad' | 'premium' | 'default';

interface AppBadgeProps {
  label: string;
  variant?: AppBadgeVariant;
  style?: StyleProp<ViewStyle>;
}

const AppBadge: React.FC<AppBadgeProps> = ({ label, variant = 'default', style }) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'ad':
        return { backgroundColor: colors.badge.ad };
      case 'premium':
        return { backgroundColor: colors.accent.primary };
      case 'default':
      default:
        return { backgroundColor: colors.glass.border };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'ad':
        return 'dark'; // Assuming black looks better on yellow
      case 'premium':
      case 'default':
      default:
        return 'primary';
    }
  };

  return (
    <View style={[styles.container, getBadgeStyle(), style]}>
      <AppText variant="badge" weight="bold" color={getTextColor()}>
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: layout.radius.sm / 2, // 4px
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppBadge;
