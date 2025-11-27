import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { NotificationTriggerInput } from 'expo-notifications';
import { Habit } from '../types/HabitTypes'; // Assuming Habit is defined here

// FIX 5: Define the constant key
const HABITS_KEY = '@HabitTracker:habits';

// FIX 2: Define the utility function
const getSecondsUntilNineAM = (): number => {
  const now = new Date();
  const nineAM = new Date();
  nineAM.setHours(9, 0, 0, 0);

  if (now.getTime() >= nineAM.getTime()) {
    nineAM.setDate(nineAM.getDate() + 1);
  }

  const delayInSeconds = Math.round((nineAM.getTime() - now.getTime()) / 1000);
  return delayInSeconds;
};


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

export const getTodayDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateStreak = (dates: string[]): number => {
  if (!dates || dates.length === 0) {
    return 0;
  }

  // Helper to convert 'YYYY-MM-DD' to a Date object (midnight UTC)
  const parseDate = (dateString: string): Date => {
    // Adding 'T00:00:00.000Z' ensures dates are treated as UTC midnight,
    // avoiding timezone issues that shift the day.
    return new Date(`${dateString}T00:00:00.000Z`);
  };

  // Convert all recorded dates to millisecond timestamps for easy comparison
  const completedTimestamps = dates
    .map(dateStr => parseDate(dateStr).getTime())
    // Sort and remove duplicates to ensure correct sequential checks
    .filter((ts, i, arr) => arr.indexOf(ts) === i)
    .sort((a, b) => b - a); // Sort descending (most recent first)


  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  let streak = 0;

  // 1. Determine the start point: Today or Yesterday
  const todayStr = getTodayDate();
  const todayTS = parseDate(todayStr).getTime();
  const yesterdayTS = todayTS - MS_PER_DAY;

  let currentCheckingTS: number;
  let currentStreak = 0;

  // Check if today is completed
  if (completedTimestamps.includes(todayTS)) {
    currentStreak = 1;
    currentCheckingTS = yesterdayTS; // Start checking from yesterday
  } 
  // Check if the habit was completed yesterday (allows for streak to continue after missing today)
  else if (completedTimestamps.includes(yesterdayTS)) {
    currentCheckingTS = yesterdayTS;
  } 
  // If not completed today or yesterday, the streak is 0 unless we find a day
  else {
    return 0;
  }
  
  // Find the index of the most recent day included in the initial check
  const startIndex = completedTimestamps.findIndex(ts => ts === todayTS || ts === yesterdayTS);
  if (startIndex === -1) return 0; // Should not happen if the previous logic passes, but safety first

  // 2. Iterate backward from the start point
  for (let i = startIndex + currentStreak; i < completedTimestamps.length; i++) {
    const dayBefore = completedTimestamps[i];
    
    // Check if the current completed day is the day before the day we are checking
    if (dayBefore === currentCheckingTS) {
      currentStreak++;
      // Move the checking day back one more day
      currentCheckingTS -= MS_PER_DAY;
    } else if (dayBefore < currentCheckingTS) {
      // If the current completed date is older than the date we need, 
      // the streak is broken, so we stop.
      break; 
    }
  }

  return currentStreak;
};

export const saveHabits = async (habits: Habit[]): Promise<void> => {
try {
await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits ?? []));
} catch (err) {
console.error('[HabitUtils] saveHabits error:', err);
}
};


export const scheduleNotification = async (habitTitle: string): Promise<string | undefined> => {
try {
const secondsDelay = getSecondsUntilNineAM();
const triggerObject = {
type: 'interval' as const,
seconds: secondsDelay,
repeats: true,
};

// FIX 1 & 4: Notifications and NotificationTriggerInput are now imported
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


export const cancelScheduledNotification = async (notificationId?: string): Promise<void> => {
try {
if (!notificationId) return;
await Notifications.cancelScheduledNotificationAsync(notificationId);
} catch (err) {
console.error('[HabitUtils] cancelScheduledNotification error:', err);
}
};