import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AppText from './AppText';
import AppButton from './AppButton';
import { spacing, colors } from '../theme/tokens';
export default function EmptyState({
  message,
  icon,
  actionLabel,
  onAction,
}: {
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.container}>
      {icon && (
        <Icon name={icon} size={48} color={colors.text.secondary} solid />
      )}
      {message ? (
        <AppText color="secondary" align="center">
          {message}
        </AppText>
      ) : null}
      {onAction && (
        <AppButton
          title={actionLabel}
          icon="plus"
          variant="secondary"
          onPress={onAction}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.xxl,
  },
});
