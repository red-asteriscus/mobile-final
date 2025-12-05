import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getLastNDates } from '../data/HabitUtils';

interface CalendarProps {
  completedDates: string[];
  notes?: Record<string, string>;
  onDayPress?: (date: string, note: string) => void;
  weeks?: number;
}

const Calendar: React.FC<CalendarProps> = ({
  completedDates,
  notes = {},
  onDayPress,
  weeks = 6, // show last 6 weeks (42 days)
}) => {
  const dates = getLastNDates(weeks * 7);

  // Group by week
  const weeksArr: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeksArr.push(dates.slice(i, i + 7));
  }

  // Helpers
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const isCompleted = (d: Date) => completedDates.includes(formatDate(d));
  const getNote = (d: Date) => notes[formatDate(d)] || '';

  const todayStr = formatDate(new Date());

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getMonthName = (d: Date) => monthNames[d.getMonth()];

  return (
    <View style={styles.container}>
      {weeksArr.map((week, wIndex) => {
        const firstDay = week[0];
        const showMonthHeader =
          wIndex === 0 ||
          firstDay.getMonth() !== weeksArr[wIndex - 1][0].getMonth();

        return (
          <View key={wIndex}>
            {/* === Month Header === */}
            {showMonthHeader && (
              <Text style={styles.monthHeader}>{getMonthName(firstDay)}</Text>
            )}

            {/* === Week Row === */}
            <View style={styles.weekRow}>
              {week.map((day, dIndex) => {
                const dStr = formatDate(day);
                const completed = isCompleted(day);
                const note = getNote(day);

                const isToday = dStr === todayStr;

                return (
                  <TouchableOpacity
                    key={dIndex}
                    onPress={() => onDayPress?.(dStr, note)}
                    style={[
                      styles.dayTile,
                      completed && styles.completedDay,
                      isToday && styles.todayOutline,
                    ]}
                  >
                    <Text style={[styles.dayText, completed && styles.dayTextCompleted]}>
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },

  // ==== Month header ====
  monthHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 6,
    color: '#222',
  },

  // ==== Week Row ====
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  // ==== Day Tile ====
  dayTile: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dayText: {
    fontSize: 14,
    color: '#444',
  },

  // Completed day
  completedDay: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)', // soft green
  },

  dayTextCompleted: {
    color: '#2E7D32',
    fontWeight: '600',
  },

  // Today highlight outline
  todayOutline: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
});
