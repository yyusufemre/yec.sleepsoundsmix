import mobileAds, { AdsConsent, AdsConsentDebugGeography } from 'react-native-google-mobile-ads';
import RewardedAdManager from './RewardedAdManager';
import useMixerStore from '../store/useMixerStore';

declare const process: any;

class ConsentService {
  private canRequestAdsValue = false;

  async requestConsentAndInitAdMob(): Promise<boolean> {
    try {
      console.log('[ConsentService] Requesting UMP consent update...');
      const options = __DEV__
        ? {
            debugGeography: AdsConsentDebugGeography.EEA,
            testDeviceIdentifiers: ['93A9A67154DC6EF8C59256465143B004'],
          }
        : {};
      const consentInfo = await AdsConsent.requestInfoUpdate(options);
      
      if (consentInfo.isConsentFormAvailable) {
        console.log('[ConsentService] Consent form is available. Presenting if required...');
        await AdsConsent.loadAndShowConsentFormIfRequired();
      }

      const freshConsentInfo = await AdsConsent.getConsentInfo();
      this.canRequestAdsValue = freshConsentInfo.canRequestAds;
      RewardedAdManager.setCanRequestAds(this.canRequestAdsValue);
      (useMixerStore.getState() as any).setCanRequestAds(this.canRequestAdsValue);

      console.log('[ConsentService] Consent evaluation complete. canRequestAds:', this.canRequestAdsValue);

      if (this.canRequestAdsValue) {
        console.log('[ConsentService] Initializing MobileAds...');
        await mobileAds().initialize();
        RewardedAdManager.preload();
      } else {
        console.log('[ConsentService] Consent not obtained/required. Skipping MobileAds init.');
      }

      return this.canRequestAdsValue;
    } catch (error) {
      console.warn('[ConsentService] Consent flow failed:', error);
      if (__DEV__ && !process.env.JEST_WORKER_ID) {
        console.log('[ConsentService] Dev mode fallback: Force enabling test ads despite consent error.');
        this.canRequestAdsValue = true;
        RewardedAdManager.setCanRequestAds(true);
        (useMixerStore.getState() as any).setCanRequestAds(true);
        try {
          await mobileAds().initialize();
          RewardedAdManager.preload();
        } catch (initError) {
          console.warn('[ConsentService] Dev MobileAds init failed:', initError);
        }
        return true;
      }
      // Safe fallback: Allow app to open, but do not initialize Ads or preload
      this.canRequestAdsValue = false;
      RewardedAdManager.setCanRequestAds(false);
      (useMixerStore.getState() as any).setCanRequestAds(false);
      return false;
    }
  }

  async showPrivacyOptions(): Promise<boolean> {
    try {
      console.log('[ConsentService] Presenting privacy options form...');
      const consentInfo = await AdsConsent.showPrivacyOptionsForm();
      this.canRequestAdsValue = consentInfo.canRequestAds;
      RewardedAdManager.setCanRequestAds(this.canRequestAdsValue);
      (useMixerStore.getState() as any).setCanRequestAds(this.canRequestAdsValue);
      
      if (this.canRequestAdsValue) {
        await mobileAds().initialize();
        RewardedAdManager.preload();
      }
      return this.canRequestAdsValue;
    } catch (error) {
      console.warn('[ConsentService] Failed to show privacy options form:', error);
      if (__DEV__ && !process.env.JEST_WORKER_ID) {
        const { Alert } = require('react-native');
        Alert.alert(
          'Geliştirme Modu Bildirimi',
          'AdMob panelinizde GDPR/UMP Rıza Formu henüz yayınlanmadığı veya yapılandırılmadığı için bu ayarlar formu gösterilemedi.\n\nHata: ' + (error instanceof Error ? error.message : String(error)),
          [{ text: 'Tamam' }]
        );
      }
      return false;
    }
  }

  canRequestAds(): boolean {
    return this.canRequestAdsValue;
  }
}

export default new ConsentService();
