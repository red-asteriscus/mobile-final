import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList, RootTabParamList } from '../../app';
import BadgeModal from '../components/BadgeModal';
import HabitCard from '../components/HabitCard';
import { awardBadgesForHabit, calculateStreak, cancelScheduledNotifications, getTodayDate, saveHabits } from '../data/HabitUtils';
import { Habit } from '../types/HabitTypes';

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Tracker'>,
  NativeStackScreenProps<RootStackParamList>
> & {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

const SummaryBar: React.FC<{ habits: Habit[] }> = ({ habits }) => {
  const today = getTodayDate();
  const total = habits.length;
  const doneToday = habits.filter(h => h.completedDates.includes(today)).length;
  const xpTotal = habits.reduce((sum, h) => sum + (h.xp || 0), 0);
  const percentage = total === 0 ? 0 : Math.round((doneToday / total) * 100);

  return (
    <View style={summaryStyles.bar}>
      <View style={summaryStyles.statBlock}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#A593E0" />
        <Text style={summaryStyles.statValue}>{doneToday}/{total}</Text>
        <Text style={summaryStyles.statLabel}>Completed</Text>
      </View>
      <View style={summaryStyles.divider} />
      <View style={summaryStyles.statBlock}>
        <Ionicons name="trophy-outline" size={24} color="#FFD700" />
        <Text style={summaryStyles.statValue}>{xpTotal}</Text>
        <Text style={summaryStyles.statLabel}>Total XP</Text>
      </View>
      <View style={summaryStyles.divider} />
      <View style={summaryStyles.statBlock}>
        <Ionicons name="flame-outline" size={24} color="#FF4500" />
        <Text style={summaryStyles.statValue}>{percentage}%</Text>
        <Text style={summaryStyles.statLabel}>Today's Rate</Text>
      </View>
    </View>
  );
};

const summaryStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  statBlock: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 4, color: '#333' },
  statLabel: { fontSize: 12, color: '#666' },
  divider: { width: 1, backgroundColor: '#eee' },
});

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, habits = [], setHabits }) => {
  const [celebrationBadges, setCelebrationBadges] = useState<string[]>([]);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [recentBadgeMap, setRecentBadgeMap] = useState<Record<string, boolean>>({});

  const habitStreaks = useMemo(() => {
    const map: Record<string, number> = {};
    habits.forEach(habit => { map[habit.id] = calculateStreak(habit); });
    return map;
  }, [habits]);

  const toggleCompletion = async (id: string) => {
    const today = getTodayDate();
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const doneToday = h.completedDates.includes(today);
      return {
        ...h,
        completedDates: doneToday ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today],
        xp: Math.max(0, (h.xp || 0) + (doneToday ? -20 : 20)),
      };
    });

    setHabits(updated);
    await saveHabits(updated);

    const changed = updated.find(h => h.id === id);
    if (!changed) return;

    const result = awardBadgesForHabit(changed);
    if (result.awarded.length > 0) {
      const merged = updated.map(h => h.id === id ? result.updatedHabit! : h);
      setHabits(merged);
      await saveHabits(merged);

      setCelebrationBadges(result.awarded);
      setCelebrationVisible(true);

      setRecentBadgeMap(m => ({ ...m, [id]: true }));
      setTimeout(() => setRecentBadgeMap(m => { const copy = { ...m }; delete copy[id]; return copy; }), 2500);
    }
  };

  const deleteHabit = (habit: Habit) => {
    Alert.alert('Delete Habit?', `"${habit.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelScheduledNotifications(habit.notificationIds);
          const updated = habits.filter(h => h.id !== habit.id);
          setHabits(updated);
          await saveHabits(updated);
        },
      },
    ]);
  };

  const openDetail = (habitId: string) => {
    navigation.getParent()?.navigate('Detail', { habitId });
  };

  const renderHabit = ({ item }: { item: Habit }) => (
    <HabitCard
      habit={item}
      onToggle={() => toggleCompletion(item.id)}
      onLongPress={() => deleteHabit(item)}
      onOpenDetail={() => openDetail(item.id)}
      recentBadge={!!recentBadgeMap[item.id]}
      streak={habitStreaks[item.id] || 0}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Today, {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
      </Text>

      <SummaryBar habits={habits} />

      <FlatList
        data={habits}
        keyExtractor={h => h.id}
        renderItem={renderHabit}
        ListEmptyComponent={
          <Text style={styles.empty}>
            🎉 Ready to start building good habits? Tap + to add your first one!
          </Text>
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHabit')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <BadgeModal
        visible={celebrationVisible}
        badges={celebrationBadges}
        onClose={() => setCelebrationVisible(false)}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#F0F2F5' },
  header: { fontSize: 26, fontWeight: '800', marginBottom: 15, color: '#333' },
  empty: { textAlign: 'center', marginTop: 60, color: '#888', fontStyle: 'italic', fontSize: 16 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#A593E0',
    width: 65,
    height: 65,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#A593E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
