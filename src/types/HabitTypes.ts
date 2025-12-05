import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/** --- Navigation Params --- */
export type RootTabParamList = {
    Tracker: undefined;
    AddHabit: undefined;
    Stats: undefined;
    Detail: { id: string }; // HabitDetailScreen
};

/** --- Habit Model --- */
export type Habit = {
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

/** --- HabitCard Props --- */
export type HabitCardProps = {
    habit: Habit;
    onToggle: (id: string) => Promise<void>; // must return Promise<void>
    onLongPress: () => void;
    onOpenDetail?: () => void;
    recentBadge?: boolean;
    streak: number; // current streak
};

/** --- Screen Props --- */
export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Tracker'> & {
    habits: Habit[];
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

export type AddHabitProps = BottomTabScreenProps<RootTabParamList, 'AddHabit'> & {
    habits: Habit[];
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

export type StatsProps = BottomTabScreenProps<RootTabParamList, 'Stats'> & {
    habits: Habit[];
};

export type DetailProps = BottomTabScreenProps<RootTabParamList, 'Detail'> & {
    habits: Habit[];
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};
