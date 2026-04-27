import React from 'react';
import { View } from 'react-native';
import Video from 'react-native-video';
import useMixerStore from '../store/useMixerStore';
import { MOCK_SOUNDS } from '../data/mockSounds';

const GlobalAudioPlayer = () => {
  const { activeSounds, isPausedBySystem } = useMixerStore();

  const activeSoundItems = MOCK_SOUNDS.filter(s => activeSounds[s.id] !== undefined);

  if (activeSoundItems.length === 0) return null;

  return (
    <View style={{ width: 0, height: 0, opacity: 0 }}>
      {activeSoundItems.map(sound => {
        const volume = activeSounds[sound.id] / 100;
        return (
          <Video
            key={sound.id}
            source={{ uri: sound.url }}
            repeat={true}
            volume={volume}
            paused={isPausedBySystem}
            playInBackground={true}
            ignoreSilentSwitch="ignore"
            disableFocus={true}
            mixWithOthers="mix"
            style={{ width: 0, height: 0 }}
          />
        );
      })}
    </View>
  );
};

export default GlobalAudioPlayer;
