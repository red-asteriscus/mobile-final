//src/components/CalendarHeatmap.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Very small calendar heatmap: shows last 28 days as 4 rows x 7 columns.
 * Input: array of date strings (YYYY-MM-DD) that are completed.
 */
export default function CalendarHeatmap({ completedDates = [] }: { completedDates?: string[] }) {
  const today = new Date();
  const days: { key: string; done: boolean }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, done: completedDates.includes(key) });
  }

  const rows: typeof days[] = [];
  for (let r = 0; r < 4; r++) {
    rows.push(days.slice(r * 7, r * 7 + 7));
  }

  return (
    <View>
      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Last 28 days</Text>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((d) => (
            <View
              key={d.key}
              style={[
                styles.cell,
                { backgroundColor: d.done ? '#4CAF50' : '#E0E0E0' },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 6 },
  cell: { width: 22, height: 22, borderRadius: 4, marginRight: 6 },
});
