/**
 * @format
 */

import { AppRegistry } from 'react-native';
import './src/locales/i18n';
import App from './App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './src/services/PlaybackService';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';

// Save and extend default error handler
const defaultErrorHandler = ErrorUtils.getGlobalHandler();

ErrorUtils.setGlobalHandler((e, isFatal) => {
  if (__DEV__) {
    console.log('CRITICAL JS ERROR:', e, isFatal);
  } else {
    try {
      crashlytics().recordError(e, `Fatal: ${isFatal}`);
    } catch (crashlyticsError) {
      console.warn('Crashlytics error recording failed:', crashlyticsError);
    }
  }

  if (defaultErrorHandler) {
    defaultErrorHandler(e, isFatal);
  }
});

// Background message handler
// Must be registered synchronously and early to receive headless task triggers on Android
try {
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async remoteMessage => {
    if (__DEV__) {
      console.log('[FCM Background] Message handled in the background!', remoteMessage);
    }
  });
} catch (error) {
  console.error('[FCM Background] Failed to register background message handler:', error);
}

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => PlaybackService);
