import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { screen, spacing, fontFamily, fontSize, lineHeight } from '../theme/spacing';

interface HeaderComponentProps {
  title?: string;
  subtitle?: string;
  inset?: boolean;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  inset = true,
  title = "Huzura Yolculuk",
  subtitle = "Ruhunuzu dinlendirecek en özel seslerle derin bir uykuya ve iç huzura kapı aralayın."
}) => {
  return (
    <View style={[styles.container, inset && styles.inset]}>
      <MaskedView
        accessible
        accessibilityRole="header"
        accessibilityLabel={title}
        maskElement={
          <Text
            style={styles.title}
          >
            {title}
          </Text>
        }
        style={styles.maskedView}
      >
        <LinearGradient
          style={styles.gradient}
          colors={colors.accent.titleGradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text accessible={false} style={[styles.title, styles.measureText]}>{title}</Text>
        </LinearGradient>
      </MaskedView>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: screen.paddingTop,
    paddingBottom: spacing.xl,
    width: '100%',
  },
  gradient: { width: '100%' },
  inset: { paddingHorizontal: screen.paddingHorizontal },
  measureText: { opacity: 0 },
  title: {
    fontSize: fontSize.h1,
    fontFamily: fontFamily.bold,
    fontWeight: 'bold',             // Force bold weight for maximum visibility
    lineHeight: lineHeight.h1,
    textAlign: 'center',
    backgroundColor: 'transparent',
    color: colors.text.primary,     // mask element needs a solid color
    width: '100%',
  },
  maskedView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.caption,
    fontFamily: fontFamily.light,
    lineHeight: lineHeight.caption,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default HeaderComponent;
