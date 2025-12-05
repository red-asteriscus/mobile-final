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
  recentBadge?: boolean;
  streak: number;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onLongPress, onOpenDetail, recentBadge, streak }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(1)).current;
  const today = getTodayDate();
  const done = habit.completedDates.includes(today);
  const habitColor = habit.color || '#1D9BF0';

  // Card press feedback
  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  // Badge pop animation
  useEffect(() => {
    if (recentBadge) {
      badgeScale.setValue(0);
      Animated.spring(badgeScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
      setTimeout(() => Animated.timing(badgeScale, { toValue: 0, duration: 250, useNativeDriver: true }).start(), 1800);
    }
  }, [recentBadge]);

  // Checkmark pop animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(checkScale, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(checkScale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [done]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle(habit.id);
        }}
        onLongPress={onLongPress}
      >
        <View style={[styles.card, { borderColor: habitColor }]}>
          <View style={styles.left}>
            <View style={[styles.emojiContainer, { backgroundColor: habitColor + '20' }]}>
              <Text style={styles.emoji}>{habit.emoji}</Text>
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.title}>{habit.title}</Text>
              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: habitColor }]}>🔥 {streak} Day Streak</Text>
                <Text style={styles.metaText}> | ✨ {habit.xp || 0} XP</Text>
              </View>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', height: 70 }}>
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Ionicons
                name={done ? 'checkmark-circle' : 'ellipse-outline'}
                size={36}
                color={done ? '#4CAF50' : '#aaa'}
              />
            </Animated.View>

            <TouchableOpacity onPress={onOpenDetail} style={styles.detailButton}>
              <Ionicons name="chevron-forward-outline" size={20} color="#666" />
            </TouchableOpacity>

            <Animated.View style={[styles.badgePop, { transform: [{ scale: badgeScale }, { rotate: badgeScale.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '15deg'] }) }] }]}>
              <Text style={{ fontSize: 20 }}>🏅</Text>
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default HabitCard;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 15 },
  card: {
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderLeftWidth: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 90,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  title: { fontSize: 17, fontWeight: '700', color: '#333' },
  metaRow: { flexDirection: 'row', marginTop: 6, alignItems: 'center' },
  metaText: { fontSize: 12, fontWeight: '600', color: '#666' },
  detailButton: { marginTop: 6, paddingHorizontal: 4 },
  badgePop: {
    position: 'absolute',
    top: 50,
    right: 40,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
