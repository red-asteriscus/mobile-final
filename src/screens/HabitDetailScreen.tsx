// src/screens/HabitDetailScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types/HabitTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app';
import { saveHabits, cancelScheduledNotifications } from '../data/HabitUtils';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'> & {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

const HabitDetailScreen: React.FC<Props> = ({ route, navigation, habits, setHabits }) => {
  const { habitId } = route.params;
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 50 }}>Habit not found</Text>;

  const [notes, setNotes] = useState<Record<string, string>>(habit.notes || {});
  const [newNoteText, setNewNoteText] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(habit.reminderEnabled || false);
  const [reminderTime, setReminderTime] = useState(habit.reminderTime ? new Date(habit.reminderTime) : new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // --- Notes management ---
  const saveHabitNotes = async (updatedNotes: Record<string, string>) => {
    const updatedHabits = habits.map(h => h.id === habit.id ? { ...h, notes: updatedNotes } : h);
    setHabits(updatedHabits);
    await saveHabits(updatedHabits);
  };

  const addNote = () => {
    if (!newNoteText.trim()) return;
    const id = Date.now().toString();
    const updated = { ...notes, [id]: newNoteText.trim() };
    setNotes(updated);
    setNewNoteText('');
    saveHabitNotes(updated);
  };

  const editNote = (id: string, text: string) => {
    const updated = { ...notes, [id]: text };
    setNotes(updated);
    saveHabitNotes(updated);
  };

  const deleteNote = (id: string) => {
    const updated = { ...notes };
    delete updated[id];
    setNotes(updated);
    saveHabitNotes(updated);
  };

  // --- Delete habit ---
  const deleteHabit = () => {
    Alert.alert('Delete Habit?', `Are you sure you want to delete "${habit.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await cancelScheduledNotifications(habit.notificationIds);
          const updated = habits.filter(h => h.id !== habit.id);
          setHabits(updated);
          await saveHabits(updated);
          navigation.goBack();
        }
      }
    ]);
  };

  // --- Reminder management ---
  const saveReminder = async () => {
    const updatedHabits = habits.map(h =>
      h.id === habit.id
        ? { ...h, reminderEnabled, reminderTime: reminderTime.toISOString() }
        : h
    );
    setHabits(updatedHabits);
    await saveHabits(updatedHabits);
    Alert.alert('Reminder Saved', `Reminder ${reminderEnabled ? 'enabled' : 'disabled'} at ${reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      
      {/* Back button and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back-outline" size={28} color="#1D9BF0" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{habit.emoji} {habit.title}</Text>
      </View>

      {/* Delete Habit */}
      <TouchableOpacity style={styles.deleteBtn} onPress={deleteHabit}>
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Text style={styles.deleteText}>Delete Habit</Text>
      </TouchableOpacity>

      {/* Notes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        {Object.entries(notes).map(([id, text]) => (
          <View key={id} style={styles.noteRow}>
            <TextInput
              style={styles.noteInput}
              value={text}
              onChangeText={t => editNote(id, t)}
            />
            <TouchableOpacity onPress={() => deleteNote(id)} style={styles.noteDeleteBtn}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.newNoteRow}>
          <TextInput
            style={[styles.noteInput, { flex: 1 }]}
            placeholder="Add a new note..."
            value={newNoteText}
            onChangeText={setNewNoteText}
          />
          <TouchableOpacity onPress={addNote}>
            <Ionicons name="add-circle-outline" size={28} color="#1D9BF0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reminder Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminder</Text>
        <View style={styles.reminderRow}>
          <Text style={{ fontSize: 16 }}>Enable Reminder</Text>
          <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
        </View>
        {reminderEnabled && (
          <>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePickerBtn}>
              <Text style={styles.timeText}>Reminder Time: {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) setReminderTime(selectedDate);
                }}
              />
            )}
            <TouchableOpacity style={styles.saveReminderBtn} onPress={saveReminder}>
              <Text style={styles.saveReminderText}>Save Reminder</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default HabitDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5', padding: 20 },
  header: { marginBottom: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backText: { color: '#1D9BF0', fontWeight: '600', marginLeft: 4, fontSize: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#333' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF3B30', padding: 12, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 20 },
  deleteText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  section: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  noteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  noteInput: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#F9F9F9', fontSize: 15 },
  noteDeleteBtn: { marginLeft: 8 },
  newNoteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  timePickerBtn: { padding: 12, backgroundColor: '#F0F2F5', borderRadius: 12, marginBottom: 10 },
  timeText: { fontSize: 16, color: '#333' },
  saveReminderBtn: { backgroundColor: '#1D9BF0', padding: 12, borderRadius: 12, alignItems: 'center' },
  saveReminderText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
