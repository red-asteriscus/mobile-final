import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Tracker: undefined;
  AddHabit: undefined;
  Stats: undefined;
  Detail: { id: string } | undefined;
};

export type Habit = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  category: string;
  // completion stored as 'YYYY-MM-DD' strings
  completedDates: string[];
  // Frequency: daily, or custom weekdays (0 Sun - 6 Sat)
  frequency: 'daily' | 'custom';
  weekdays?: number[]; // e.g., [1,3,5] for Mon Wed Fri
  // weekly target: if set and frequency is 'weekly' concept (we keep it optional)
  weeklyTarget?: number;
  // reminders: array of "HH:MM" strings
  reminderTimes?: string[];
  // scheduled notification ids per reminder
  notificationIds?: string[];
  // enable one "streak freeze" per 30 days: store last used date 'YYYY-MM-DD' or empty
  lastStreakFreezeUsed?: string | null;
  // notes keyed by date (YYYY-MM-DD) -> string (simple)
  notes?: Record<string, string>;
  // metadata for gamification
  xp?: number;
  badges?: string[]; // list of badge ids
  // persistent fields
  createdAt?: string;
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
