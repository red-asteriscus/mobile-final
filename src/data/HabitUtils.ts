import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types/HabitTypes';
import * as Notifications from 'expo-notifications';
import { NotificationTriggerInput } from 'expo-notifications';

const HABITS_KEY = '@habits_v1';

// --- Date Helpers ---

export const getTodayDate = (): string => {
  // Returns date in 'YYYY-MM-DD' format
  return new Date().toISOString().split('T')[0];
};

/**
 * Calculates the number of seconds until the next 9:00 AM.
 * This is used to set the initial delay for the Time Interval Trigger.
 */
const getSecondsUntilNineAM = (): number => {
    const now = new Date();
    const nextNine = new Date();
    
    // 1. Set the target time to 9:00 AM today (hour: 9, minute: 0, second: 0, millisecond: 0)
    nextNine.setHours(9, 0, 0, 0);

    // 2. If 9:00 AM has already passed today, set the target to 9:00 AM tomorrow
    if (nextNine.getTime() <= now.getTime()) {
        nextNine.setDate(nextNine.getDate() + 1);
    }
    
    // 3. Calculate the difference in milliseconds and convert to seconds
    const diffMs = nextNine.getTime() - now.getTime();
    // Use Math.ceil to ensure the delay is slightly longer
    return Math.ceil(diffMs / 1000); 
};

/**
 * Calculates the current consecutive daily streak.
 * @param completedDates Array of 'YYYY-MM-DD' strings.
 */
export const calculateStreak = (completedDates: string[] = []): number => {
  if (!Array.isArray(completedDates) || completedDates.length === 0) return 0;

  // Use Set to ensure uniqueness and then sort newest to oldest
  const uniqueDates = Array.from(
    new Set(completedDates.map(d => d?.split('T')[0] ?? d))
  )
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  
  // Start checking from today (or the latest recorded date if it's in the future, although it shouldn't be)
  let cursor = new Date();
  
  // FIX: Ensure the cursor date is correctly set to midnight for comparison accuracy
  cursor.setHours(0, 0, 0, 0); 
  
  // Check if the latest completion was yesterday or today
  const today = getTodayDate();
  const yesterday = new Date(cursor);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];
  
  // If the latest completed date is neither today nor yesterday, the streak is 0.
  if (uniqueDates.length > 0 && uniqueDates[0] !== today && uniqueDates[0] !== yesterdayKey) {
      return 0;
  }
  
  // If the last completion was yesterday, move the cursor back a day to start checking the streak from yesterday.
  if (uniqueDates.length > 0 && uniqueDates[0] === yesterdayKey) {
      cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().split('T')[0];
    
    if (uniqueDates.includes(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1); // Move to the previous day
    } else {
      break; // Streak broken
    }
  }

  return streak;
};


// --- AsyncStorage helpers ---
export const loadHabits = async (): Promise<Habit[]> => {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[HabitUtils] loadHabits error:', err);
    return [];
  }
};

export const saveHabits = async (habits: Habit[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits ?? []));
  } catch (err) {
    console.error('[HabitUtils] saveHabits error:', err);
  }
};

// --- Notifications ---
export const scheduleNotification = async (
  habitTitle: string
): Promise<string | undefined> => {
  try {
    // Calculate the delay until the first 9:00 AM
    const secondsDelay = getSecondsUntilNineAM(); 
    
    // The trigger structure for a daily repeating notification after the initial delay
    const triggerObject = {
      type: 'interval' as const, // Use 'as const' for the literal type 'interval'
      seconds: secondsDelay, 
      repeats: true,
    };
    
    // NOTE: The type assertion (as unknown as NotificationTriggerInput) is a common workaround 
    // for Expo's inconsistent TypeScript definition of NotificationTriggerInput, 
    // especially for time interval triggers.
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Reminder',
        body: `Time for: ${habitTitle}`,
        sound: true,
      },
      trigger: triggerObject as unknown as NotificationTriggerInput,
    });

    return id;
  } catch (err) {
    console.error('[HabitUtils] scheduleNotification error:', err);
    return undefined;
  }
};

export const cancelScheduledNotification = async (
  notificationId?: string
): Promise<void> => {
  try {
    if (!notificationId) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.error('[HabitUtils] cancelScheduledNotification error:', err);
  }
};