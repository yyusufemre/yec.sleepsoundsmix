import { TFunction } from 'i18next';

export const getLocalizedSoundTitle = (
  sound: any, 
  currentLanguage: string, 
  t: TFunction
): string => {
  if (!sound) return '';
  
  const baseLanguage = currentLanguage.split('-')[0];
  
  if (sound.titleTranslations) {
    if (sound.titleTranslations[currentLanguage]) {
      return sound.titleTranslations[currentLanguage];
    }
    if (sound.titleTranslations[baseLanguage]) {
      return sound.titleTranslations[baseLanguage];
    }
    if (sound.titleTranslations.en) {
      return sound.titleTranslations.en;
    }
  }
  
  return t(`sounds.${sound.id}.title`, { defaultValue: sound.title || '' });
};
