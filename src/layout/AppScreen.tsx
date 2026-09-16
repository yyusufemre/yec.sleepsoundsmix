import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { screen } from '../theme/tokens';

interface AppScreenProps extends ViewProps {
  standalone?: boolean;
}

/** Tab screens leave the bottom safe area to AppTabBar. Onboarding owns all edges. */
export default function AppScreen({
  children,
  style,
  standalone = false,
  ...props
}: AppScreenProps) {
  return (
    <SafeAreaView
      style={styles.root}
      edges={
        standalone
          ? ['top', 'bottom', 'left', 'right']
          : ['top', 'left', 'right']
      }
    >
      <View {...props} style={[styles.content, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function ScreenScrollView({
  contentContainerStyle,
  style,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      {...props}
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: screen.maxWidth,
    alignSelf: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: screen.paddingHorizontal,
    paddingBottom: screen.paddingBottom,
  },
});
