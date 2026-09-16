import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {TextInput, TouchableOpacity, Modal} from 'react-native';
import {createInstance} from 'i18next';
import {I18nextProvider} from 'react-i18next';
import SaveMixForm from '../src/components/SaveMixForm';
import SavedMixRow from '../src/components/SavedMixRow';
import AppButton from '../src/components/AppButton';
import IconButton from '../src/components/IconButton';
import LanguageSelectorModal from '../src/components/LanguageSelectorModal';

jest.mock('react-native-vector-icons/FontAwesome6', () => 'Icon');
jest.mock('../src/components/GlassBlur', () => 'GlassBlur');
jest.mock('react-native-safe-area-context', () => ({useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0})}));
const languages = ['en', 'tr', 'de', 'es', 'fr', 'pt', 'ja'];
let tree: renderer.ReactTestRenderer;
afterEach(async () => {if (tree) await act(async () => tree.unmount());});
async function mount(content: React.ReactNode, lng = 'en') {
 const i18n = createInstance();
 await i18n.init({lng, fallbackLng: false, resources: {[lng]: {translation: require(`../src/locales/${lng}.json`)}}, interpolation: {escapeValue: false}});
 await act(async () => {tree = renderer.create(<I18nextProvider i18n={i18n}>{content}</I18nextProvider>);});
 return i18n;
}
it('saves from both the keyboard action and the shared button', async () => {
 const save = jest.fn(); const change = jest.fn();
 await mount(<SaveMixForm value="A very long mix name" onChangeText={change} onSave={save} />);
 const input = tree.root.findByType(TextInput);
 act(() => input.props.onChangeText('Rain'));
 expect(change).toHaveBeenCalledWith('Rain');
 act(() => input.props.onSubmitEditing());
 act(() => tree.root.findByType(AppButton).props.onPress());
 expect(save).toHaveBeenCalledTimes(2);
});
it('keeps loading play disabled while preserving delete action and full mix name', async () => {
 const remove = jest.fn(); const name = 'Rain and forest '.repeat(20);
 await mount(<SavedMixRow name={name} count={4} loading disabled onPlay={jest.fn()} onDelete={remove} />);
 const buttons = tree.root.findAllByType(IconButton);
 expect(buttons[0].findByType(TouchableOpacity).props.disabled).toBe(true);
 expect(buttons[0].findByType(TouchableOpacity).props.accessibilityState.busy).toBe(true);
 act(() => buttons[1].props.onPress());
 expect(remove).toHaveBeenCalledTimes(1);
 expect(buttons[1].props.accessibilityLabel).toContain(name);
});
it.each(languages)('renders translated modal controls and changes language in %s', async lng => {
 const change = jest.fn(); const close = jest.fn();
 const i18n = await mount(<LanguageSelectorModal isVisible currentLanguage={lng} onClose={close} onChangeLanguage={change} />, lng);
 expect(i18n.exists('common.close')).toBe(true);
 const choices = tree.root.findAllByType(TouchableOpacity).filter(node => node.props.accessibilityRole === 'radio');
 expect(choices).toHaveLength(7);
 expect(choices.filter(node => node.props.accessibilityState.selected)).toHaveLength(1);
 act(() => choices[0].props.onPress());
 expect(change).toHaveBeenCalledTimes(1);
 expect(close).toHaveBeenCalledTimes(1);
 act(() => tree.root.findByType(Modal).props.onRequestClose());
 expect(close).toHaveBeenCalledTimes(2);
});
it('marks a loading shared action unavailable to prevent duplicate submission', async () => {
 await mount(<AppButton title="Save" loading onPress={jest.fn()} />);
 const button = tree.root.findByType(TouchableOpacity);
 expect(button.props.disabled).toBe(true);
 expect(button.props.accessibilityState).toEqual({disabled: true, busy: true});
});
