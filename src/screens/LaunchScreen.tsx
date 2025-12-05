// src/screens/LaunchScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app';

type Props = NativeStackScreenProps<RootStackParamList, 'Launch'>;

const LaunchScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // initial opacity 0

  useEffect(() => {
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Navigate to MainTabs after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('MainTabs'); 
    }, 3000); // slightly longer splash

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.logo, { opacity: fadeAnim }]}>
        Habit Tracker 🚀
      </Animated.Text>
      <ActivityIndicator size="large" color="#A593E0" style={{ marginTop: 20 }} />
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
        Track. Reflect. Grow.
      </Animated.Text>
    </View>
  );
};

export default LaunchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },
  logo: { fontSize: 36, fontWeight: '800', color: '#A593E0' }, // lilac color
  subtitle: { fontSize: 16, color: '#666', marginTop: 10 },
});
