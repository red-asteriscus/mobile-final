import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { DetailProps } from '../types/HabitTypes';
import { getTodayDate, saveHabits } from '../data/HabitUtils';
import CalendarHeatmap from '../components/CalendarHeatmap';

const HabitDetailScreen: React.FC<DetailProps> = ({ route, navigation, habits, setHabits }) => {
  const id = route.params?.id;
  const habit = habits.find((h) => h.id === id);
  const [noteText, setNoteText] = useState('');

  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Habit not found</Text>
      </View>
    );
  }

  const addNoteForToday = async () => {
    const date = getTodayDate();
    const updated = habits.map((h) => (h.id === habit.id ? { ...h, notes: { ...(h.notes || {}), [date]: noteText } } : h));
    setHabits(updated);
    await saveHabits(updated);
    setNoteText('');
    Alert.alert('Saved', 'Note saved for today');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{habit.emoji} {habit.title}</Text>
      <Text style={styles.sub}>Category: {habit.category}</Text>
      <Text style={styles.sub}>Frequency: {habit.frequency === 'daily' ? 'Daily' : `Custom (${(habit.weekdays || []).join(',')})`}</Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Calendar</Text>
        <CalendarHeatmap completedDates={habit.completedDates} />
      </View>

      <View style={{ marginTop: 18 }}>
        <Text style={{ fontWeight: '600' }}>Notes (today)</Text>
        <TextInput
          multiline
          placeholder="Add a quick reflection..."
          style={styles.input}
          value={noteText}
          onChangeText={setNoteText}
        />
        <TouchableOpacity style={styles.button} onPress={addNoteForToday}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Save Note</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 18 }}>
        <Text style={{ fontWeight: '600' }}>History</Text>
        {(habit.completedDates || []).length === 0 ? (
          <Text style={{ color: '#666', marginTop: 8 }}>No completions yet.</Text>
        ) : (
          (habit.completedDates || []).slice().reverse().map((d) => (
            <View key={d} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
              <Text>{d}</Text>
              {habit.notes && habit.notes[d] ? <Text style={{ color: '#333', marginTop: 6 }}>{habit.notes[d]}</Text> : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default HabitDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAFAFA' },
  header: { fontSize: 24, fontWeight: '700' },
  sub: { marginTop: 6, color: '#666' },
  input: { backgroundColor: '#fff', minHeight: 80, padding: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: '#eee' },
  button: { marginTop: 10, backgroundColor: '#6200EE', padding: 12, borderRadius: 10, alignItems: 'center' },
});
