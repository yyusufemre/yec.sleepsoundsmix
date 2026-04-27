/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

ErrorUtils.setGlobalHandler((e, isFatal) => {
  console.log('CRITICAL JS ERROR:', e, isFatal);
});
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './src/services/PlaybackService';

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => PlaybackService);
