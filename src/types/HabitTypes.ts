// src/types/HabitTypes.tsx (Corrected Version)
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
    Tracker: undefined;
    AddHabit: undefined;
    Stats: undefined;
    // Route for HabitDetailScreen
    Detail: { id: string };
};

export type Habit = {
    // ... (rest of Habit definition is correct)
    id: string;
    title: string;
    emoji: string;
    color: string;
    category: string;
    completedDates: string[];
    frequency: 'daily' | 'custom';
    weekdays?: number[];
    weeklyTarget?: number;
    reminderTimes?: string[];
    notificationIds?: string[];
    lastStreakFreezeUsed?: string | null;
    notes?: Record<string, string>;
    xp?: number;
    badges?: string[];
    createdAt?: string;
};

// FIX: Corrected HabitCardProps to match usage in HomeScreen.tsx
export type HabitCardProps = {
    habit: Habit;
    // FIX 1: Change return type from void to Promise<void>
    onToggle: (id: string) => Promise<void>; 
    onLongPress: () => void;
    onOpenDetail?: () => void;
    recentBadge?: boolean;
    // FIX 2: Add the missing 'streak' prop
    streak: number; 
};

export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Tracker'> & {
    habits: Habit[];
    setHabits: (h: Habit[]) => void;
};

export type AddHabitProps = BottomTabScreenProps<RootTabParamList, 'AddHabit'> & {
    habits: Habit[];
    setHabits: (h: Habit[]) => void;
};

export type StatsProps = BottomTabScreenProps<RootTabParamList, 'Stats'> & {
    habits: Habit[];
    setHabits: (h: Habit[]) => void;
};

export type DetailProps = BottomTabScreenProps<RootTabParamList, 'Detail'> & {
    habits: Habit[];
    setHabits: (h: Habit[]) => void;
};