import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Test modunu kapatıp gerçek reklamlara geçmek için bu değeri 'false' yapın.
export const USE_TEST_ADS = true;

export const AD_CONFIG = {
  REWARDED_ID: (USE_TEST_ADS || __DEV__)
    ? TestIds.REWARDED 
    : Platform.select({
        android: 'ca-app-pub-9720402907836501/8828466994',
        ios: 'ca-app-pub-9720402907836501/IOS_REWARDED_ID_BURAYA', // TODO: Update with real iOS Rewarded ID
        default: TestIds.REWARDED,
      }),
    
  BANNER_ID: (USE_TEST_ADS || __DEV__)
    ? TestIds.ADAPTIVE_BANNER 
    : Platform.select({
        android: 'ca-app-pub-9720402907836501/4177017953',
        ios: 'ca-app-pub-9720402907836501/IOS_BANNER_ID_BURAYA', // TODO: Update with real iOS Banner ID
        default: TestIds.ADAPTIVE_BANNER,
      }),
};
