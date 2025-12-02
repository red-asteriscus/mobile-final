// src/components/HabitCard.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types/HabitTypes';
import { getTodayDate } from '../data/HabitUtils';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onLongPress: () => void;
  onOpenDetail?: () => void;
  recentBadge?: boolean; // <- used to trigger inline celebration
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onLongPress, onOpenDetail, recentBadge }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const today = getTodayDate();
  const done = habit.completedDates.includes(today);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 110, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [done]);

  useEffect(() => {
    if (recentBadge) {
      badgeScale.setValue(0);
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
      setTimeout(() => {
        Animated.timing(badgeScale, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      }, 1800);
    }
  }, [recentBadge]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle(habit.id);
        }}
        onLongPress={onLongPress}
      >
        <View style={[styles.card, { backgroundColor: habit.color || '#fff' }]}>
          <View style={styles.left}>
            <Text style={styles.emoji}>{habit.emoji}</Text>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.title}>{habit.title}</Text>
              <Text style={styles.cat}>{habit.category}</Text>
              <Text style={styles.small}>XP: {habit.xp || 0}</Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={36} color={done ? '#0f9d58' : '#333'} />
            <TouchableOpacity onPress={onOpenDetail} style={{ marginTop: 6 }}>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>

            {/* inline badge pop */}
            <Animated.View style={[styles.badgePop, { transform: [{ scale: badgeScale }] }]}>
              <Text style={{ fontSize: 18 }}>🏅</Text>
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default HabitCard;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  card: {
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 34 },
  title: { fontSize: 16, fontWeight: '700' },
  cat: { marginTop: 4, fontSize: 12, color: '#333', opacity: 0.85 },
  small: { fontSize: 11, color: '#333', marginTop: 4 },
  badgePop: {
    marginTop: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
