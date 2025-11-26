import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { StatsProps } from '../types/HabitTypes';
import { getTodayDate } from '../data/HabitUtils';

const StatsScreen: React.FC<StatsProps> = ({ habits = [] }) => {
  const total = habits.length;
  const doneToday = habits.filter(h => h.completedDates.includes(getTodayDate())).length;
  // Calculate completion rate, handling division by zero
  const rate = total === 0 ? 0 : (doneToday / total) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Performance Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Today's Completion Rate</Text>
        <Text style={styles.big}>{Math.round(rate)}%</Text>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.min(Math.max(rate, 0), 100)}%` }]} />
        </View>

        <Text style={styles.small}>{doneToday} of {total} habits completed</Text>
      </View>

      <Text style={styles.sub}>Habit Details</Text>

      <ScrollView style={{ marginTop: 10 }}>
        {habits.map(h => (
          <View key={h.id} style={styles.item}>
            <Text style={styles.itemTitle}>{h.title}</Text>
            <Text>Total Logs: {h.completedDates.length}</Text>
            <Text style={styles.reminder}>Reminders: {h.reminderEnabled ? 'Enabled' : 'Disabled'}</Text>
          </View>
        ))}

        {total === 0 && <Text style={styles.empty}>No habits yet.</Text>}
      </ScrollView>
    </View>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  header: { fontSize: 26, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
    elevation: 2,
  },
  label: { color: '#666' },
  big: { fontSize: 46, fontWeight: '700', color: '#6200EE', marginTop: 6 },
  progressBg: { width: '100%', height: 10, backgroundColor: '#E0E0E0', borderRadius: 6, marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: '#03DAC6', borderRadius: 6 },
  small: { color: '#777', marginTop: 8 },

  sub: { fontSize: 20, fontWeight: '600', marginTop: 18 },
  item: { backgroundColor: '#FFF', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1 },
  itemTitle: { fontWeight: '700' },
  reminder: { fontSize: 12, color: '#666' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' }
});