import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HomeScreenProps } from '../types/HabitTypes';
import { getTodayDate, calculateStreak, saveHabits, cancelScheduledNotification } from '../data/HabitUtils';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, habits = [], setHabits }) => {

  const toggleCompletion = async (id: string) => {
    const today = getTodayDate();
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      
      // Toggle completion status for today
      const done = h.completedDates.includes(today);
      const newDates = done 
        ? h.completedDates.filter(d => d !== today) // Remove today's date
        : [...h.completedDates, today];           // Add today's date
        
      return { ...h, completedDates: newDates };
    });

    setHabits(updated);
    await saveHabits(updated);
  };

  const deleteHabit = (habit: Habit) => {
    Alert.alert('Delete Habit', `Delete "${habit.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          // Cancel the scheduled notification if one exists
          await cancelScheduledNotification(habit.notificationId);
          
          // Remove the habit from the list
          const updated = habits.filter(h => h.id !== habit.id);
          setHabits(updated);
          await saveHabits(updated);
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Habit }) => {
    const today = getTodayDate();
    const isDone = item.completedDates.includes(today);
    const streak = calculateStreak(item.completedDates);

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => toggleCompletion(item.id)} 
        onLongPress={() => deleteHabit(item)} // Long press to delete
      >
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.streak}>🔥 {streak} day{streak === 1 ? '' : 's'} streak</Text>
        </View>

        <Ionicons 
          name={isDone ? 'checkbox' : 'square-outline'} 
          size={32} 
          color={isDone ? '#4CAF50' : '#888'} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Daily Habits</Text>

      <FlatList
        data={habits}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No habits yet — press + to add one.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddHabit')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#222' },
  streak: { marginTop: 6, color: '#FF9800' },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200EE',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  }
});