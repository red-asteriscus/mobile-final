// src/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreenProps, Habit } from '../types/HabitTypes';
import { getTodayDate, calculateStreak, saveHabits, cancelScheduledNotifications, awardBadgesForHabit } from '../data/HabitUtils';
import HabitCard from '../components/HabitCard';
import BadgeModal from '../components/BadgeModal';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, habits = [], setHabits }) => {
  const [celebrationBadges, setCelebrationBadges] = useState<string[]>([]);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [recentBadgeMap, setRecentBadgeMap] = useState<Record<string, boolean>>({});

  const toggleCompletion = async (id: string) => {
    const today = getTodayDate();
    const updated = habits.map((h) => {
      if (h.id !== id) return h;
      const doneToday = h.completedDates.includes(today);
      const newCompleted = doneToday ? h.completedDates.filter((d) => d !== today) : [...h.completedDates, today];
      // xp change on toggle
      const newXp = doneToday ? Math.max(0, (h.xp || 0) - 1) : (h.xp || 0) + 5;
      return { ...h, completedDates: newCompleted, xp: newXp };
    });

    // persist basic change
    setHabits(updated);
    await saveHabits(updated);

    // award badges for the changed habit (find it again)
    const changed = updated.find((x) => x.id === id);
    if (!changed) return;

    const result = awardBadgesForHabit(changed);
    if (result.awarded.length) {
      // update habit in storage with new badges/xp
      const merged = updated.map((h) => (h.id === id ? result.updatedHabit! : h));
      setHabits(merged);
      await saveHabits(merged);

      // show celebrations:
      setCelebrationBadges(result.awarded);
      setCelebrationVisible(true);

      // mark inline animation target for the habit
      setRecentBadgeMap((m) => ({ ...m, [id]: true }));
      // remove inline flag after animation time
      setTimeout(() => {
        setRecentBadgeMap((m) => {
          const copy = { ...m };
          delete copy[id];
          return copy;
        });
      }, 2500);
    }
  };

  const deleteHabit = (habit: Habit) => {
    Alert.alert('Delete Habit?', `"${habit.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelScheduledNotifications(habit.notificationIds);
          const updated = habits.filter((h) => h.id !== habit.id);
          setHabits(updated);
          await saveHabits(updated);
        },
      },
    ]);
  };

  const openDetail = (id: string) => navigation.navigate('Detail', { id });

  const renderHabit = ({ item }: { item: Habit }) => (
    <HabitCard
      habit={item}
      onToggle={toggleCompletion}
      onLongPress={() => deleteHabit(item)}
      onOpenDetail={() => openDetail(item.id)}
      recentBadge={!!recentBadgeMap[item.id]}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Habits</Text>

      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        renderItem={renderHabit}
        ListEmptyComponent={<Text style={styles.empty}>No habits yet. Tap + to add one.</Text>}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddHabit')}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <BadgeModal visible={celebrationVisible} badges={celebrationBadges} onClose={() => setCelebrationVisible(false)} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F8F8' },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  empty: { textAlign: 'center', marginTop: 60, color: '#888' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6200EE',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
