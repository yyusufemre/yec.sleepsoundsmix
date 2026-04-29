import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const useMixerStore = create(
  persist(
    (set, get) => ({
      activeSounds: {},
      unlockedSoundIds: [],
      savedMixes: [], // [{ id, name, sounds: {soundId: volume}, createdAt }]

      timer: 0,
      isTimerRunning: false,
      intervalId: null,
      targetTimestamp: null,
      isPausedBySystem: false,
      showSleepModal: false,
      isSleepFlowEnabled: false,
      isSleepFlowActive: false,

      saveMix: (name) => set((state) => {
        if (Object.keys(state.activeSounds).length === 0) return state;
        const newMix = {
          id: Date.now().toString(),
          name: name.trim() || 'Kaydedilmiş Mix',
          sounds: { ...state.activeSounds },
          createdAt: Date.now(),
        };
        return { savedMixes: [...state.savedMixes, newMix] };
      }),

      loadMix: (id) => set((state) => {
        const mix = state.savedMixes.find(m => m.id === id);
        if (!mix) return state;
        return { activeSounds: { ...mix.sounds }, isPausedBySystem: false };
      }),

      deleteSavedMix: (id) => set((state) => ({
        savedMixes: state.savedMixes.filter(m => m.id !== id),
      })),

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
        console.log(`[toggleSound] Attempting to toggle: ${soundId}`);
        const activeSounds = state.activeSounds || {};
        const newSounds = { ...activeSounds };
        let isAdding = false;
        
        if (newSounds[soundId] !== undefined) {
          console.log(`[toggleSound] Removing sound: ${soundId}`);
          delete newSounds[soundId];
        } else {
          const currentCount = Object.keys(newSounds).length;
          if (currentCount >= 8) {
            console.log(`[toggleSound] Limit reached for sound: ${soundId}`);
            Alert.alert(
              'Limit Aşıldı',
              'Aynı anda en fazla 8 farklı ses karıştırabilirsiniz. Lütfen yeni bir ses eklemeden önce mevcut seslerden birini çıkarın.',
              [{ text: 'Tamam' }]
            );
            return state;
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
    }),
    {
      name: 'mixer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        unlockedSoundIds: state.unlockedSoundIds,
        savedMixes: state.savedMixes,
      }),
    }
  )
);

export default useMixerStore;
