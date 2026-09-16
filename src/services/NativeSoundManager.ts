import { NativeModules } from 'react-native';

const { NativeSoundManager } = NativeModules;

export default {
  play: (id: string, url: string | number, volume: number) => {
    if (NativeSoundManager) {
      // Ensure numeric resource IDs (from require) are stringified for the NativeModule
      const source = typeof url === 'number' ? url.toString() : url;
      NativeSoundManager.play(id, source, volume);
    }
  },
  setVolume: (id: string, volume: number) => {
    if (NativeSoundManager) NativeSoundManager.setVolume(id, volume);
  },
  playMetronomeTick: (volume: number) => {
    if (NativeSoundManager) NativeSoundManager.playMetronomeTick(volume);
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
  },
  scheduleHardStop: (deadlineId: string, hardStopTimestampMs: number, autoFinishActivity: boolean) => {
    if (NativeSoundManager?.scheduleHardStop) {
      NativeSoundManager.scheduleHardStop(deadlineId, hardStopTimestampMs, autoFinishActivity);
    }
  },
  cancelHardStop: (deadlineId: string) => {
    if (NativeSoundManager?.cancelHardStop) {
      NativeSoundManager.cancelHardStop(deadlineId);
    }
  },
  getLastCompletedHardStop: async (): Promise<{ lastCompletedId: string | null; timestamp: number; didCleanup: boolean }> => {
    if (NativeSoundManager?.getLastCompletedHardStop) {
      try {
        return await NativeSoundManager.getLastCompletedHardStop();
      } catch {
        return { lastCompletedId: null, timestamp: 0, didCleanup: false };
      }
    }
    return { lastCompletedId: null, timestamp: 0, didCleanup: false };
  }
};
