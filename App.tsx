import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ImageBackground, StatusBar, Modal, LogBox, AppState, NativeEventEmitter, NativeModules, DeviceEventEmitter, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useMixerStore from './src/store/useMixerStore';
import NotificationService from './src/services/NotificationService';
import BootSplash from 'react-native-bootsplash';
import NativeFullscreen from './src/services/NativeFullscreen';
import ConsentService from './src/services/ConsentService';

// Ignore harmless missing native method warnings from TrackPlayer on iOS
LogBox.ignoreLogs([
  /The Objective-C .* method signature for the JS method .* can not be found/,
]);

const ONBOARDING_KEY = '@sleepsoundsmix:onboarding_done';
const INTRO_SPLASH_MS = 900;
const SPLASH_BACKGROUND_COLOR = '#161b2f';

const getAppNavigator = () => require('./src/navigation/AppNavigator').default;
const getGlobalAudioPlayer = () => require('./src/components/GlobalAudioPlayer').default;
const getSleepTimerModal = () => require('./src/components/SleepTimerModal').default;
const getSleepFlowOverlay = () => require('./src/components/SleepFlowOverlay').default;
const getOnboardingScreen = () => require('./src/screens/OnboardingScreen').default;

const scheduleDeferredStartupTask = (task: () => void) => {
  const idleGlobal = globalThis as typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof idleGlobal.requestIdleCallback === 'function') {
    const handle = idleGlobal.requestIdleCallback(task, { timeout: 2000 });
    return () => idleGlobal.cancelIdleCallback?.(handle);
  }

  const handle = setTimeout(task, 0);
  return () => clearTimeout(handle);
};

const App = () => {
  const isSleepFlowActive = useMixerStore(state => state.isSleepFlowActive);
  const showSleepModal = useMixerStore(state => state.showSleepModal);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [introSplashDone, setIntroSplashDone] = useState(false);
  const didHideBootSplash = useRef(false);

  useEffect(() => {
    // Perform initial state reconciliation and listen to AppState active transitions
    (useMixerStore.getState() as any).reconcileNativeState();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        (useMixerStore.getState() as any).reconcileNativeState();
      }
    });

    let nativeEventSubscription: any;
    try {
      const eventEmitter = Platform.OS === 'android'
        ? DeviceEventEmitter
        : (NativeModules.NativeSoundManager ? new NativeEventEmitter(NativeModules.NativeSoundManager) : null);

      if (eventEmitter) {
        nativeEventSubscription = eventEmitter.addListener('onNativeHardStopExecuted', () => {
          console.log('[App] Received onNativeHardStopExecuted from native. Cleaning up JS store.');
          (useMixerStore.getState() as any).executeSleepCleanup();
        });
      }
    } catch (e) {
      console.warn('[App] Native event listener setup warning:', e);
    }

    return () => {
      subscription.remove();
      if (nativeEventSubscription && typeof nativeEventSubscription.remove === 'function') {
        nativeEventSubscription.remove();
      }
    };
  }, []);

  const hideBootSplash = useCallback(() => {
    if (didHideBootSplash.current) return;
    didHideBootSplash.current = true;
    BootSplash.hide({ fade: false }).catch(() => { });
  }, []);

  useEffect(() => {
    NativeFullscreen.enterImmersive();

    const introSplashTimer = setTimeout(() => {
      setIntroSplashDone(true);
    }, INTRO_SPLASH_MS);

    // Check if onboarding has been completed with a timeout fallback to prevent hangs
    const storagePromise = AsyncStorage.getItem(ONBOARDING_KEY);
    const timeoutPromise = new Promise<string | null>((_, reject) =>
      setTimeout(() => reject(new Error('AsyncStorage timeout')), 800)
    );

    Promise.race([storagePromise, timeoutPromise])
      .then(value => {
        setOnboardingDone(value === 'true');
      })
      .catch(err => {
        console.warn('[App] AsyncStorage error or timeout, resolving to onboarding:', err);
        // Storage error or timeout — assume first run and show onboarding
        setOnboardingDone(false);
      });

    const cancelStartupTask = scheduleDeferredStartupTask(() => {
      // Defer UMP consent flow and MobileAds initialization.
      ConsentService.requestConsentAndInitAdMob();
    });
    let isMounted = true;
    let unsubscribeNotifications: (() => void) | undefined;
    const cancelListenerTask = scheduleDeferredStartupTask(() => {
      NotificationService.setupListeners().then(unsub => {
        if (isMounted) {
          unsubscribeNotifications = unsub;
        } else {
          unsub();
        }
      });
    });

    return () => {
      isMounted = false;
      clearTimeout(introSplashTimer);
      cancelStartupTask();
      cancelListenerTask();
      if (unsubscribeNotifications) unsubscribeNotifications();
      NativeFullscreen.exitImmersive();
    };
  }, []);

  useEffect(() => {
    if (onboardingDone !== null && introSplashDone) {
      BootSplash.hide({ fade: true }).catch(() => {});
    }
  }, [onboardingDone, introSplashDone]);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Storage write failed — proceed anyway, onboarding will show once more next launch
    } finally {
      setOnboardingDone(true);
    }
  };

  const shouldShowIntroSplash = onboardingDone === null || !introSplashDone;

  if (shouldShowIntroSplash) {
    return (
      <View style={styles.container} onLayout={hideBootSplash}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ImageBackground
          source={require('./assets/splash-screen.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  const OnboardingComponent = !onboardingDone ? getOnboardingScreen() : null;
  const AppNavigatorComponent = onboardingDone ? getAppNavigator() : null;
  const GlobalAudioPlayerComponent = onboardingDone ? getGlobalAudioPlayer() : null;
  const SleepTimerModalComponent = onboardingDone ? getSleepTimerModal() : null;
  const SleepFlowOverlayComponent = onboardingDone && isSleepFlowActive ? getSleepFlowOverlay() : null;

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ImageBackground
          source={require('./assets/app_bg.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {OnboardingComponent ? (
            <OnboardingComponent onComplete={handleOnboardingComplete} />
          ) : (
            <>
              <AppNavigatorComponent />
              <GlobalAudioPlayerComponent />
              <Modal
                visible={isSleepFlowActive || showSleepModal}
                transparent
                animationType="fade"
                statusBarTranslucent
                navigationBarTranslucent
              >
                {SleepFlowOverlayComponent ? <SleepFlowOverlayComponent /> : null}
                {SleepTimerModalComponent ? <SleepTimerModalComponent /> : null}
              </Modal>
            </>
          )}
        </ImageBackground>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND_COLOR,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  splashImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default App;
