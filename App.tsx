import React, { useEffect } from 'react';
import { View, StyleSheet, ImageBackground, StatusBar, Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalAudioPlayer from './src/components/GlobalAudioPlayer';
import SleepTimerModal from './src/components/SleepTimerModal';
import { setupTrackPlayer } from './src/services/TrackPlayerSetup';
import useMixerStore from './src/store/useMixerStore';
import SleepFlowOverlay from './src/components/SleepFlowOverlay';

const App = () => {
  const { isSleepFlowActive } = useMixerStore();
  
  useEffect(() => {
    setupTrackPlayer();
  }, []);

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
        </ImageBackground>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fallback color
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default App;
