import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated } from 'react-native';
import { StatsProps } from '../types/HabitTypes';
// FIX: 'generateInsights' is now correctly exported and imported
import { getTodayDate, weeklyCompletion, generateInsights } from '../data/HabitUtils';
import CalendarHeatmap from '../components/CalendarHeatmap';

const StatsScreen: React.FC<StatsProps> = ({ habits = [] }) => {
  const total = habits.length;
  const doneToday = habits.filter((h) => h.completedDates.includes(getTodayDate())).length;
  const rate = total === 0 ? 0 : Math.round((doneToday / total) * 100);

  const animWidth = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: rate,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [rate]);

  const insights = generateInsights(habits);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Stats</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Today's Completion</Text>
        <Text style={styles.big}>{Math.round(rate)}%</Text>

        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: animWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }) }]} />
        </View>

        <Text style={styles.small}>{doneToday} of {total} habits done</Text>
      </View>

      <Text style={styles.sub}>Weekly Breakdown</Text>

      <ScrollView style={{ marginTop: 10 }}>
        {habits.map((h) => {
          const wk = weeklyCompletion(h);
          return (
            <View key={h.id} style={styles.item}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 26, marginRight: 10 }}>{h.emoji}</Text>
                <View>
                  <Text style={styles.itemTitle}>{h.title}</Text>
                  <Text style={styles.reminder}>{h.category} • {h.frequency === 'daily' ? 'Daily' : 'Custom'}</Text>
                </View>
              </View>

              <View style={{ marginTop: 8 }}>
                <Text>Week: {wk.completed} / {wk.scheduled} ({wk.rate}%)</Text>
                <CalendarHeatmap completedDates={h.completedDates} />
              </View>
            </View>
          );
        })}

        {total === 0 && <Text style={styles.empty}>No habits logged.</Text>}
      </ScrollView>

      <View style={{ padding: 18 }}>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>Insights</Text>
        <Text>Total habits: {insights.total}</Text>
        <Text>Done today: {insights.doneToday}</Text>
        <Text>Top category: {insights.topCategory || '—'}</Text>
        <Text>Busiest day: {insights.busiestDay || '—'}</Text>
      </View>
    </View>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAFAFA' },
  header: { fontSize: 28, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginTop: 12,
    alignItems: 'center',
    elevation: 3,
  },
  label: { color: '#555' },
  big: { fontSize: 48, fontWeight: '700', color: '#6200EE', marginTop: 6 },
  progressBg: { width: '100%', height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: '#03DAC6', borderRadius: 6 },
  small: { color: '#777', marginTop: 8 },
  sub: { fontSize: 20, fontWeight: '600', marginTop: 18 },
  item: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  itemTitle: { fontWeight: '700' },
  reminder: { fontSize: 12, color: '#666' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
});