import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import { spacing, component } from '../theme/tokens';
export default function LegalFooter({
  onPrivacy,
  onTerms,
  children,
}: {
  onPrivacy: () => void;
  onTerms: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.footer}>
      <View style={styles.links}>
        <TouchableOpacity
          accessibilityRole="link"
          onPress={onPrivacy}
          style={styles.link}
        >
          <AppText variant="caption" align="center">
            {t('settings.privacy_policy')}
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="link"
          onPress={onTerms}
          style={styles.link}
        >
          <AppText variant="caption" align="center">
            {t('settings.terms_of_use')}
          </AppText>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  footer: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  link: {
    minHeight: component.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    maxWidth: '100%',
  },
});
