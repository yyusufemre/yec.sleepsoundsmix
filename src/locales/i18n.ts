import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from './tr.json';
import en from './en.json';
import es from './es.json';
import pt from './pt.json';
import de from './de.json';
import fr from './fr.json';
import ja from './ja.json';

const LANGUAGE_KEY = 'user-language';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  de: { translation: de },
  fr: { translation: fr },
  ja: { translation: ja },
};

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      
      const locales = RNLocalize.getLocales();
      if (locales && locales.length > 0) {
        const bestLanguage = locales[0].languageCode;
        // Support only our available languages, fallback to English
        const fallback = resources[bestLanguage as keyof typeof resources] ? bestLanguage : 'en';
        return callback(fallback);
      }
      
      return callback('en');
    } catch (error) {
      console.log('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
