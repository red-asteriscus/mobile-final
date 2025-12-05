// src/screens/HomeScreen.tsx
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreenProps, Habit } from '../types/HabitTypes';
import { getTodayDate, calculateStreak, saveHabits, cancelScheduledNotifications, awardBadgesForHabit } from '../data/HabitUtils';
import HabitCard from '../components/HabitCard';
import BadgeModal from '../components/BadgeModal';

// --- NEW HELPER COMPONENT: Summary Bar ---
const SummaryBar = ({ habits }: { habits: Habit[] }) => {
    const today = getTodayDate();
    const total = habits.length;
    const doneToday = habits.filter((h) => h.completedDates.includes(today)).length;
    const xpTotal = habits.reduce((sum, h) => sum + (h.xp || 0), 0);
    const percentage = total === 0 ? 0 : Math.round((doneToday / total) * 100);

    return (
        <View style={summaryStyles.bar}>
            <View style={summaryStyles.statBlock}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#1D9BF0" />
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
    statValue: { fontSize: 18, fontWeight: '700', marginTop: 4 },
    statLabel: { fontSize: 11, color: '#666' },
    divider: { width: 1, backgroundColor: '#eee' },
});
// --- END Summary Bar ---

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, habits = [], setHabits }) => {
    const [celebrationBadges, setCelebrationBadges] = useState<string[]>([]);
    const [celebrationVisible, setCelebrationVisible] = useState(false);
    const [recentBadgeMap, setRecentBadgeMap] = useState<Record<string, boolean>>({});

    // Use useMemo to avoid recalculating streaks constantly
    const habitStreaks = useMemo(() => {
        return habits.reduce((map, habit) => {
            map[habit.id] = calculateStreak(habit);
            return map;
        }, {} as Record<string, number>);
    }, [habits]);


    const toggleCompletion = async (id: string) => {
        const today = getTodayDate();
        const updated = habits.map((h) => {
            if (h.id !== id) return h;
            const doneToday = h.completedDates.includes(today);
            const newCompleted = doneToday ? h.completedDates.filter((d) => d !== today) : [...h.completedDates, today];
            // xp change on toggle (increased to feel more rewarding)
            const xpChange = doneToday ? -10 : 20; 
            const newXp = Math.max(0, (h.xp || 0) + xpChange);
            return { ...h, completedDates: newCompleted, xp: newXp };
        });

        // persist basic change
        setHabits(updated);
        await saveHabits(updated);

        // award badges for the changed habit (find it again)
        const changed = updated.find((x) => x.id === id);
        if (!changed) return;

        const result = awardBadgesForHabit(changed);
        if (result.awarded.length) {
            // update habit in storage with new badges/xp
            const merged = updated.map((h) => (h.id === id ? result.updatedHabit! : h));
            setHabits(merged);
            await saveHabits(merged);

            // show celebrations:
            setCelebrationBadges(result.awarded);
            setCelebrationVisible(true);

            // mark inline animation target for the habit
            setRecentBadgeMap((m) => ({ ...m, [id]: true }));
            // remove inline flag after animation time
            setTimeout(() => {
                setRecentBadgeMap((m) => {
                    const copy = { ...m };
                    delete copy[id];
                    return copy;
                });
            }, 2500);
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
                    const updated = habits.filter((h) => h.id !== habit.id);
                    setHabits(updated);
                    await saveHabits(updated);
                },
            },
        ]);
    };

    const openDetail = (id: string) => navigation.navigate('Detail', { id });

    const renderHabit = ({ item }: { item: Habit }) => (
        <HabitCard
            habit={item}
            onToggle={toggleCompletion}
            onLongPress={() => deleteHabit(item)}
            onOpenDetail={() => openDetail(item.id)}
            recentBadge={!!recentBadgeMap[item.id]}
            streak={habitStreaks[item.id] || 0} // Pass calculated streak
        />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Day, {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</Text>
            
            <SummaryBar habits={habits} />

            <FlatList
                data={habits}
                keyExtractor={(h) => h.id}
                renderItem={renderHabit}
                ListEmptyComponent={<Text style={styles.empty}>🎉 Ready to start building good habits? Tap + to add your first one!</Text>}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            />

            {/* FAB (Floating Action Button) */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddHabit')}>
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
    container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: '#F0F2F5' }, // Lighter background
    header: { fontSize: 26, fontWeight: '800', marginBottom: 15 },
    empty: { textAlign: 'center', marginTop: 60, color: '#888', fontStyle: 'italic' },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: '#1D9BF0', // Blue color
        width: 65,
        height: 65,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#1D9BF0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});