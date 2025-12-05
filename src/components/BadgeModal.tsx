import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

type Props = {
  visible: boolean;
  onClose: () => void;
  badges: string[];
  title?: string;
};

export default function BadgeModal({ visible, onClose, badges, title = 'Achievement Unlocked!' }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  // Animate the modal card when it appears
  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }).start();
    } else {
      scaleAnim.setValue(0.7);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.badgesContainer}>
            {badges.map((b) => (
              <Text key={b} style={styles.badgeText}>🏅 {formatBadge(b)}</Text>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Awesome</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Confetti only shows when modal is visible */}
        {visible && <ConfettiCannon count={120} origin={{ x: -10, y: 0 }} fadeOut />}
      </View>
    </Modal>
  );
}

function formatBadge(id: string) {
  switch (id) {
    case '3-day': return '3-day streak';
    case '7-day': return '7-day streak';
    case '30-day': return '30-day streak';
    case 'perfect-week': return 'Perfect week';
    default: return id;
  }
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '82%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#333' },
  badgesContainer: { marginVertical: 15, alignItems: 'center' },
  badgeText: { fontSize: 17, marginVertical: 4, fontWeight: '600', color: '#555' },
  button: {
    marginTop: 10,
    backgroundColor: '#1D9BF0',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
