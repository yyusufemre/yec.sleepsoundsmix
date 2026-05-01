import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, StatusBar, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalAudioPlayer from './src/components/GlobalAudioPlayer';
import SleepTimerModal from './src/components/SleepTimerModal';
import { setupTrackPlayer } from './src/services/TrackPlayerSetup';
import useMixerStore from './src/store/useMixerStore';
import SleepFlowOverlay from './src/components/SleepFlowOverlay';
import OnboardingScreen from './src/screens/OnboardingScreen';

const ONBOARDING_KEY = '@sleepsoundsmix:onboarding_done';

const App = () => {
  const isSleepFlowActive = useMixerStore(state => state.isSleepFlowActive);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    setupTrackPlayer();

    // Check if onboarding has been completed
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then(value => {
        setOnboardingDone(value === 'true');
      })
      .catch(() => {
        // Storage error — assume first run and show onboarding
        setOnboardingDone(false);
      });
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // Storage write failed — proceed anyway, onboarding will show once more next launch
    } finally {
      setOnboardingDone(true);
    }
  };

  // Wait for AsyncStorage check before rendering
  if (onboardingDone === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="rgba(255,255,255,0.3)" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ImageBackground
          source={require('./assets/app_bg.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {!onboardingDone ? (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          ) : (
            <>
              <AppNavigator />
              <GlobalAudioPlayer />
              <SleepTimerModal />
              <Modal
                visible={isSleepFlowActive}
                transparent
                animationType="fade"
                statusBarTranslucent
              >
                <SleepFlowOverlay />
              </Modal>
            </>
          )}
        </ImageBackground>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loader: {
    flex: 1,
    backgroundColor: '#0D1319',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
