import { create } from 'zustand';
import { Alert } from 'react-native';

const useMixerStore = create((set, get) => ({
  activeSounds: {},
  unlockedSoundIds: [], // TODO: AsyncStorage ile persist edilecek

  timer: 0,
  isTimerRunning: false,
  intervalId: null,
  targetTimestamp: null,
  isPausedBySystem: false,
  showSleepModal: false,
  isSleepFlowEnabled: false,
  isSleepFlowActive: false,
  
  setSleepFlowEnabled: (enabled) => set({ isSleepFlowEnabled: enabled }),
  setSleepFlowActive: (active) => set({ isSleepFlowActive: active }),
  
  unlockSounds: (newIds) => set((state) => {
    const updated = [...state.unlockedSoundIds];
    newIds.forEach(id => {
      if (!updated.includes(id)) {
        updated.push(id);
      }
    });
    return { unlockedSoundIds: updated };
  }),

  
  toggleSound: (soundId) => set((state) => {
    const newSounds = { ...state.activeSounds };
    let isAdding = false;
    
    if (newSounds[soundId] !== undefined) {
      delete newSounds[soundId];
    } else {
      if (Object.keys(newSounds).length >= 8) {
        Alert.alert(
          'Limit Aşıldı',
          'Aynı anda en fazla 8 farklı ses karıştırabilirsiniz. Lütfen yeni bir ses seçmeden önce mevcut seslerden birini kapatın.'
        );
        return state; // Değişiklik yapmadan çık
      }
      newSounds[soundId] = 50; // Default volume 50%
      isAdding = true;
    }
    
    return { 
      activeSounds: newSounds,
      ...(isAdding && { isPausedBySystem: false })
    };
  }),
  
  setVolume: (soundId, volume) => set((state) => {
    if (state.activeSounds[soundId] !== undefined) {
      return { activeSounds: { ...state.activeSounds, [soundId]: volume } };
    }
    return state;
  }),
  
  clearMix: () => set({ activeSounds: {} }),

  stopTimer: () => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    set({ 
      isTimerRunning: false, 
      intervalId: null, 
      targetTimestamp: null,
      isSleepFlowActive: false 
    });
  },

  resetAll: () => {
    const state = get();
    state.stopTimer();
    set({ activeSounds: {}, timer: 0 });
  },

  setSystemPaused: (paused) => set({ isPausedBySystem: paused }),
  
  startTimer: (minutes) => {
    const state = get();
    if (state.intervalId) clearInterval(state.intervalId);
    
    const duration = minutes || state.timer;
    if (duration <= 0) return;

    const targetTimestamp = Date.now() + (duration * 60000);
    
    const intervalId = setInterval(() => {
      const storeState = get();
      const remainingMs = storeState.targetTimestamp - Date.now();
      
      if (remainingMs <= 500) {
        storeState.stopTimer();
        // Don't clear mix here, let the modal or user handle it
        set({ showSleepModal: true });
      }
    }, 1000);
    
    set({ 
      isTimerRunning: true, 
      intervalId, 
      targetTimestamp,
      timer: duration 
    });
  },

  setTimer: (minutes) => {
    set({ timer: minutes });
    if (minutes > 0) {
      get().startTimer(minutes);
    } else {
      get().stopTimer();
    }
  },

  setShowSleepModal: (show) => set({ showSleepModal: show }),
  
  toggleTimer: () => {
    const state = get();
    if (state.isTimerRunning) {
      state.stopTimer();
    } else if (state.timer > 0) {
      state.startTimer();
    }
  },
}));

export default useMixerStore;
