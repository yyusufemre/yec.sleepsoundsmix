// Compatibility adapter for existing components; no independent token values.
import { spacing, radius, screen, component } from './tokens';

export const layout = {
  spacing,
  radius,
  padding: {
    screenHorizontal: screen.paddingHorizontal,
    screenVertical: spacing.lg,
    card: component.cardPadding,
    cardSmall: spacing.md,
    button: spacing.lg,
    buttonSmall: spacing.sm,
  },
};
