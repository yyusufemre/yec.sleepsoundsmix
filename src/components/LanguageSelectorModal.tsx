import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import ModalShell from './ModalShell';
import AppText from './AppText';
import { colors, spacing, radius, component } from '../theme/tokens';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../locales/languages';
interface Props {
  isVisible: boolean;
  onClose: () => void;
  currentLanguage: string;
  onChangeLanguage: (lang: string) => void;
}
export default function LanguageSelectorModal({
  isVisible,
  onClose,
  currentLanguage,
  onChangeLanguage,
}: Props) {
  const { t } = useTranslation();
  return (
    <ModalShell visible={isVisible} onClose={onClose}>
      <AppText
        variant="large"
        weight="bold"
        align="center"
        accessibilityRole="header"
      >
        {t('settings.language')}
      </AppText>
      {LANGUAGES.map(lang => {
        const active = currentLanguage.split('-')[0] === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={lang.nativeName}
            onPress={() => {
              onChangeLanguage(lang.code);
              onClose();
            }}
            style={[styles.row, active && styles.active]}
          >
            <View style={styles.text}>
              <AppText weight="semiBold">{lang.nativeName}</AppText>
              <AppText variant="caption" color="secondary">
                {lang.name}
              </AppText>
            </View>
            {active && (
              <Icon
                name="check"
                size={component.iconSize.small}
                color={colors.accent.success}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ModalShell>
  );
}
const styles = StyleSheet.create({
  row: {
    minHeight: component.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  active: {
    backgroundColor: colors.glass.buttonSecondary,
    borderColor: colors.accent.primary,
  },
  text: { flex: 1, gap: spacing.xs },
});
