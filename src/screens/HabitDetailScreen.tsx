import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../app/index';
import CalendarHeatmap from '../components/CalendarHeatmap';
import TimeInput from '../components/TimePicker';
import {
  calculateStreak,
  getTodayDate,
  saveHabits,
  scheduleNotificationsForTimes,
  weeklyCompletion
} from '../data/HabitUtils';
import { Habit } from '../types/HabitTypes';

type DetailProps = NativeStackScreenProps<RootStackParamList, 'Detail'> & {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

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

const HabitDetailScreen: React.FC<DetailProps> = ({ route, navigation, habits, setHabits }) => {
  const habitId = route.params.habitId;
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4500" />
        <Text style={styles.errorMessage}>Error: Habit not found.</Text>
        <TouchableOpacity
          style={styles.errorButton}
          // Navigate to Tracker: works if Tracker is in parent tab
          onPress={() => navigation.getParent()?.navigate('Tracker')}
        >
          <Text style={styles.errorButtonText}>Go to Tracker</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [title, setTitle] = useState(habit.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [noteText, setNoteText] = useState(habit.notes?.[getTodayDate()] || '');
  const [reminderEnabled, setReminderEnabled] = useState((habit.reminderTimes?.length ?? 0) > 0);
  const [reminderTimes, setReminderTimes] = useState<Date[]>(
    habit.reminderTimes?.map(t => {
      const [h, m] = t.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    }) || []
  );
  const [loading, setLoading] = useState(false);

  const { currentStreak, weeklyProgress } = useMemo(() => ({
    currentStreak: calculateStreak(habit),
    weeklyProgress: weeklyCompletion(habit),
  }), [habit]);

  const saveTitle = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Title cannot be empty.');
    const updated = habits.map(h => h.id === habit.id ? { ...h, title: title.trim() } : h);
    setHabits(updated);
    await saveHabits(updated);
    setEditingTitle(false);
    Alert.alert('Success', 'Habit renamed.');
  };

  const addNoteForToday = async () => {
    const date = getTodayDate();
    const updated = habits.map(h => h.id === habit.id
      ? { ...h, notes: { ...(h.notes || {}), [date]: noteText.trim() } }
      : h
    );
    setHabits(updated);
    await saveHabits(updated);
    Alert.alert('Success', 'Note saved for today.');
  };

  const addReminder = () => {
    if (reminderTimes.length >= 5) return Alert.alert('Max reminders', 'You can add up to 5 reminders.');
    const defaultTime = new Date();
    defaultTime.setHours(9, 0, 0, 0);
    setReminderTimes(prev => [...prev, defaultTime]);
  };

  const removeReminder = (idx: number) => {
    setReminderTimes(prev => prev.filter((_, i) => i !== idx));
  };

  const saveReminders = async () => {
    setLoading(true);
    let notifIds: string[] = [];
    if (reminderEnabled) {
      const timesStr = reminderTimes.map(d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
      notifIds = await scheduleNotificationsForTimes(title, timesStr);
    }
    const updated = habits.map(h =>
      h.id === habit.id
        ? { ...h, reminderTimes: reminderEnabled ? reminderTimes.map(d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`) : [], notificationIds: notifIds }
        : h
    );
    setHabits(updated);
    await saveHabits(updated);
    setLoading(false);
    Alert.alert('Success', 'Reminders saved.');
  };

  const renderFrequency = () => {
    if (habit.frequency === 'daily') return 'Daily';
    const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const days = (habit.weekdays || []).map(i => WEEKDAYS_SHORT[i]).join(', ');
    return `Custom: ${days}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#A593E0" />
        <Text style={{ color: '#A593E0', marginLeft: 6 }}>Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.headerRow}>
        {editingTitle ? (
          <>
            <TextInput value={title} onChangeText={setTitle} style={styles.titleInput} />
            <TouchableOpacity onPress={saveTitle}>
              <Ionicons name="checkmark" size={26} color="#4CAF50" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.header}>{habit.emoji} {habit.title}</Text>
            <TouchableOpacity onPress={() => setEditingTitle(true)}>
              <Ionicons name="create-outline" size={26} color="#333" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.sub}>Category: {habit.category}</Text>
      <Text style={styles.sub}>Frequency: {renderFrequency()}</Text>

      {/* Stats */}
      <View style={styles.statContainer}>
        <StatBlock label="Current Streak" value={currentStreak} icon="flame" color="#FF9800" />
        <View style={styles.statDivider} />
        <StatBlock label="Total XP" value={habit.xp || 0} icon="star" color="#4CAF50" />
        <View style={styles.statDivider} />
        <StatBlock label="Weekly Rate" value={`${weeklyProgress.rate}%`} icon="trending-up" color="#A593E0" />
      </View>

      {/* Calendar */}
      <View style={styles.sectionCard}>
        <CalendarHeatmap
          completedDates={habit.completedDates}
          notes={habit.notes || {}}
          onDayPress={(date: string, note: string) => setNoteText(note || '')}
        />
      </View>

      {/* Daily Note */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Daily Reflection</Text>
        <TextInput
          multiline
          placeholder="Add a quick reflection for today..."
          style={styles.input}
          value={noteText}
          onChangeText={setNoteText}
        />
        <TouchableOpacity style={styles.button} onPress={addNoteForToday}>
          <Text style={styles.buttonText}>Save Note</Text>
        </TouchableOpacity>
      </View>

      {/* Reminders */}
      <View style={styles.sectionCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionHeader}>Reminders</Text>
          <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
        </View>

        {reminderEnabled && (
          <>
            {reminderTimes.map((time, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
                <TimeInput value={time} onChange={t => setReminderTimes(prev => prev.map((v, j) => i === j ? t : v))} />
                <TouchableOpacity onPress={() => removeReminder(i)} style={{ marginLeft: 8 }}>
                  <Ionicons name="trash-outline" size={24} color="#FF4500" />
                </TouchableOpacity>
              </View>
            ))}
            {reminderTimes.length < 5 && (
              <TouchableOpacity onPress={addReminder} style={styles.addRemBtn}>
                <Text style={{ color: '#fff' }}>Add Reminder</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={saveReminders} style={[styles.button, { marginTop: 6 }]}>
              <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Reminders'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* History */}
      <View style={{ marginTop: 18 }}>
        <Text style={styles.sectionHeader}>History ({habit.completedDates.length} entries)</Text>
        {habit.completedDates.length === 0 ? (
          <Text style={{ color: '#666', marginTop: 8 }}>No completions recorded yet.</Text>
        ) : (
          habit.completedDates.slice().reverse().map(d => (
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
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  header: { fontSize: 28, fontWeight: '800' },
  titleInput: { fontSize: 28, fontWeight: '800', borderBottomWidth: 1, borderColor: '#A593E0', flex: 1, marginRight: 8 },
  sub: { marginTop: 4, color: '#666', fontSize: 14 },

  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5', padding: 30 },
  errorMessage: { fontSize: 18, color: '#FF4500', fontWeight: 'bold', marginTop: 10 },
  errorButton: { marginTop: 20, padding: 10, backgroundColor: '#fff', borderRadius: 8 },
  errorButtonText: { color: '#A593E0', fontWeight: '700' },

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
  button: { marginTop: 12, backgroundColor: '#A593E0', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  addRemBtn: { padding: 10, backgroundColor: '#A593E0', borderRadius: 10, alignItems: 'center', marginTop: 4 },

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
