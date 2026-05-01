import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

interface HeaderComponentProps {
  title?: string;
  subtitle?: string;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  title = "Huzura Yolculuk",
  subtitle = "Ruhunuzu dinlendirecek en özel seslerle derin bir uykuya ve iç huzura kapı aralayın."
}) => {
  return (
    <View style={styles.container}>
      <MaskedView
        maskElement={<Text style={styles.title}>{title}</Text>}
        style={styles.maskedView}
      >
        <LinearGradient
          colors={['#91B2DF', '#4C1E9A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.title, { opacity: 0 }]}>{title}</Text>
        </LinearGradient>
      </MaskedView>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: layout.padding.screenHorizontal,
    paddingTop: 75,
    paddingBottom: 20,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  maskedView: {
    height: 40, // Enough height for 32px font
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Light',
    opacity: 0.5,
    marginTop: 14,
    textAlign: 'center',
  }
});

export default HeaderComponent;
