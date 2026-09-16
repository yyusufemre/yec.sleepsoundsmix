import { NativeModules, Platform } from 'react-native';

const { NativeFullscreen } = NativeModules;

const isAvailable = Platform.OS === 'android' && NativeFullscreen;

export default {
  enterImmersive: () => {
    if (isAvailable) NativeFullscreen.enterImmersive();
  },
  exitImmersive: () => {
    if (isAvailable) NativeFullscreen.exitImmersive();
  },
};
