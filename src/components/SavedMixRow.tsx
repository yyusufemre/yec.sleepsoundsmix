import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import GlassCard from './GlassCard';
import AppText from './AppText';
import IconButton from './IconButton';
import { colors, spacing } from '../theme/tokens';
interface Props {
  name: string;
  count: number;
  loading?: boolean;
  disabled?: boolean;
  onPlay: () => void;
  onDelete: () => void;
}
export default function SavedMixRow({
  name,
  count,
  loading,
  disabled,
  onPlay,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  return (
    <GlassCard style={styles.card} contentStyle={styles.content}>
      <View style={styles.text}>
        <AppText weight="medium">{name}</AppText>
        <AppText variant="caption" color="secondary">
          {t('presets.sound_count', { count })}
        </AppText>
      </View>
      <View style={styles.actions}>
        <IconButton
          name="play"
          loading={loading}
          disabled={disabled}
          iconColor={colors.accent.success}
          accessibilityLabel={`${t('mixer.play')}: ${name}`}
          onPress={onPlay}
        />
        <IconButton
          name="trash-can"
          size="small"
          accessibilityLabel={`${t('common.delete')}: ${name}`}
          onPress={onDelete}
        />
      </View>
    </GlassCard>
  );
}
const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { flex: 1, minWidth: 0, gap: spacing.xs },
  actions: { flexDirection: 'row', flexShrink: 0 },
});
