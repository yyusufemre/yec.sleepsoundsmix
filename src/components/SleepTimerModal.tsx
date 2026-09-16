import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import useMixerStore from '../store/useMixerStore';
import { useTranslation } from 'react-i18next';
import ModalShell from './ModalShell';
import AppText from './AppText';
import AppButton from './AppButton';
const SleepTimerModal = () => {
  const showSleepModal = useMixerStore(state => state.showSleepModal);
  const popupDeadlineTimestamp = useMixerStore(
    state => (state as any).popupDeadlineTimestamp,
  );
  const extendTimer10Minutes = useMixerStore(
    state => (state as any).extendTimer10Minutes,
  );
  const [countdown, setCountdown] = useState(15);
  const { t } = useTranslation();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const updateCountdown = () => {
      if (popupDeadlineTimestamp) {
        const remaining = Math.max(
          0,
          Math.ceil((popupDeadlineTimestamp - Date.now()) / 1000),
        );
        setCountdown(remaining);
      } else {
        setCountdown(15);
      }
    };

    if (showSleepModal) {
      updateCountdown();
      interval = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showSleepModal, popupDeadlineTimestamp]);

  return (
    <ModalShell visible={showSleepModal} inline>
      <AppText
        variant="h3"
        weight="bold"
        align="center"
        accessibilityRole="header"
      >
        {t('timer.are_you_asleep')}
      </AppText>
      <AppText variant="caption" color="secondary" align="center">
        {Platform.OS === 'android'
          ? t('timer.app_will_close', { count: countdown })
          : t('timer.sounds_will_stop', { count: countdown })}
      </AppText>
      <AppButton
        title={t('timer.ten_more_minutes')}
        variant="gradient"
        size="medium"
        onPress={extendTimer10Minutes}
      />
    </ModalShell>
  );
};
export default SleepTimerModal;
