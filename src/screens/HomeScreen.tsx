import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HomeScreenProps } from '../types/HabitTypes';
import { getTodayDate, calculateStreak, saveHabits, cancelScheduledNotification } from '../data/HabitUtils';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, habits = [], setHabits }) => {
  const toggleCompletion = async (id: string) => {
    const today = getTodayDate();
    const updated = habits.map(h =>
      h.id === id
        ? {
            ...h,
            completedDates: h.completedDates.includes(today)
              ? h.completedDates.filter(d => d !== today)
              : [...h.completedDates, today],
          }
        : h
    );

    setHabits(updated);
    await saveHabits(updated);
  };

  const deleteHabit = (habit: Habit) => {
    Alert.alert('Delete Habit?', `"${habit.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelScheduledNotification(habit.notificationId);
          const updated = habits.filter(h => h.id !== habit.id);
          setHabits(updated);
          await saveHabits(updated);
        },
      },
    ]);
  };

  const renderHabit = ({ item }: { item: Habit }) => {
    const today = getTodayDate();
    const done = item.completedDates.includes(today);
    const streak = calculateStreak(item.completedDates);

    return (
      <TouchableOpacity
        onPress={() => toggleCompletion(item.id)}
        onLongPress={() => deleteHabit(item)}
        style={[styles.card, { borderLeftColor: item.color }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.streak}>🔥 {streak} day streak</Text>
          </View>
        </View>

        <Ionicons
          name={done ? 'checkbox' : 'square-outline'}
          size={32}
          color={done ? '#4CAF50' : '#aaa'}
        />
      </TouchableOpacity>
    );
  };

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
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F8F8' },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftWidth: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  emoji: { fontSize: 36, marginRight: 14 },
  title: { fontSize: 17, fontWeight: '700' },
  category: { color: '#777', fontSize: 13, marginTop: 3 },
  streak: { color: '#FF9800', marginTop: 4 },
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
