import { getApp } from '@react-native-firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent } from '@react-native-firebase/analytics';

type EventParams = Record<string, string | number | null | undefined>;

const MAX_PARAM_LENGTH = 100;

const cleanString = (value: string) => value.slice(0, MAX_PARAM_LENGTH);

const cleanParams = (params: EventParams = {}) =>
  Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [
        key,
        typeof value === 'string' ? cleanString(value) : value,
      ]),
  );

export const trackEvent = (name: string, params?: EventParams) => {
  firebaseLogEvent(getAnalytics(getApp()), name, cleanParams(params))
    .catch(error => {
      if (__DEV__) {
        console.log('[Analytics] logEvent failed:', name, error);
      }
    });
};

export const soundIdsParam = (soundIds: string[]) =>
  soundIds.slice(0, 8).join(',');
