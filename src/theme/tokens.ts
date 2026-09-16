import { Platform } from 'react-native';
import { typography } from './typography';

export { colors } from './colors';
export { typography };
export const fontFamily = typography.family;
export const fontSize = typography.size;
export const fontWeight = typography.weight;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 200,
  pill: 9999,
};
export const lineHeight = {
  h1: 50,
  h2: 36,
  h3: 30,
  timerBig: 54,
  timerSmall: 32,
  large: 26,
  body: 24,
  medium: 22,
  small: 20,
  caption: 18,
  tiny: 14,
  badge: 12,
};
export const screen = {
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.xxl,
  paddingBottom: spacing.xxl,
  maxWidth: 640,
  sectionGap: spacing.xxl,
};
export const component = {
  touchTarget: 48,
  modalMaxWidth: 400,
  iconButtonLarge: 56,
  buttonHeight: { small: 40, medium: 48, large: 64 },
  iconSize: { small: 16, medium: 24, large: 28 },
  sliderHeight: Platform.OS === 'ios' ? 36 : 28,
  cardPadding: spacing.lg,
  cardRadius: radius.lg,
  gridGap: spacing.md,
  timerRingSize: 180,
  timerButtonMax: 88,
  tabBarMinHeight: 64,
  tabLabelSize: 11,
};
