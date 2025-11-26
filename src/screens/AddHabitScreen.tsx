import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { AddHabitProps } from '../types/HabitTypes';
import { saveHabits, scheduleNotification } from '../data/HabitUtils';
import * as Notifications from 'expo-notifications';

const AddHabitScreen: React.FC<AddHabitProps> = ({ navigation, habits, setHabits }) => {
  const [title, setTitle] = useState<string>('');
  const [reminder, setReminder] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Helper to ensure notification permissions are granted
  const ensurePermissions = async (): Promise<boolean> => {
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.status === 'granted') return true;
      const asked = await Notifications.requestPermissionsAsync();
      return asked.status === 'granted';
    } catch (err) {
      console.warn('[AddHabit] notification permission error', err);
      return false;
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      return Alert.alert('Validation', 'Please enter a habit title.');
    }

    setLoading(true);
    let notificationId: string | undefined;

    if (reminder) {
      const ok = await ensurePermissions();
      if (!ok) {
        Alert.alert('Permission Denied', 'Notifications permission is required for reminders. Reminder will be disabled.');
        setReminder(false);
      } else {
        // Schedule notification for the new habit
        notificationId = await scheduleNotification(title.trim());
        if (notificationId) {
          Alert.alert('Reminder Set', 'Daily reminder scheduled for 9:00 AM (local time).');
        } else {
          Alert.alert('Reminder Failed', 'Could not schedule reminder. Proceeding without it.');
        }
      }
    }

    const newHabit = {
      id: Date.now().toString(),
      title: title.trim(),
      completedDates: [],
      reminderEnabled: !!reminder,
      notificationId,
    };

    const updated = [...habits, newHabit];
    setHabits(updated);
    await saveHabits(updated); // Persist to storage

    setLoading(false);
    navigation.goBack(); // Navigate back to the Tracker screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Habit</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g., Read 30 minutes"
        value={title}
        onChangeText={setTitle}
        editable={!loading}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Daily Reminder (9:00 AM)</Text>
        <Switch 
          value={reminder} 
          onValueChange={setReminder} 
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={reminder ? '#6200EE' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Create Habit'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddHabitScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  input: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 18,
  },
  label: { fontSize: 16 },
  button: {
    backgroundColor: '#6200EE',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});