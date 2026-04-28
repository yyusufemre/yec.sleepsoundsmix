import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

export type GlassCardVariant = 'normal' | 'premium' | 'ad' | 'active';

interface GlassCardProps {
  variant?: GlassCardVariant;
  noBackground?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'normal',
  noBackground = false,
  style,
  contentStyle,
  children,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'premium':
        return colors.glass.cardPremium;
      case 'ad':
        return colors.glass.cardAd;
      case 'active':
        return colors.glass.cardActive;
      case 'normal':
      default:
        return colors.glass.cardNormal;
    }
  };

  const cardStyles = [
    styles.card,
    style,
  ];

  if (noBackground) {
    return (
      <View style={[cardStyles, styles.transparent]}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={cardStyles}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.radius.lg,
    overflow: 'hidden',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    padding: layout.padding.card,
  },
});

export default GlassCard;
