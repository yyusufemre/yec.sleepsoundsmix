import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Keyboard, Platform } from 'react-native';
import AppTabBar from '../src/layout/AppTabBar';
import MiniPlayer from '../src/components/MiniPlayer';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';

jest.mock('@react-navigation/bottom-tabs', () => ({
  BottomTabBar: 'BottomTabBar',
}));
jest.mock('../src/components/MiniPlayer', () => 'MiniPlayer');

const initialPlatform = Platform.OS;
let tree: renderer.ReactTestRenderer;
let callbacks: Record<string, () => void>;
let removers: jest.Mock[];
const navigation = { navigate: jest.fn() };
const props = { navigation } as unknown as BottomTabBarProps;

beforeEach(() => {
  callbacks = {};
  removers = [];
  navigation.navigate.mockClear();
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
  jest.spyOn(Keyboard, 'addListener').mockImplementation((event, callback) => {
    callbacks[event] = callback as () => void;
    const remove = jest.fn();
    removers.push(remove);
    return { remove } as unknown as ReturnType<typeof Keyboard.addListener>;
  });
});

afterEach(async () => {
  if (tree) await act(async () => tree.unmount());
  Object.defineProperty(Platform, 'OS', {
    value: initialPlatform,
    configurable: true,
  });
  jest.restoreAllMocks();
});

it.each(['android', 'ios'] as const)(
  'hides the entire dock for the %s keyboard and restores both controls',
  async os => {
    Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
    await act(async () => {
      tree = renderer.create(<AppTabBar {...props} />);
    });
    expect(tree.root.findAllByType(MiniPlayer)).toHaveLength(1);
    expect(tree.root.findAllByType(BottomTabBar)).toHaveLength(1);
    await act(async () =>
      callbacks[os === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'](),
    );
    expect(tree.toJSON()).toBeNull();
    await act(async () =>
      callbacks[os === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'](),
    );
    expect(tree.root.findAllByType(MiniPlayer)).toHaveLength(1);
    expect(tree.root.findAllByType(BottomTabBar)).toHaveLength(1);
  },
);

it('does not cover an already-open keyboard when mounted', async () => {
  jest.mocked(Keyboard.isVisible).mockReturnValue(true);
  await act(async () => {
    tree = renderer.create(<AppTabBar {...props} />);
  });
  expect(tree.toJSON()).toBeNull();
});

it('opens Mixer through the tab navigator from the relocated player', async () => {
  await act(async () => {
    tree = renderer.create(<AppTabBar {...props} />);
  });
  tree.root.findByType(MiniPlayer).props.onOpenMixer();
  expect(navigation.navigate).toHaveBeenCalledWith('Mixer');
});

it('removes keyboard listeners on unmount', async () => {
  await act(async () => {
    tree = renderer.create(<AppTabBar {...props} />);
  });
  await act(async () => tree.unmount());
  expect(removers).toHaveLength(2);
  removers.forEach(remove => expect(remove).toHaveBeenCalledTimes(1));
});
