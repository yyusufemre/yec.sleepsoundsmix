import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { soundIdsParam, trackEvent } from '../services/AnalyticsService';
import i18n from '../locales/i18n';
import LOCAL_SOUNDS from '../../soundlist.json';
import NativeSoundManager from '../services/NativeSoundManager';
import TrackPlayer from 'react-native-track-player';

const AD_ACCESS_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const LEGACY_SOUND_ID_MAP = {
  yagmur1: 'yagmur-sesi-1',
  deniz1: 'deniz-sesi-1',
  ruzgar1: 'firtina-sesi-1',
  ates1: 'ates-sesi-1',
  beyaz1: 'fan-sesi',
  piyano1: 'hafif-piyano-muzik',
  kus1: 'kus-sesi-1',
  sakin1: 'hafif-muzik',
  guguk1: 'guguk-kusu',
  tren1: 'tren-sesi',
  orman1: 'orman-sesi',
  firtina1: 'simsek-sesi-1',
  prenses1: 'prensesler-icin-muzik',
  can1: 'sakinlestirici-muzik-1',
  lofi1: 'hayal-modu-muzik',
  uzay1: 'ambiyans-music',
  bulbul1: 'bulbul-sesi-1',
  cekirge1: 'cekirge-sesi-1',
  gok1: 'gok-gurultusu-ses-1',
  simsek2: 'gok-gurultusu-sesi-2',
  yagmur2: 'yagmur-sesi-2',
  sahil1: 'sahil-sesi-1',
  piyano2: 'piyano-muzik',
  sinek1: 'sinek-sesi-1',
  kafe2: 'cafe-ambiyansi',
  deniz2: 'deniz-alti-sesi',
  dere1: 'dere-kenari',
  derin1: 'derin-dusunce-ses',
  kar1: 'karda-yuruyus',
  kedi1: 'kedi-mirlamasi',
  lofi2: 'lo-fi-sabah-muzik',
  sinyal1: 'no-sinyal',
  rabarba1: 'rabarba-sesi',
  tarla1: 'tarla-sesi',
};

const resolveSoundId = (soundId) => LEGACY_SOUND_ID_MAP[soundId] || soundId;

const normalizeSoundMap = (sounds, scalePresetVolumes = false) => {
  const normalized = {};
  Object.entries(sounds || {}).forEach(([id, volume]) => {
    const resolvedId = resolveSoundId(id);
    const numericVolume = typeof volume === 'number' ? volume : 50;
    normalized[resolvedId] = scalePresetVolumes
      ? Math.round(numericVolume * 100)
      : numericVolume;
  });
  return normalized;
};

const useMixerStore = create(
  persist(
    (set, get) => ({
      activeSounds: {}, // { soundId: volume }
      adAccess: {}, // { soundId: { expiresAt } }
      unlockedSoundIds: [], // Permanent unlocks (e.g. premium)
      savedMixes: [], // [{ id, name, sounds: [{ id, volume, access }], bpm, createdAt }]
      metronomBpm: 60, // Active BPM for the metronome (20-180)

      sounds: [],
      fetchSounds: async () => {
        try {
          // 1. Immediately seed with local bundled list if store is empty or outdated
          const current = get().sounds || [];
          if (current.length < LOCAL_SOUNDS.length) {
            set({ sounds: LOCAL_SOUNDS });
            if (__DEV__) {
              console.log('Sounds seeded from local bundle:', LOCAL_SOUNDS.length);
            }
          }

          // 2. Try to freshen from Firebase (cache-busted)
          const url = 'https://firebasestorage.googleapis.com/v0/b/comyecsleepsoundsmix.firebasestorage.app/o/soundlist.json?alt=media' + '&cb=' + Date.now();

          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data) && data.length > 0) {
              // Schema validation: remote list is applied only if all elements are completely valid
              const allValid = data.every(s => {
                return (
                  s &&
                  typeof s.id === 'string' && s.id.trim().length > 0 &&
                  typeof s.title === 'string' && s.title.trim().length > 0 &&
                  typeof s.category === 'string' && s.category.trim().length > 0 &&
                  typeof s.icon === 'string' && s.icon.trim().length > 0 &&
                  typeof s.url === 'string'
                );
              });

              if (allValid) {
                // Merge: prefer remote but keep any local-only entries (e.g. metronome if remote is older)
                const remoteIds = new Set(data.map(s => s.id));
                const localOnly = LOCAL_SOUNDS.filter(s => !remoteIds.has(s.id));
                const merged = [...localOnly, ...data];
                set({ sounds: merged });
                if (__DEV__) {
                  console.log('Sounds updated from cloud:', data.length, '+ local-only:', localOnly.length);
                }
              } else {
                console.warn('[fetchSounds] Remote soundlist contains invalid elements. Keeping current sounds.');
              }
            } else {
              console.warn('[fetchSounds] Remote soundlist is empty or malformed. Keeping current sounds.');
            }
          }
        } catch (e) {
          if (__DEV__) {
            console.log('Failed to fetch sounds:', e);
          }
        }
      },

      timer: 0,
      isTimerRunning: false,
      intervalId: null,
      targetTimestamp: null,
      popupStartTimestamp: null,
      popupDeadlineTimestamp: null,
      activeDeadlineId: null,
      isPausedBySystem: false,
      showSleepModal: false,
      isSleepFlowEnabled: false,
      isSleepFlowActive: false,
      hasRated: false, // Track if native in-app review was shown
      notificationsEnabled: false,
      fcmToken: null,
      activePresetId: null, // Tracks if a specific builtin preset is currently active
      activeMixId: null, // Tracks if a specific saved mix is currently active
      canRequestAds: false,
      setCanRequestAds: (allowed) => set({ canRequestAds: allowed }),

      // HELPERS
      isSoundAccessible: (soundId) => {
        const resolvedSoundId = resolveSoundId(soundId);
        const sounds = get().sounds || [];
        const sound = sounds.find(s => s.id === resolvedSoundId);
        if (!sound) return false;
        if (!sound.isLocked) return true;

        const state = get();
        // Check permanent unlock
        const unlockedIds = state.unlockedSoundIds || [];
        if (unlockedIds.includes(resolvedSoundId)) return true;

        // Check temporary ad access
        const access = state.adAccess && state.adAccess[resolvedSoundId];
        if (access && access.expiresAt > Date.now()) return true;

        return false;
      },

      grantAdAccess: (soundId) => set((state) => {
        const resolvedSoundId = resolveSoundId(soundId);
        const expiresAt = Date.now() + AD_ACCESS_DURATION;
        const newAdAccess = { ...(state.adAccess || {}) };

        // 1. Grant access to the requested sound
        newAdAccess[resolvedSoundId] = { expiresAt };
        const grantedIds = [resolvedSoundId];

        // 2. Grant bonus access to the next 2 locked sounds in the list (making a total of 3 unlocked sounds)
        const sounds = get().sounds || [];
        const currentIndex = sounds.findIndex(s => s.id === resolvedSoundId);
        if (currentIndex !== -1) {
          const nextLockedSounds = sounds.slice(currentIndex + 1).filter(s => {
            const isActuallyLocked = s.isLocked && !(state.unlockedSoundIds || []).includes(s.id);
            const currentAccess = state.adAccess && state.adAccess[s.id];
            const hasActiveAccess = currentAccess && currentAccess.expiresAt > Date.now();
            return isActuallyLocked && !hasActiveAccess;
          }).slice(0, 2); // Get up to 2 next locked sounds

          nextLockedSounds.forEach(nextSound => {
            newAdAccess[nextSound.id] = { expiresAt };
            grantedIds.push(nextSound.id);
            console.log(`[grantAdAccess] Bonus granted for: ${nextSound.id}`);
          });
        }

        trackEvent('ad_access_granted', {
          source: 'sound',
          sound_id: resolvedSoundId,
          grant_count: grantedIds.length,
          sound_ids: soundIdsParam(grantedIds),
        });
        return { adAccess: newAdAccess };
      }),

      saveMix: (name) => {
        const state = get();
        const activeIds = Object.keys(state.activeSounds);
        if (activeIds.length === 0) return false;

        const mixSounds = [];
        const hasMetronome = activeIds.includes('nefes-ritmi');
        activeIds.forEach(id => {
          const sound = get().sounds.find(s => s.id === id);
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
          Alert.alert(i18n.t('mixer.ad_snapshot_expired_title'), i18n.t('mixer.ad_snapshot_expired_msg'));
          return false;
        }

        const currentMixCount = state.savedMixes.length;
        const defaultName = i18n.t('mixer.default_mix_name', { count: currentMixCount + 1 });

        const newMix = {
          id: Date.now().toString(),
          name: name && name.trim() ? name.trim() : defaultName,
          sounds: mixSounds,
          bpm: hasMetronome ? state.metronomBpm : undefined,
          createdAt: Date.now(),
        };

        set({ savedMixes: [...state.savedMixes, newMix] });
        trackEvent('mix_saved', {
          sound_count: mixSounds.length,
          sound_ids: soundIdsParam(mixSounds.map(sound => sound.id)),
          custom_name: name && name.trim() ? 1 : 0,
          has_metronome: hasMetronome ? 1 : 0,
        });
        return true;
      },

      loadMix: (id) => {
        const state = get();
        const mix = state.savedMixes.find(m => m.id === id);
        if (!mix) return;

        const newActiveSounds = {};
        if (Array.isArray(mix.sounds)) {
          // New format: [{ id, volume, access }]
          mix.sounds.forEach(s => {
            const resolvedId = resolveSoundId(s.id);
            if (state.isSoundAccessible(resolvedId)) {
              newActiveSounds[resolvedId] = s.volume;
            } else {
              console.log(`[loadMix] Skipped locked sound without active access: ${resolvedId}`);
            }
          });
        } else if (mix.sounds && typeof mix.sounds === 'object') {
          // Old format: { [id]: volume }
          const normalized = normalizeSoundMap(mix.sounds);
          Object.entries(normalized).forEach(([soundId, volume]) => {
            if (state.isSoundAccessible(soundId)) {
              newActiveSounds[soundId] = volume;
            } else {
              console.log(`[loadMix] Skipped locked sound without active access: ${soundId}`);
            }
          });
        }

        const soundIds = Object.keys(newActiveSounds);
        trackEvent('mix_loaded', {
          mix_type: 'saved',
          sound_count: soundIds.length,
          sound_ids: soundIdsParam(soundIds),
        });

        set({
          activeSounds: newActiveSounds,
          isPausedBySystem: false,
          activePresetId: null,
          activeMixId: mix.id,
          // Restore BPM if this mix had a metronome
          ...(mix.bpm !== undefined ? { metronomBpm: mix.bpm } : {}),
        });
      },

      grantMultipleAdAccess: (soundIds) => set((state) => {
        const expiresAt = Date.now() + AD_ACCESS_DURATION;
        const newAdAccess = { ...(state.adAccess || {}) };
        const resolvedSoundIds = soundIds.map(resolveSoundId);
        resolvedSoundIds.forEach(id => {
          newAdAccess[id] = { expiresAt };
        });
        trackEvent('ad_access_granted', {
          source: 'preset',
          grant_count: resolvedSoundIds.length,
          sound_ids: soundIdsParam(resolvedSoundIds),
        });
        return { adAccess: newAdAccess };
      }),

      applyPreset: (sounds, id) => set((state) => {
        const newActiveSounds = normalizeSoundMap(sounds, true);
        const soundIds = Object.keys(newActiveSounds);
        trackEvent('preset_applied', {
          preset_id: id || 'unknown',
          sound_count: soundIds.length,
          sound_ids: soundIdsParam(soundIds),
        });
        return {
          activeSounds: newActiveSounds,
          isPausedBySystem: false,
          activePresetId: id || null,
          activeMixId: null
        };
      }),

      deleteSavedMix: (id) => set((state) => {
        const isActiveMixDeleted = state.activeMixId === id;
        return {
          savedMixes: state.savedMixes.filter(m => m.id !== id),
          ...(isActiveMixDeleted && { activeMixId: null })
        };
      }),

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
        const sounds = get().sounds || [];
        const sound = sounds.find(s => s.id === soundId);

        if (newSounds[soundId] !== undefined) {
          delete newSounds[soundId];
          trackEvent('sound_removed', {
            sound_id: soundId,
            category: sound ? sound.category : 'unknown',
            locked: sound && sound.isLocked ? 1 : 0,
            active_count: Object.keys(newSounds).length,
          });
        } else {
          // Check access before adding
          if (!get().isSoundAccessible(soundId)) {
            console.log(`[toggleSound] Access denied for: ${soundId}`);
            return state;
          }

          const currentCount = Object.keys(newSounds).length;
          if (currentCount >= 8) {
            Alert.alert(
              i18n.t('mixer.limit_reached_title'),
              i18n.t('mixer.limit_reached_msg'),
              [{ text: i18n.t('common.ok') }]
            );
            return state;
          }
          newSounds[soundId] = 50;
          isAdding = true;
          trackEvent('sound_added', {
            sound_id: soundId,
            category: sound ? sound.category : 'unknown',
            locked: sound && sound.isLocked ? 1 : 0,
            active_count: Object.keys(newSounds).length,
          });
        }

        return {
          activeSounds: newSounds,
          activePresetId: null, // Clear preset on manual change
          activeMixId: null, // Clear mix on manual change
          ...(isAdding && { isPausedBySystem: false })
        };
      }),

      setMetronomBpm: (bpm) => set({ metronomBpm: Math.min(180, Math.max(20, Math.round(bpm))) }),

      setVolume: (soundId, volume) => set((state) => {
        if (state.activeSounds[soundId] !== undefined) {
          return {
            activeSounds: { ...state.activeSounds, [soundId]: volume },
            activePresetId: null,
            activeMixId: null
          };
        }
        return state;
      }),

      clearMix: () => {
        const activeIds = Object.keys(get().activeSounds || {});
        if (activeIds.length > 0) {
          trackEvent('mix_cleared', {
            sound_count: activeIds.length,
            sound_ids: soundIdsParam(activeIds),
          });
        }
        set({ activeSounds: {}, activePresetId: null, activeMixId: null });
      },

      checkExpiredAccess: () => {
        const state = get();
        const activeIds = Object.keys(state.activeSounds || {});
        let changed = false;
        const newActiveSounds = { ...state.activeSounds };

        activeIds.forEach(id => {
          if (!state.isSoundAccessible(id)) {
            delete newActiveSounds[id];
            changed = true;
            console.log(`[checkExpiredAccess] Access expired, stopping sound: ${id}`);
          }
        });

        if (changed) {
          set({
            activeSounds: newActiveSounds,
            activePresetId: null,
            activeMixId: null,
          });
        }
      },

      // Manual user stop — cancels native hard-stop and closes popup, but leaves Sleep Flow open if active
      stopTimer: () => {
        const state = get();
        if (state.intervalId) clearInterval(state.intervalId);
        if (state.activeDeadlineId) {
          NativeSoundManager.cancelHardStop(state.activeDeadlineId);
        }
        set({
          isTimerRunning: false,
          intervalId: null,
          timer: 0,
          targetTimestamp: null,
          popupStartTimestamp: null,
          popupDeadlineTimestamp: null,
          activeDeadlineId: null,
          showSleepModal: false,
        });
      },

      // Trigger popup when entering the last 15 seconds of selected duration
      handlePopupTrigger: () => {
        set({
          showSleepModal: true,
        });
      },

      // "+10 minutes" action — cancels old native hard-stop, closes popup, keeps audio playing, starts new 10m timer
      extendTimer10Minutes: () => {
        const state = get();
        if (state.intervalId) clearInterval(state.intervalId);
        if (state.activeDeadlineId) {
          NativeSoundManager.cancelHardStop(state.activeDeadlineId);
        }
        set({ showSleepModal: false });
        get().startTimer(10);
      },

      // Central cleanup — stops audio, resets store state completely including timer selection
      executeSleepCleanup: () => {
        const state = get();
        if (state.intervalId) clearInterval(state.intervalId);
        if (state.activeDeadlineId) {
          NativeSoundManager.cancelHardStop(state.activeDeadlineId);
        }
        NativeSoundManager.stopAll();
        TrackPlayer.reset().catch(() => {});
        set({
          activeSounds: {},
          activePresetId: null,
          activeMixId: null,
          isTimerRunning: false,
          intervalId: null,
          timer: 0,
          targetTimestamp: null,
          popupStartTimestamp: null,
          popupDeadlineTimestamp: null,
          activeDeadlineId: null,
          showSleepModal: false,
          isSleepFlowActive: false,
        });
      },

      // Foreground state reconciliation — handles: running, last 15s popup window, past hardStop
      reconcileNativeState: async () => {
        const state = get();
        const now = Date.now();

        // 1. Query native hard-stop status
        const nativeStatus = await NativeSoundManager.getLastCompletedHardStop();
        if (nativeStatus && nativeStatus.lastCompletedId === state.activeDeadlineId && nativeStatus.didCleanup) {
          console.log('[reconcileNativeState] Native hard-stop already cleaned up in background.');
          get().executeSleepCleanup();
          return;
        }

        // 2. Evaluate timestamps if timer/deadline is set
        if (state.popupDeadlineTimestamp) {
          if (now >= state.popupDeadlineTimestamp) {
            console.log('[reconcileNativeState] Past hardStopTimestamp. Executing cleanup.');
            get().executeSleepCleanup();
          } else if (state.popupStartTimestamp && now >= state.popupStartTimestamp) {
            console.log('[reconcileNativeState] Inside last 15s window. Showing popup.');
            set({
              showSleepModal: true,
            });
          }
        }
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

        const now = Date.now();
        const hardStopTimestamp = now + (duration * 60000);
        const popupStartTimestamp = hardStopTimestamp - 15000;
        const deadlineId = now + '_' + Math.floor(Math.random() * 1000000);

        if (state.activeDeadlineId) {
          NativeSoundManager.cancelHardStop(state.activeDeadlineId);
        }

        // Schedule native hard-stop IMMEDIATELY for exact duration (now + duration * 60000)
        NativeSoundManager.scheduleHardStop(deadlineId, hardStopTimestamp, Platform.OS === 'android');

        const intervalId = setInterval(() => {
          const storeState = get();
          if (!storeState.isTimerRunning) return;

          const current = Date.now();
          if (current >= storeState.popupStartTimestamp && !storeState.showSleepModal) {
            storeState.handlePopupTrigger();
          }
        }, 1000);

        set({
          isTimerRunning: true,
          intervalId,
          targetTimestamp: hardStopTimestamp,
          popupStartTimestamp,
          popupDeadlineTimestamp: hardStopTimestamp,
          activeDeadlineId: deadlineId,
          timer: duration,
        });
      },

      clearTimerSelection: () => {
        set({ timer: 0 });
      },

      setTimer: (minutes) => {
        const state = get();
        set({ timer: minutes });
        if (minutes > 0) {
          get().startTimer(minutes);
        } else if (!state.activeDeadlineId && !state.showSleepModal && !state.popupDeadlineTimestamp) {
          get().stopTimer();
        }
      },

      setShowSleepModal: (show) => set({ showSleepModal: show }),
      setSleepFlowEnabled: (enabled) => set({ isSleepFlowEnabled: enabled }),
      setSleepFlowActive: (active) => set({ isSleepFlowActive: active, isSleepFlowEnabled: active }),
      setHasRated: (rated) => set({ hasRated: rated }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setFcmToken: (token) => set({ fcmToken: token }),

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
        notificationsEnabled: state.notificationsEnabled,
        fcmToken: state.fcmToken,
        sounds: state.sounds,
        metronomBpm: state.metronomBpm,
      }),
    }
  )
);

export default useMixerStore;
