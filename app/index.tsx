// app/index.tsx (HabitDetailScreen)
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DetailProps } from '../src/types/HabitTypes';
import { getTodayDate, saveHabits, calculateStreak, weeklyCompletion } from '../src/data/HabitUtils';
import CalendarHeatmap from '../src/components/CalendarHeatmap';

// Helper Component: Inline Stat Block
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
// End Helper

const HabitDetailScreen: React.FC<DetailProps> = ({ route, navigation, habits, setHabits }) => {
  // FIX: Safely read ID to prevent runtime crash if 'params' is undefined
  const id = route.params?.id; 

  // --- Initial Check for Missing ID (Fixes Runtime Error) ---
  if (!id) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4500" />
        <Text style={styles.errorMessage}>Error: No Habit ID provided.</Text>
        <Text style={styles.errorSubMessage}>
          Please navigate to this screen from the Tracker list.
        </Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => navigation.navigate('Tracker')}>
             <Text style={styles.errorButtonText}>Go to Tracker</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const habit = habits.find((h) => h.id === id);
  const today = getTodayDate();
  const todayNote = habit?.notes?.[today] || '';
  const [noteText, setNoteText] = useState(todayNote);

  // Memoize calculations
  const { currentStreak, weeklyProgress, completionHistory } = useMemo(() => {
    if (!habit) return { currentStreak: 0, weeklyProgress: { completed: 0, scheduled: 0, rate: 0 }, completionHistory: {} };
    
    const currentStreak = calculateStreak(habit);
    const weeklyProgress = weeklyCompletion(habit);

    // Group history by month/year for better visualization
    const history: Record<string, { date: string, note?: string }[]> = {};
    const dates = habit.completedDates.slice().sort().reverse();

    dates.forEach(d => {
        // FIX: Resolve Type 'string[]' is not assignable to type 'string' error 
        // by assigning split parts to new variables (year, month)
        const [year, month] = d.split('-'); 
        
        const groupKey = `${new Date(`${year}-${month}-01`).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`;
        
        if (!history[groupKey]) {
            history[groupKey] = [];
        }
        history[groupKey].push({ date: d, note: habit.notes ? habit.notes[d] : undefined });
    });

    return { currentStreak, weeklyProgress, completionHistory: history };
  }, [habit]);

  if (!habit) {
    // Handles case where ID exists but habit was deleted or not found
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Habit not found</Text>
      </View>
    );
  }

  const addNoteForToday = async () => {
    if (!noteText.trim() && todayNote.trim() === '') return; // Don't save empty notes

    const date = getTodayDate();
    const updated = habits.map((h) => (h.id === habit.id ? { ...h, notes: { ...(h.notes || {}), [date]: noteText.trim() } } : h));
    setHabits(updated);
    await saveHabits(updated);
    
    // Alert the user
    Alert.alert('Success', todayNote ? 'Note updated for today.' : 'Note saved for today.');
  };
  
  // Convert custom weekday numbers to names
  const renderFrequency = () => {
    if (habit.frequency === 'daily') return 'Daily';
    
    const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const days = (habit.weekdays || []).map(index => WEEKDAYS_SHORT[index]).join(', ');
    return `Custom: ${days}`;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* --- HEADER & META --- */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>{habit.emoji} {habit.title}</Text>
        <TouchableOpacity onPress={() => Alert.alert('Edit feature coming soon!')}>
          <Ionicons name="create-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sub}>Category: **{habit.category}**</Text>
      <Text style={styles.sub}>Frequency: {renderFrequency()}</Text>

      {/* --- STATS DASHBOARD --- */}
      <View style={styles.statContainer}>
        <StatBlock label="Current Streak" value={currentStreak} icon="flame" color="#FF9800" />
        <View style={styles.statDivider} />
        <StatBlock label="Total XP" value={habit.xp || 0} icon="star" color="#4CAF50" />
        <View style={styles.statDivider} />
        <StatBlock label="Weekly Rate" value={`${weeklyProgress.rate}%`} icon="trending-up" color="#1D9BF0" />
      </View>

      {/* --- CALENDAR HEATMAP --- */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Last 28 Days</Text>
        <CalendarHeatmap completedDates={habit.completedDates} />
      </View>

      {/* --- DAILY NOTES (REFLECTION) --- */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Daily Reflection</Text>
        <TextInput
          multiline
          placeholder={todayNote ? 'Edit your reflection...' : "Add a quick reflection for today..."}
          style={styles.input}
          value={noteText}
          onChangeText={setNoteText}
        />
        <TouchableOpacity style={styles.button} onPress={addNoteForToday} disabled={noteText.trim() === todayNote.trim()}>
          <Text style={styles.buttonText}>{todayNote ? 'Update Note' : 'Save Note'}</Text>
        </TouchableOpacity>
      </View>

      {/* --- HISTORY SECTION (GROUPED) --- */}
      <View style={{ marginTop: 18 }}>
        <Text style={styles.sectionHeader}>History ({habit.completedDates.length} entries)</Text>
        {habit.completedDates.length === 0 ? (
          <Text style={{ color: '#666', marginTop: 8 }}>No completions recorded yet.</Text>
        ) : (
          Object.keys(completionHistory).map(month => (
              <View key={month} style={{ marginBottom: 15 }}>
                  <Text style={styles.historyMonthHeader}>{month}</Text>
                  {(completionHistory[month] || []).map((entry) => (
                      <View key={entry.date} style={styles.historyItem}>
                          <Text style={styles.historyDate}>{entry.date}</Text>
                          {entry.note ? <Text style={styles.historyNote}>"{entry.note}"</Text> : null}
                          <Ionicons 
                              name="checkmark-circle" 
                              size={20} 
                              color="#4CAF50" 
                              style={{ position: 'absolute', right: 10, top: 12 }} 
                          />
                      </View>
                  ))}
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
  
  // Error handling styles for runtime safety
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5', padding: 30 },
  errorMessage: { fontSize: 18, color: '#FF4500', fontWeight: 'bold', marginTop: 10 },
  errorSubMessage: { marginTop: 5, color: '#666' },
  errorButton: { marginTop: 20, padding: 10, backgroundColor: '#fff', borderRadius: 8 },
  errorButtonText: { color: '#1D9BF0', fontWeight: '700' },

  // Detail screen styles
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
  button: { 
    marginTop: 12, 
    backgroundColor: '#1D9BF0', 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
  },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },

  // History Styles
  historyMonthHeader: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 10, marginBottom: 5 },
  historyItem: { 
    paddingVertical: 10, 
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderColor: '#ccc',
    marginBottom: 8,
    position: 'relative',
  },
  historyDate: { fontWeight: '600', fontSize: 14, marginBottom: 4 },
  historyNote: { color: '#555', fontStyle: 'italic', fontSize: 13 },
});