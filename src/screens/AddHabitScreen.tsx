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
} from 'react-native';
import { AddHabitProps } from '../types/HabitTypes';
import { saveHabits, scheduleNotification } from '../data/HabitUtils';
import * as Notifications from 'expo-notifications';

// --- Simple emoji set ---
const EMOJIS = ['📚', '💪', '🧘', '🚰', '🧹', '📝', '🎧', '🥗', '🚶', '😴'];

const COLORS = ['#FFB4A2', '#A2D2FF', '#BDE0FE', '#C8FFD4', '#FFD6A5', '#F7B7F3'];

const CATEGORIES = ['Health', 'Study', 'Mindset', 'Fitness', 'Work', 'Other'];

const AddHabitScreen: React.FC<AddHabitProps> = ({ navigation, habits, setHabits }) => {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [color, setColor] = useState(COLORS[0]);
  const [category, setCategory] = useState('Other');
  const [reminder, setReminder] = useState(false);
  const [loading, setLoading] = useState(false);

  const ensurePermissions = async () => {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.status === 'granted';
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      return Alert.alert('Missing Title', 'Please enter a habit name.');
    }

    setLoading(true);

    let notifId: string | undefined;

    if (reminder) {
      const ok = await ensurePermissions();
      if (!ok) {
        Alert.alert('Permission Needed', 'Cannot enable reminders without notification permissions.');
        setReminder(false);
      } else {
        notifId = await scheduleNotification(title);
      }
    }

    const newHabit = {
      id: Date.now().toString(),
      title: title.trim(),
      emoji,
      color,
      category,
      completedDates: [],
      reminderEnabled: reminder,
      notificationId: notifId,
    };

    const updated = [...habits, newHabit];
    setHabits(updated);
    await saveHabits(updated);

    setLoading(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a New Habit</Text>

      {/* Title */}
      <TextInput
        style={styles.input}
        placeholder="Habit title"
        value={title}
        onChangeText={setTitle}
      />

      {/* Emoji Picker */}
      <Text style={styles.subTitle}>Pick an Emoji</Text>
      <FlatList
        horizontal
        data={EMOJIS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setEmoji(item)}>
            <Text
              style={[
                styles.emoji,
                { opacity: item === emoji ? 1 : 0.4, transform: [{ scale: item === emoji ? 1.2 : 1 }] },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Color Picker */}
      <Text style={styles.subTitle}>Pick a Color</Text>
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c, borderWidth: c === color ? 3 : 1 }]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      {/* Category Picker */}
      <Text style={styles.subTitle}>Category</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              { backgroundColor: cat === category ? '#6200EE' : '#ddd' },
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={{
                color: cat === category ? 'white' : '#333',
                fontWeight: '600',
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reminder */}
      <View style={styles.row}>
        <Text style={{ fontSize: 16 }}>Daily Reminder</Text>
        <Switch value={reminder} onValueChange={setReminder} />
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.button} onPress={handleAdd} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Create Habit'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddHabitScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: '#FAFAFA' },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  subTitle: { marginTop: 20, marginBottom: 8, fontSize: 16, fontWeight: '600' },
  emoji: { fontSize: 40, marginHorizontal: 8 },
  colorRow: { flexDirection: 'row', marginTop: 8 },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 20,
    marginRight: 10,
    borderColor: '#555',
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
