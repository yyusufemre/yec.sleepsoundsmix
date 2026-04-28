export const colors = {
  background: {
    center: '#3C3A4E',
    middle: '#252634',
    edge: '#0D1319',
    overlay: 'rgba(0,0,0,0.85)',
    modal: '#161B26',
    modalHeader: '#1F2633',
    logo: '#3B4B65',
  },
  accent: {
    primary: '#3471EC',
    success: '#47F185', // Replaced #68D051 with the one used in UI
    warning: '#DC9D20',
    danger: '#EF324B',
    orange: '#EF720D', // Used in Settings & Modals
    orangeGradient: ['#EF720D', '#E05D00'], // Used in Call to Action buttons
    star: '#FFC900', // Settings rating
  },
  glass: {
    cardNormal: ['rgba(141, 165, 208, 0.15)', 'rgba(72, 84, 106, 0.05)'], // Standardized from 0.2
    cardPremium: ['rgba(100, 152, 212, 0.2)', 'rgba(76, 30, 154, 0.2)'],
    cardAd: ['rgba(141, 165, 208, 0.4)', 'rgba(72, 84, 106, 0.4)'],
    cardActive: ['rgba(141, 165, 208, 0.15)', 'rgba(52, 113, 236, 0.2)'], // Used for active SoundCard
    border: 'rgba(255, 255, 255, 0.1)', // Standardized border opacity
    buttonSecondary: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.6)', // Standardized
    muted: 'rgba(255, 255, 255, 0.3)',
    inactive: '#8191AB', // Used in Timer/Settings
    dark: '#000000',
    gradientStart: '#8491A1',
    gradientEnd: '#4C1E9A',
  },
  badge: {
    ad: '#FABB18',
  },
  navigation: {
    background: '#19202B',
    inactiveIcon: 'rgba(255, 255, 255, 0.2)',
  }
};
