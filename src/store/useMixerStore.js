import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { MOCK_SOUNDS } from '../data/mockSounds';

const AD_ACCESS_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const useMixerStore = create(
  persist(
    (set, get) => ({
      activeSounds: {}, // { soundId: volume }
      adAccess: {}, // { soundId: { expiresAt } }
      unlockedSoundIds: [], // Permanent unlocks (e.g. premium)
      savedMixes: [], // [{ id, name, sounds: [{ id, volume, access }], createdAt }]

      timer: 0,
      isTimerRunning: false,
      intervalId: null,
      targetTimestamp: null,
      isPausedBySystem: false,
      showSleepModal: false,
      isSleepFlowEnabled: false,
      isSleepFlowActive: false,
      hasRated: false, // Track if native in-app review was shown

      // HELPERS
      isSoundAccessible: (soundId) => {
        const sound = MOCK_SOUNDS.find(s => s.id === soundId);
        if (!sound) return false;
        if (!sound.isLocked) return true;

        const state = get();
        // Check permanent unlock
        if (state.unlockedSoundIds.includes(soundId)) return true;

        // Check temporary ad access
        const access = state.adAccess[soundId];
        if (access && access.expiresAt > Date.now()) return true;

        return false;
      },

      grantAdAccess: (soundId) => set((state) => {
        const expiresAt = Date.now() + AD_ACCESS_DURATION;
        const newAdAccess = { ...state.adAccess };
        
        // 1. Grant access to the requested sound
        newAdAccess[soundId] = { expiresAt };

        // 2. Grant bonus access to the next locked sound in the list
        const currentIndex = MOCK_SOUNDS.findIndex(s => s.id === soundId);
        if (currentIndex !== -1) {
          const nextLockedSound = MOCK_SOUNDS.slice(currentIndex + 1).find(s => {
            const isActuallyLocked = s.isLocked && !state.unlockedSoundIds.includes(s.id);
            const currentAccess = state.adAccess[s.id];
            const hasActiveAccess = currentAccess && currentAccess.expiresAt > Date.now();
            return isActuallyLocked && !hasActiveAccess;
          });

          if (nextLockedSound) {
            newAdAccess[nextLockedSound.id] = { expiresAt };
            console.log(`[grantAdAccess] Bonus granted for: ${nextLockedSound.id}`);
          }
        }

        return { adAccess: newAdAccess };
      }),

      saveMix: (name) => {
        const state = get();
        const activeIds = Object.keys(state.activeSounds);
        if (activeIds.length === 0) return false;

        const mixSounds = [];
        activeIds.forEach(id => {
          const sound = MOCK_SOUNDS.find(s => s.id === id);
          if (!sound) return;

          const isFree = !sound.isLocked;
          const hasCurrentAccess = state.isSoundAccessible(id);

          if (isFree) {
            mixSounds.push({
              id,
              volume: state.activeSounds[id],
              access: 'free'
            });
          } else if (hasCurrentAccess) {
            mixSounds.push({
              id,
              volume: state.activeSounds[id],
              access: 'ad_snapshot'
            });
          }
        });

        if (mixSounds.length === 0) {
          Alert.alert('Kısıtlı Erişim', 'Mixinizdeki tüm reklamlı seslerin süresi dolmuş. Lütfen sesleri tekrar aktif ederek kaydedin.');
          return false;
        }

        const currentMixCount = state.savedMixes.length;
        const defaultName = `Kaydedilen Mix ${currentMixCount + 1}`;

        const newMix = {
          id: Date.now().toString(),
          name: name && name.trim() ? name.trim() : defaultName,
          sounds: mixSounds,
          createdAt: Date.now(),
        };

        set({ savedMixes: [...state.savedMixes, newMix] });
        return true;
      },

      loadMix: (id) => set((state) => {
        const mix = state.savedMixes.find(m => m.id === id);
        if (!mix) return state;

        const newActiveSounds = {};
        if (Array.isArray(mix.sounds)) {
          // New format: [{ id, volume, access }]
          mix.sounds.forEach(s => {
            newActiveSounds[s.id] = s.volume;
          });
        } else if (mix.sounds && typeof mix.sounds === 'object') {
          // Old format: { [id]: volume }
          Object.assign(newActiveSounds, mix.sounds);
        }

        return { activeSounds: newActiveSounds, isPausedBySystem: false };
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
        const activeSounds = state.activeSounds || {};
        const newSounds = { ...activeSounds };
        let isAdding = false;
        
        if (newSounds[soundId] !== undefined) {
          delete newSounds[soundId];
        } else {
          // Check access before adding
          if (!get().isSoundAccessible(soundId)) {
            console.log(`[toggleSound] Access denied for: ${soundId}`);
            return state;
          }

          const currentCount = Object.keys(newSounds).length;
          if (currentCount >= 8) {
            Alert.alert(
              'Limit Aşıldı',
              'Aynı anda en fazla 8 farklı ses karıştırabilirsiniz.',
              [{ text: 'Tamam' }]
            );
            return state;
          }
          newSounds[soundId] = 50;
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
      
      setHasRated: (rated) => set({ hasRated: rated }),
      
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
        adAccess: state.adAccess,
        hasRated: state.hasRated,
      }),
    }
  )
);

export default useMixerStore;
