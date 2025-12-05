import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { getTodayDate, saveHabits, calculateStreak, weeklyCompletion } from '../data/HabitUtils';
import { Habit } from '../types/HabitTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/index'; // adjust path if needed

// --- Corrected DetailProps ---
type DetailProps = NativeStackScreenProps<RootStackParamList, 'Detail'> & {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

// --- Stat Block Component ---
const StatBlock = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
  <View style={detailStyles.statItem}>
    <Ionicons name={icon as any} size={24} color={color} />
    <Text style={detailStyles.statValue}>{value}</Text>
    <Text style={detailStyles.statLabel}>{label}</Text>
  </View>
);

const detailStyles = StyleSheet.create({
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 12, color: '#666' },
});

// --- HabitDetailScreen ---
const HabitDetailScreen: React.FC<DetailProps> = ({ route, navigation, habits, setHabits }) => {
  const habitId = route.params.habitId; // ✅ Corrected
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4500" />
        <Text style={styles.errorMessage}>Error: Habit not found.</Text>
        <TouchableOpacity
  style={styles.errorButton}
  onPress={() => navigation.replace('MainTabs')}
>
  <Text style={styles.errorButtonText}>Go to Tracker</Text>
</TouchableOpacity>

      </View>
    );
  }

  const today = getTodayDate();
  const todayNote = habit.notes?.[today] || '';
  const [noteText, setNoteText] = useState(todayNote);

  const { currentStreak, weeklyProgress } = useMemo(() => ({
    currentStreak: calculateStreak(habit),
    weeklyProgress: weeklyCompletion(habit),
  }), [habit]);

  const addNoteForToday = async () => {
    if (!noteText.trim()) return;
    const date = getTodayDate();
    const updated = habits.map((h) =>
      h.id === habit.id ? { ...h, notes: { ...(h.notes || {}), [date]: noteText.trim() } } : h
    );
    setHabits(updated);
    await saveHabits(updated);
    Alert.alert('Success', 'Note saved for today.');
  };

  const renderFrequency = () => {
    if (habit.frequency === 'daily') return 'Daily';
    const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const days = (habit.weekdays || []).map((i) => WEEKDAYS_SHORT[i]).join(', ');
    return `Custom: ${days}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{habit.emoji} {habit.title}</Text>
        <TouchableOpacity onPress={() => Alert.alert('Edit feature coming soon!')}>
          <Ionicons name="create-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sub}>Category: {habit.category}</Text>
      <Text style={styles.sub}>Frequency: {renderFrequency()}</Text>

      <View style={styles.statContainer}>
        <StatBlock label="Current Streak" value={currentStreak} icon="flame" color="#FF9800" />
        <View style={styles.statDivider} />
        <StatBlock label="Total XP" value={habit.xp || 0} icon="star" color="#4CAF50" />
        <View style={styles.statDivider} />
        <StatBlock label="Weekly Rate" value={`${weeklyProgress.rate}%`} icon="trending-up" color="#1D9BF0" />
      </View>

      <View style={styles.sectionCard}>
        <CalendarHeatmap
          completedDates={habit.completedDates}
          notes={habit.notes || {}}
          onDayPress={(date: string, note: string) => {
            setNoteText(note || '');
            Alert.alert(`Editing note for ${date}`);
          }}
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Daily Reflection</Text>
        <TextInput
          multiline
          placeholder={todayNote ? 'Edit your reflection...' : "Add a quick reflection for today..."}
          style={styles.input}
          value={noteText}
          onChangeText={setNoteText}
        />
        <TouchableOpacity style={styles.button} onPress={addNoteForToday}>
          <Text style={styles.buttonText}>{todayNote ? 'Update Note' : 'Save Note'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 18 }}>
        <Text style={styles.sectionHeader}>History ({habit.completedDates.length} entries)</Text>
        {habit.completedDates.length === 0 ? (
          <Text style={{ color: '#666', marginTop: 8 }}>No completions recorded yet.</Text>
        ) : (
          habit.completedDates.slice().reverse().map((d) => (
            <View key={d} style={styles.historyItem}>
              <Text style={styles.historyDate}>{d}</Text>
              {habit.notes?.[d] ? <Text style={styles.historyNote}>{habit.notes[d]}</Text> : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default HabitDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F0F2F5' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: '800' },
  sub: { marginTop: 4, color: '#666', fontSize: 14 },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5', padding: 30 },
  errorMessage: { fontSize: 18, color: '#FF4500', fontWeight: 'bold', marginTop: 10 },
  errorButton: { marginTop: 20, padding: 10, backgroundColor: '#fff', borderRadius: 8 },
  errorButtonText: { color: '#1D9BF0', fontWeight: '700' },

  statContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statDivider: { width: 1, backgroundColor: '#eee', marginVertical: 10 },

  sectionCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: { fontSize: 18, fontWeight: '700', marginBottom: 10 },

  input: { backgroundColor: '#F9F9F9', minHeight: 90, padding: 15, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: '#eee' },
  button: { marginTop: 12, backgroundColor: '#1D9BF0', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },

  historyItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderColor: '#ccc',
    marginBottom: 8,
  },
  historyDate: { fontWeight: '600', fontSize: 14, marginBottom: 4 },
  historyNote: { color: '#555', fontStyle: 'italic', fontSize: 13 },
});
