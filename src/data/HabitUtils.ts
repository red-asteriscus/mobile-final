// src/data/HabitUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native'; // Import Platform
import { Habit } from '../types/HabitTypes';

const HABITS_KEY = '@HabitTracker:habits_v3';

export const getTodayDate = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const toDateKey = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const loadHabits = async (): Promise<Habit[]> => {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // ensure defaults
    return parsed.map((h: Partial<Habit>) => ({
      completedDates: [],
      notificationIds: [],
      xp: 0,
      badges: [],
      notes: {},
      createdAt: getTodayDate(),
      ...h,
    }));
  } catch (err) {
    console.error('[HabitUtils] load error', err);
    return [];
  }
};

export const saveHabits = async (habits: Habit[]) => {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits ?? []));
  } catch (err) {
    console.error('[HabitUtils] save error', err);
  }
};

// Schedule notifications for provided times (strings "HH:MM"). returns ids
export const scheduleNotificationsForTimes = async (title: string, times: string[]): Promise<string[]> => {
  // FIX 1: Platform check to prevent crash on web
  if (Platform.OS === 'web') {
    console.warn("Notifications are not supported on the web platform. Skipping scheduling.");
    return [];
  }

  const ids: string[] = [];
  for (const t of times) {
    const [hh, mm] = t.split(':').map(Number);
    
    // FIX 2: Use 'as any' to bypass the persistent NotificationTriggerInput TypeScript error
    const trigger: any = { 
        type: 'time', 
        hour: hh, 
        minute: mm, 
        repeats: true 
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: { title: 'Habit Reminder', body: `Time for: ${title}`, sound: true },
      trigger,
    });
    ids.push(id);
  }
  return ids;
};

export const cancelScheduledNotifications = async (ids?: string[] | null) => {
  if (!ids) return;
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (err) {
      console.error('[HabitUtils] cancel notif error', err);
    }
  }
};

// ---------- Streak & weekly helpers ----------
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const calculateStreak = (habit: Habit): number => {
  const dates = (habit.completedDates || []).slice().sort().reverse();
  if (!dates.length) return 0;

  const todayKey = getTodayDate();
  // start checking from today backward
  let streak = 0;
  let current = new Date(); current.setHours(0, 0, 0, 0);

  const setDates = new Set((habit.completedDates || []));
  while (true) {
    const key = toDateKey(current);
    let scheduled = true;
    if (habit.frequency === 'custom' && habit.weekdays && habit.weekdays.length) {
      scheduled = habit.weekdays.includes(current.getDay());
    }
    if (scheduled) {
      if (setDates.has(key)) streak++;
      else break;
    }
    current = new Date(current.getTime() - MS_PER_DAY);
    if (streak > 365) break;
  }
  return streak;
};

export const weeklyCompletion = (habit: Habit) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()); // Sunday
  const end = new Date(start.getTime() + 7 * MS_PER_DAY);
  let scheduled = 0;
  if (habit.frequency === 'daily') scheduled = 7;
  else if (habit.frequency === 'custom' && habit.weekdays) {
    for (let i = 0; i < 7; i++) {
      const day = new Date(start.getTime() + i * MS_PER_DAY);
      if ((habit.weekdays || []).includes(day.getDay())) scheduled++;
    }
  } else scheduled = 7;

  const completed = (habit.completedDates || []).filter((s) => {
    const ts = new Date(`${s}T00:00:00`).getTime();
    return ts >= start.getTime() && ts < end.getTime();
  }).length;

  const rate = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
  return { completed, scheduled, rate };
};

// FIX 3: Exported member 'generateInsights'
export const generateInsights = (habits: Habit[]) => {
  const total = habits.length;
  const doneToday = habits.filter((h) => h.completedDates.includes(getTodayDate())).length;

  // Calculate Top Category
  const catCounts: Record<string, number> = {};
  habits.forEach((h) => {
    catCounts[h.category] = (catCounts[h.category] || 0) + 1;
  });
  const topCategory = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0];

  // Calculate Busiest Day (based on historical completions)
  const dayCounts: Record<string, number> = {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  habits.forEach((h) => {
    h.completedDates.forEach((dateStr) => {
      const d = new Date(dateStr);
      const dayName = days[d.getDay()];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });
  });
  const busiestDay = Object.keys(dayCounts).sort((a, b) => dayCounts[b] - dayCounts[a])[0];

  return {
    total,
    doneToday,
    topCategory: topCategory || null,
    busiestDay: busiestDay || null,
  };
};


// ---------- Badge awarding ----------
type AwardResult = { awarded: string[]; updatedHabit?: Habit };

export const awardBadgesForHabit = (habit: Habit): AwardResult => {
  const awarded: string[] = [];
  const updated = { ...habit, badges: [...(habit.badges || [])], xp: habit.xp || 0 };

  const streak = calculateStreak(habit);

  // 3-day
  if (streak >= 3 && !updated.badges.includes('3-day')) {
    updated.badges.push('3-day');
    updated.xp += 15;
    awarded.push('3-day');
  }
  // 7-day
  if (streak >= 7 && !updated.badges.includes('7-day')) {
    updated.badges.push('7-day');
    updated.xp += 35;
    awarded.push('7-day');
  }
  // 30-day
  if (streak >= 30 && !updated.badges.includes('30-day')) {
    updated.badges.push('30-day');
    updated.xp += 120;
    awarded.push('30-day');
  }

  // Perfect week
  const wk = weeklyCompletion(habit);
  if (wk.scheduled > 0 && wk.completed === wk.scheduled && !updated.badges.includes('perfect-week')) {
    updated.badges.push('perfect-week');
    updated.xp += 50;
    awarded.push('perfect-week');
  }

  // Return only if awarded anything
  return { awarded, updatedHabit: updated };
};