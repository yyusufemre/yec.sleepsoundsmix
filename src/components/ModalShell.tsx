import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import GlassBlur from './GlassBlur';
import IconButton from './IconButton';
import { colors, spacing, radius, component } from '../theme/tokens';

interface Props {
  visible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  inline?: boolean;
}
export default function ModalShell({
  visible,
  onClose,
  children,
  inline = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  if (!visible) return null;
  const content = (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GlassBlur
        style={StyleSheet.absoluteFill}
        blurAmount={32}
        fallbackColor={colors.background.overlay}
      />
      <Pressable
        accessible={false}
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />
      <View
        style={[
          styles.safe,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
            paddingLeft: insets.left + spacing.xl,
            paddingRight: insets.right + spacing.xl,
          },
        ]}
        pointerEvents="box-none"
      >
        <View
          style={styles.card}
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
        >
          {onClose && (
            <View style={styles.close}>
              <IconButton
                name="xmark"
                accessibilityLabel={t('common.close')}
                onPress={onClose}
              />
            </View>
          )}
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
  return inline ? (
    <View style={styles.inline}>{content}</View>
  ) : (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      {content}
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background.overlay },
  safe: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: component.modalMaxWidth,
    maxHeight: '100%',
    flexShrink: 1,
    backgroundColor: colors.background.modal,
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  close: { alignItems: 'flex-end', paddingHorizontal: spacing.sm },
  content: { padding: spacing.xl, gap: spacing.lg },
  inline: { ...StyleSheet.absoluteFill, zIndex: 10000, elevation: 100 },
});
