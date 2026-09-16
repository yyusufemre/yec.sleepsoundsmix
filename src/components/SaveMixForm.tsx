import React from 'react';
import { TextInput, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import GlassCard from './GlassCard';
import AppButton from './AppButton';
import {
  colors,
  spacing,
  fontFamily,
  fontSize,
  component,
} from '../theme/tokens';
export default function SaveMixForm({
  value,
  onChangeText,
  onSave,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.3;
  return (
    <GlassCard
      style={styles.card}
      contentStyle={[styles.row, stacked && styles.stacked]}
    >
      <TextInput
        accessibilityLabel={t('mixer.save_placeholder')}
        placeholder={t('mixer.save_placeholder')}
        placeholderTextColor={colors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSave}
        returnKeyType="done"
        style={[styles.input, stacked && styles.fullWidth]}
      />
      <AppButton
        title={t('common.save')}
        icon="floppy-disk"
        size="medium"
        fullWidth={stacked}
        onPress={onSave}
      />
    </GlassCard>
  );
}
const styles = StyleSheet.create({
  card: { marginBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stacked: { flexDirection: 'column', alignItems: 'stretch' },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: component.touchTarget,
    color: colors.text.primary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    paddingVertical: spacing.sm,
  },
  fullWidth: { flex: 0, width: '100%' },
});
