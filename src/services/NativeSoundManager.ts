import { NativeModules } from 'react-native';

const { NativeSoundManager } = NativeModules;

export default {
  play: (id: string, url: string, volume: number) => {
    if (NativeSoundManager) NativeSoundManager.play(id, url, volume);
  },
  setVolume: (id: string, volume: number) => {
    if (NativeSoundManager) NativeSoundManager.setVolume(id, volume);
  },
  pauseAll: () => {
    if (NativeSoundManager) NativeSoundManager.pauseAll();
  },
  resumeAll: () => {
    if (NativeSoundManager) NativeSoundManager.resumeAll();
  },
  stopAll: () => {
    if (NativeSoundManager) NativeSoundManager.stopAll();
  },
  stop: (id: string) => {
    if (NativeSoundManager) NativeSoundManager.stop(id);
  }
};
