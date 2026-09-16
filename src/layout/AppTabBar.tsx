import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MiniPlayer from '../components/MiniPlayer';

/** Both controls occupy real layout space, so scenes never need guessed bottom offsets. */
export default function AppTabBar(props: BottomTabBarProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(Keyboard.isVisible());
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardVisible) return null;
  return (
    <View style={styles.container}>
      <MiniPlayer onOpenMixer={() => props.navigation.navigate('Mixer')} />
      <BottomTabBar {...props} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flexShrink: 0 } });
