// src/data/HabitUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '../types/HabitTypes';

const HABITS_KEY = '@HabitTracker:habits_v3';

// ======= Date Helpers =======
export const getTodayDate = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export const toDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

// Returns last N dates (oldest first)
export const getLastNDates = (n: number): Date[] => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dates: Date[] = [];
  for(let i = n-1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24*60*60*1000);
    dates.push(d);
  }
  return dates;
};

// ======= AsyncStorage Helpers =======
export const loadHabits = async (): Promise<Habit[]> => {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((h: Partial<Habit>) => ({
      completedDates: [],
      notificationIds: [],
      xp: 0,
      badges: [],
      notes: {},
      createdAt: new Date().toISOString(),
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

// ======= Notifications =======
export const scheduleNotificationsForTimes = async (title: string, times: string[]): Promise<string[]> => {
  if (Platform.OS === 'web') {
    console.warn("Notifications not supported on web. Skipping scheduling.");
    return [];
  }

  const ids: string[] = [];

  for (const t of times) {
    const [hh, mm] = t.split(':').map(Number);

    // Compute next trigger date
    const now = new Date();
    const triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
    if (triggerDate.getTime() < now.getTime()) {
      // If time already passed today, schedule for tomorrow
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const trigger: Notifications.NotificationTriggerInput = {
      date: triggerDate, // ✅ works for Date trigger
      repeats: true,     // repeats daily
    } as any; // cast avoids TS error

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: 'Habit Reminder', body: `Time for: ${title}`, sound: true },
        trigger,
      });
      ids.push(id);
    } catch (err) {
      console.error('[HabitUtils] schedule notif error', err);
    }
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

// ======= Streak & Weekly Completion =======
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const calculateStreak = (habit: Habit): number => {
  const setDates = new Set(habit.completedDates || []);
  if (!setDates.size) return 0;

  let streak = 0;
  let current = new Date();
  current.setHours(0,0,0,0);

  while (true) {
    const key = toDateKey(current);
    let scheduled = true;
    if (habit.frequency === 'custom' && habit.weekdays?.length) {
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
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const end = new Date(start.getTime() + 7 * MS_PER_DAY);

  let scheduled = habit.frequency === 'daily' ? 7 : (habit.frequency === 'custom' && habit.weekdays?.length ? habit.weekdays.length : 7);

  const completed = (habit.completedDates || []).filter(s => {
    const ts = new Date(`${s}T00:00:00`).getTime();
    return ts >= start.getTime() && ts < end.getTime();
  }).length;

  const rate = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100);
  return { completed, scheduled, rate };
};

// ======= Insights =======
export const generateInsights = (habits: Habit[]) => {
  const todayStr = getTodayDate();
  const total = habits.length;
  const doneToday = habits.filter(h => h.completedDates.includes(todayStr)).length;

  const catCounts: Record<string, number> = {};
  habits.forEach(h => catCounts[h.category] = (catCounts[h.category] || 0) + 1);
  const topCategory = Object.keys(catCounts).sort((a,b)=>catCounts[b]-catCounts[a])[0];

  const dayCounts: Record<string, number> = {};
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  habits.forEach(h => {
    h.completedDates.forEach(dStr => {
      const d = new Date(dStr);
      const dayName = days[d.getDay()];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });
  });
  const busiestDay = Object.keys(dayCounts).sort((a,b)=>dayCounts[b]-dayCounts[a])[0];

  return { total, doneToday, topCategory: topCategory || null, busiestDay: busiestDay || null };
};

// ======= Badges =======
type AwardResult = { awarded: string[]; updatedHabit?: Habit };
export const awardBadgesForHabit = (habit: Habit): AwardResult => {
  const awarded: string[] = [];
  const updated = { ...habit, badges: [...(habit.badges||[])], xp: habit.xp||0 };

  const streak = calculateStreak(habit);
  if(streak>=3 && !updated.badges.includes('3-day')) { updated.badges.push('3-day'); updated.xp+=15; awarded.push('3-day'); }
  if(streak>=7 && !updated.badges.includes('7-day')) { updated.badges.push('7-day'); updated.xp+=35; awarded.push('7-day'); }
  if(streak>=30 && !updated.badges.includes('30-day')) { updated.badges.push('30-day'); updated.xp+=120; awarded.push('30-day'); }

  const wk = weeklyCompletion(habit);
  if(wk.scheduled>0 && wk.completed===wk.scheduled && !updated.badges.includes('perfect-week')) {
    updated.badges.push('perfect-week'); updated.xp+=50; awarded.push('perfect-week');
  }

  return { awarded, updatedHabit: updated };
};
