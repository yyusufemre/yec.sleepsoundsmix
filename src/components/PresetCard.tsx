import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/colors';

interface PresetCardProps {
  title: string;
  description: string;
  iconName: string;
  isAd?: boolean;
  onPress?: () => void;
}

const PresetCard: React.FC<PresetCardProps> = ({ title, description, iconName, isAd, onPress }) => {
  const gradientColors = isAd 
    ? ['rgba(141, 165, 208, 0.4)', 'rgba(72, 84, 106, 0.4)']
    : ['rgba(100, 152, 212, 0.2)', 'rgba(76, 30, 154, 0.2)'];

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Left Icon */}
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={24} color="#3471EC" solid />
          </View>

          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          </View>

          {/* Right Icon/Ad Label */}
          <View style={styles.rightContainer}>
            {isAd ? (
              <View style={styles.adBadge}>
                <Text style={styles.adText}>Ad</Text>
              </View>
            ) : (
              <Icon name="play" size={24} color="#47F185" solid />
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    opacity: 0.5,
    lineHeight: 16,
  },
  rightContainer: {
    width: 32,
    alignItems: 'center',
  },
  adBadge: {
    backgroundColor: '#47F185',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adText: {
    color: '#252634',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default PresetCard;
