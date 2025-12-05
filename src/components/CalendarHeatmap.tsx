import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getLastNDates } from '../data/HabitUtils';

interface CalendarHeatmapProps {
  completedDates: string[];           // dates in "YYYY-MM-DD" format
  notes?: Record<string, string>;     // optional notes per date
  onDayPress?: (date: string, note: string) => void; // callback when day is pressed
  size?: number;                      // square size
  gap?: number;                       // spacing between squares
  weeks?: number;                      // how many weeks to show
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  completedDates,
  notes = {},
  onDayPress,
  size = 14,
  gap = 4,
  weeks = 12,
}) => {
  const dates = getLastNDates(weeks * 7); // generate dates from today backward

  // group dates by week
  const weeksArr: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeksArr.push(dates.slice(i, i + 7));
  }

  const isCompleted = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return completedDates.includes(dStr);
  };

  const getNote = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return notes[dStr] || '';
  };

  return (
    <View style={{ flexDirection: 'row' }}>
      {weeksArr.map((week, i) => (
        <View key={i} style={{ marginRight: gap }}>
          {week.map((day, idx) => {
            const dStr = day.toISOString().split('T')[0];
            const completed = isCompleted(day);
            const note = getNote(day);
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => onDayPress?.(dStr, note)}
                style={[
                  styles.square,
                  {
                    width: size,
                    height: size,
                    marginBottom: gap,
                    backgroundColor: completed ? '#4CAF50' : '#E0E0E0',
                    borderRadius: 3,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default CalendarHeatmap;

const styles = StyleSheet.create({
  square: {
    backgroundColor: '#E0E0E0',
  },
});
