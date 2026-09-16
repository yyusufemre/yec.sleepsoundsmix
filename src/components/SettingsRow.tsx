import React from 'react';
import {
  View,
  TouchableOpacity,
  Switch,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import GlassCard from './GlassCard';
import AppText from './AppText';
import { colors, spacing, radius, component } from '../theme/tokens';
interface Props {
  icon: string;
  title: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  toggle?: {
    value: boolean;
    disabled?: boolean;
    onChange: (value: boolean) => void;
  };
  noBackground?: boolean;
}
export default function SettingsRow({
  icon,
  title,
  description,
  value,
  onPress,
  toggle,
  noBackground,
}: Props) {
  const { fontScale } = useWindowDimensions();
  const content = (
    <GlassCard
      noBackground={noBackground}
      contentStyle={[styles.row, fontScale > 1.3 && styles.wrap]}
    >
      <View style={styles.lead}>
        <Icon
          name={icon}
          size={component.iconSize.small}
          color={colors.text.secondary}
          solid
        />
        <View style={styles.text}>
          <AppText variant="medium" weight="bold">
            {title}
          </AppText>
          {description && (
            <AppText variant="caption" color="secondary">
              {description}
            </AppText>
          )}
        </View>
      </View>
      {value && (
        <View style={styles.badge}>
          <AppText variant="caption" weight="bold">
            {value}
          </AppText>
        </View>
      )}
      {toggle ? (
        <Switch
          accessibilityLabel={title}
          value={toggle.value}
          disabled={toggle.disabled}
          onValueChange={toggle.onChange}
          trackColor={{
            false: colors.glass.border,
            true: colors.accent.success,
          }}
          thumbColor={colors.text.primary}
        />
      ) : onPress && !value ? (
        <Icon
          name="chevron-right"
          size={component.iconSize.small}
          color={colors.text.secondary}
        />
      ) : null}
    </GlassCard>
  );
  return onPress ? (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityValue={value ? { text: value } : undefined}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: component.touchTarget,
  },
  wrap: { flexWrap: 'wrap' },
  lead: {
    flex: 1,
    minWidth: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: { flex: 1, gap: spacing.xs },
  badge: {
    maxWidth: '100%',
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: colors.glass.buttonSecondary,
  },
});
