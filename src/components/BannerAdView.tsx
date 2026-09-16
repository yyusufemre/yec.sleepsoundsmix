import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_CONFIG } from '../config/adConfig';

import useMixerStore from '../store/useMixerStore';

interface BannerAdViewProps {
  /** Optional style for the container */
  style?: any;
}

const BannerAdView: React.FC<BannerAdViewProps> = ({ style }) => {
  const canRequestAds = useMixerStore((state: any) => state.canRequestAds);

  if (!canRequestAds) {
    console.log('[BannerAdView] Skip rendering banner ad: consent not granted.');
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={AD_CONFIG.BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          console.log('Ad failed to load: ', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
});

export default BannerAdView;
