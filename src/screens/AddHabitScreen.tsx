// src/screens/AddHabitScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  FlatList,
  ScrollView,
} from 'react-native';
import { AddHabitProps } from '../types/HabitTypes';
import { saveHabits, scheduleNotificationsForTimes } from '../data/HabitUtils';
import TimePicker from '../components/TimePicker';

const EMOJIS = ['📚', '💪', '🧘', '🚰', '🧹', '📝', '🎧', '🥗', '🚶', '😴'];
const COLORS = ['#FFB4A2', '#A2D2FF', '#BDE0FE', '#C8FFD4', '#FFD6A5', '#F7B7F3'];
const CATEGORIES = ['Health', 'Study', 'Mindset', 'Fitness', 'Work', 'Other'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AddHabitScreen: React.FC<AddHabitProps> = ({ navigation, habits, setHabits }) => {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [frequency, setFrequency] = useState<'daily' | 'custom'>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<Date[]>([new Date()]); // store Date locally
  const [loading, setLoading] = useState(false);

  const toggleWeekday = (index: number) => {
    setWeekdays((prev) => (prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]));
  };

  const addReminder = () => {
    if (reminderTimes.length >= 5) return;
    setReminderTimes((prev) => [...prev, new Date()]);
  };

  const removeReminder = (idx: number) => {
    setReminderTimes((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSave = async () => {
    if (!title.trim()) {
      return Alert.alert('Missing Title', 'Please enter a habit name.');
    }
    setLoading(true);

    // convert times to "HH:MM" strings
    const timesStr = reminderTimes.map((d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);

    let notifIds: string[] = [];
    if (reminderEnabled) {
      notifIds = await scheduleNotificationsForTimes(title.trim(), timesStr);
    }

    const newHabit = {
      id: Date.now().toString(),
      title: title.trim(),
      emoji,
      color,
      category,
      completedDates: [],
      frequency,
      weekdays: frequency === 'custom' ? weekdays : undefined,
      reminderTimes: reminderEnabled ? timesStr : [],
      notificationIds: notifIds,
      lastStreakFreezeUsed: null,
      notes: {},
      xp: 0,
      badges: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [...habits, newHabit];
    setHabits(updated);
    await saveHabits(updated);
    setLoading(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <Text style={styles.header}>Create a New Habit</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} placeholder="Habit title" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Emoji</Text>
      <FlatList
        horizontal
        data={EMOJIS}
        keyExtractor={(it) => it}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setEmoji(item)}>
            <Text style={[styles.emoji, { opacity: item === emoji ? 1 : 0.4, transform: [{ scale: item === emoji ? 1.2 : 1 }] }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.label}>Color</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {COLORS.map((c) => (
          <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorDot, { backgroundColor: c, borderWidth: c === color ? 3 : 1 }]} />
        ))}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={[styles.chip, { backgroundColor: cat === category ? '#6200EE' : '#eee' }]}>
            <Text style={{ color: cat === category ? '#fff' : '#333' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 16 }]}>Frequency</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <TouchableOpacity onPress={() => setFrequency('daily')} style={[styles.chip, { backgroundColor: frequency === 'daily' ? '#6200EE' : '#eee' }]}>
          <Text style={{ color: frequency === 'daily' ? '#fff' : '#333' }}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFrequency('custom')} style={[styles.chip, { backgroundColor: frequency === 'custom' ? '#6200EE' : '#eee', marginLeft: 8 }]}>
          <Text style={{ color: frequency === 'custom' ? '#fff' : '#333' }}>Custom weekdays</Text>
        </TouchableOpacity>
      </View>

      {frequency === 'custom' && (
        <>
          <Text style={styles.label}>Pick weekdays</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {WEEKDAYS.map((d, i) => (
              <TouchableOpacity key={d} onPress={() => toggleWeekday(i)} style={[styles.weekChip, { backgroundColor: weekdays.includes(i) ? '#6200EE' : '#eee' }]}>
                <Text style={{ color: weekdays.includes(i) ? '#fff' : '#333' }}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={[styles.row, { marginTop: 16 }]}>
        <Text style={{ fontSize: 16 }}>Reminders</Text>
        <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
      </View>

      {reminderEnabled && (
        <>
          <Text style={styles.label}>Reminder times</Text>
          {reminderTimes.map((time, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <TimePicker
                // FIX 1: Property 'value' is required. Using the current Date object as value.
                  value={time} 
                  // FIX 2: Explicitly type 'd' as 'Date' to resolve 'implicitly has an 'any' type' error
                  onChange={(d: Date) => setReminderTimes((prev) => {
                        // FIX 3: Correctly map over the previous state and replace the date at the current index, returning the new state array (Date[])
                        return prev.map((item, i) => i === idx ? d : item);
                    })}
              />
              <TouchableOpacity onPress={() => removeReminder(idx)} style={{ marginLeft: 10 }}>
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={addReminder} style={[styles.chip, { alignSelf: 'flex-start', marginTop: 6 }]}>
            <Text>Add time</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={onSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Create Habit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddHabitScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: '#FAFAFA' },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  label: { marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  emoji: { fontSize: 36, marginHorizontal: 8 },
  colorDot: { width: 36, height: 36, borderRadius: 20, marginRight: 10, borderColor: '#555' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  weekChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, padding: 12, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#6200EE', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});