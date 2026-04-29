import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

interface GlassBlurProps {
  /** Override style — defaults to StyleSheet.absoluteFill */
  style?: ViewStyle;
  /** Blur intensity 1-25, default 15 */
  blurAmount?: number;
  /** Fallback solid color when blur is unavailable */
  fallbackColor?: string;
  /** Optional children — renders as an overlay wrapper */
  children?: React.ReactNode;
}

/**
 * Reusable glassmorphism blur background.
 * - Without children: drop inside a View with overflow:'hidden' for a blurred backdrop.
 * - With children: wraps content (e.g. as a Modal overlay).
 */
const GlassBlur: React.FC<GlassBlurProps> = ({
  style,
  blurAmount = 15,
  fallbackColor = 'rgba(0,0,0,0.8)',
  children,
}) => {
  const combinedStyle = style || styles.fill;

  if (children) {
    return (
      <BlurView
        style={combinedStyle}
        blurType="dark"
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={fallbackColor}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <BlurView
      style={combinedStyle}
      blurType="dark"
      blurAmount={blurAmount}
      reducedTransparencyFallbackColor={fallbackColor}
    />
  );
};

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
  },
});

export default GlassBlur;
