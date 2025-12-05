// src/screens/LaunchScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app';

type Props = NativeStackScreenProps<RootStackParamList, 'Launch'>;

const LaunchScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to the main tab navigator after splash
      navigation.replace('MainTabs'); // ✅ Correct route name
    }, 1500); // Splash delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💪 HabitTracker</Text>
      <ActivityIndicator size="large" color="#1D9BF0" style={{ marginTop: 20 }} />
      <Text style={styles.subtitle}>Track. Reflect. Grow.</Text>
    </View>
  );
};

export default LaunchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },
  logo: { fontSize: 36, fontWeight: '800' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10 },
});
