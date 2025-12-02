// components/BadgeModal.tsx
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

type Props = {
  visible: boolean;
  onClose: () => void;
  badges: string[];
  title?: string;
};

export default function BadgeModal({ visible, onClose, badges, title = 'Achievement Unlocked!' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={{ marginVertical: 12 }}>
            {badges.map((b) => (
              <Text key={b} style={styles.badgeText}>🏅 {formatBadge(b)}</Text>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Awesome</Text>
          </TouchableOpacity>
        </View>
        {/* Confetti */}
        <ConfettiCannon count={120} origin={{ x: -10, y: 0 }} fadeOut />
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
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '82%', backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  badgeText: { fontSize: 16, marginVertical: 4 },
  button: { marginTop: 12, backgroundColor: '#6200EE', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
});
