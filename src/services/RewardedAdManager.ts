import { AdEventType, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { AD_CONFIG } from '../config/adConfig';

type RewardedAdStatus = {
  isReady: boolean;
  isLoading: boolean;
  isShowing: boolean;
  lastError: Error | null;
};

type RewardCallback = () => void;
type StatusListener = (status: RewardedAdStatus) => void;

class RewardedAdManager {
  private ad: RewardedAd | null = null;
  private isReadyValue = false;
  private isLoadingValue = false;
  private isShowingValue = false;
  private lastErrorValue: Error | null = null;
  private pendingReward: RewardCallback | null = null;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private canRequestAdsValue = false;
  private listeners = new Set<StatusListener>();
  private unsubscribes: Array<() => void> = [];

  setCanRequestAds(allowed: boolean) {
    this.canRequestAdsValue = allowed;
    if (!allowed) {
      this.isReadyValue = false;
      this.isLoadingValue = false;
      this.isShowingValue = false;
      this.lastErrorValue = null;
      this.pendingReward = null;
      this.clearRetry();
      this.cleanupAd();
      this.notify();
    }
  }

  subscribe(listener: StatusListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStatus(): RewardedAdStatus {
    return {
      isReady: this.isReadyValue,
      isLoading: this.isLoadingValue,
      isShowing: this.isShowingValue,
      lastError: this.lastErrorValue,
    };
  }

  isReady() {
    return this.isReadyValue && !!this.ad && !this.isShowingValue;
  }

  getLastError() {
    return this.lastErrorValue;
  }

  preload() {
    if (!this.canRequestAdsValue) {
      console.log('[RewardedAdManager] Preload skipped: Ads consent not granted yet.');
      return;
    }
    if (this.isReadyValue || this.isLoadingValue || this.isShowingValue) return;

    this.clearRetry();
    this.cleanupAd();
    this.lastErrorValue = null;
    this.isLoadingValue = true;
    this.notify();

    const ad = RewardedAd.createForAdRequest(AD_CONFIG.REWARDED_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.isReadyValue = true;
      this.isLoadingValue = false;
      this.notify();
    });

    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      console.log('[AdMob] Earned reward:', reward);
      const callback = this.pendingReward;
      this.pendingReward = null;
      if (callback) {
        callback();
      }
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      this.isReadyValue = false;
      this.isLoadingValue = false;
      this.isShowingValue = false;
      this.cleanupAd();
      this.notify();
      this.preload();
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, error => {
      console.log('[AdMob] Rewarded ad error:', error);
      this.pendingReward = null;
      this.lastErrorValue = error;
      this.isReadyValue = false;
      this.isLoadingValue = false;
      this.isShowingValue = false;
      this.cleanupAd();
      this.notify();
      this.scheduleRetry();
    });

    this.unsubscribes = [unsubLoaded, unsubEarned, unsubClosed, unsubError];
    this.ad = ad;
    ad.load();
  }

  async waitUntilReady(timeoutMs = 6000) {
    if (this.isReady()) return true;

    this.preload();

    return new Promise<boolean>(resolve => {
      let settled = false;
      let unsubscribe: () => void = () => {};
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        unsubscribe();
        resolve(this.isReady());
      }, timeoutMs);

      unsubscribe = this.subscribe(status => {
        if ((!status.isReady && !status.lastError) || settled) return;
        settled = true;
        clearTimeout(timeout);
        unsubscribe();
        resolve(status.isReady);
      });
    });
  }

  async show(onReward: RewardCallback) {
    if (!this.canRequestAdsValue) {
      throw new Error('Rewarded ad cannot be shown: ads consent not granted.');
    }
    if (!this.isReady()) {
      this.preload();
      throw new Error('Rewarded ad is not ready.');
    }

    const ad = this.ad;
    if (!ad) throw new Error('Rewarded ad instance is missing.');

    this.pendingReward = onReward;
    this.isReadyValue = false;
    this.isShowingValue = true;
    this.notify();

    try {
      await ad.show();
    } catch (error) {
      this.pendingReward = null;
      this.lastErrorValue = error instanceof Error ? error : new Error(String(error));
      this.isShowingValue = false;
      this.cleanupAd();
      this.notify();
      this.preload();
      throw error;
    }
  }

  private cleanupAd() {
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
    this.unsubscribes = [];
    this.ad = null;
  }

  private scheduleRetry() {
    this.clearRetry();
    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      this.preload();
    }, 10000);
  }

  private clearRetry() {
    if (!this.retryTimeout) return;
    clearTimeout(this.retryTimeout);
    this.retryTimeout = null;
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }
}

export default new RewardedAdManager();
