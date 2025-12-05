// src/screens/StatsScreen.tsx
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatsProps } from '../types/HabitTypes';
import { getTodayDate, weeklyCompletion, generateInsights, calculateStreak } from '../data/HabitUtils';
import CalendarHeatmap from '../components/CalendarHeatmap';

interface StatBlockProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatBlock: React.FC<StatBlockProps> = ({ title, value, icon, color, subtitle }) => (
  <View style={[statStyles.card, { borderColor: color, borderLeftWidth: 5 }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Ionicons name={icon as any} size={28} color={color} />
      <Text style={statStyles.title}>{title}</Text>
    </View>
    <Text style={statStyles.value}>{value}</Text>
    {subtitle && <Text style={statStyles.subtitle}>{subtitle}</Text>}
  </View>
);

const statStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: { fontSize: 14, fontWeight: '600', color: '#666' },
  value: { fontSize: 28, fontWeight: '800', marginTop: 5 },
  subtitle: { fontSize: 11, color: '#999', marginTop: 2 },
});

const StatsScreen: React.FC<StatsProps> = ({ habits = [] }) => {
  const total = habits.length;
  const doneToday = habits.filter(h => h.completedDates.includes(getTodayDate())).length;
  const rate = total === 0 ? 0 : Math.round((doneToday / total) * 100);

  const animWidth = new Animated.Value(0);
  useEffect(() => {
    Animated.timing(animWidth, { toValue: rate, duration: 900, useNativeDriver: false }).start();
  }, [rate]);

  const insights = generateInsights(habits);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Global Dashboard</Text>

      {/* Today's Completion Card */}
      <View style={styles.completionCard}>
        <Text style={styles.label}>Today's Progress</Text>
        <Text style={styles.big}>{Math.round(rate)}%</Text>

        <View style={styles.progressBg}>
          <Animated.View
            style={[styles.progressFill, {
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            }]}
          />
        </View>

        <Text style={styles.small}>{doneToday} out of {total} habits completed.</Text>
      </View>

      {/* Quick Insights */}
      <Text style={styles.sub}>Quick Insights</Text>
      <View style={styles.insightsRow}>
        <StatBlock
          title="Top Category"
          value={insights.topCategory || 'N/A'}
          icon="grid-outline"
          color="#4CAF50"
          subtitle={`Total: ${insights.total}`}
        />
        <StatBlock
          title="Busiest Day"
          value={insights.busiestDay || 'N/A'}
          icon="time-outline"
          color="#FF9800"
          subtitle="Based on completions"
        />
      </View>

      {/* Habit Breakdown */}
      <Text style={styles.sub}>Habit Breakdown</Text>
      {habits.length === 0 && <Text style={styles.empty}>No habits logged. Start tracking to see statistics!</Text>}
      {habits.map(h => {
        const wk = weeklyCompletion(h);
        const streak = calculateStreak(h);
        const badges = h.badges || []; // ✅ default to empty array if undefined

        return (
          <View key={h.id} style={styles.item}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 15 }}>{h.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{h.title}</Text>
                <Text style={styles.reminder}>
                  {h.category} | {h.frequency === 'daily' ? 'Daily' : 'Custom'}
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontWeight: '600',
                    color: wk.rate === 100 ? '#4CAF50' : '#1D9BF0',
                  }}
                >
                  Week: {wk.completed} / {wk.scheduled} ({wk.rate}%)
                </Text>
                <Text style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                  Streak: {streak} day{streak !== 1 ? 's' : ''}
                </Text>

                {badges.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                    {badges.map(b => (
                      <View
                        key={b}
                        style={{
                          backgroundColor: '#FFD700',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6,
                          marginRight: 4,
                          marginTop: 2,
                        }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '700' }}>{b}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Calendar Heatmap */}
            <View style={{ marginTop: 15, paddingHorizontal: 10, alignSelf: 'center' }}>
              <CalendarHeatmap completedDates={h.completedDates} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container:{flex:1,paddingHorizontal:15,paddingTop:20,backgroundColor:'#F0F2F5'},
  header:{fontSize:26,fontWeight:'800',marginBottom:20},

  // Completion Card
  completionCard:{backgroundColor:'#fff',padding:25,borderRadius:16,alignItems:'center',elevation:5,shadowColor:'#1D9BF0',shadowOffset:{width:0,height:4},shadowOpacity:0.1,shadowRadius:8,marginBottom:20},
  label:{color:'#555',fontSize:14,fontWeight:'500'},
  big:{fontSize:56,fontWeight:'800',color:'#1D9BF0',marginTop:6},
  progressBg:{width:'100%',height:14,backgroundColor:'#E0E0E0',borderRadius:7,marginTop:15},
  progressFill:{height:'100%',backgroundColor:'#1D9BF0',borderRadius:7},
  small:{color:'#777',marginTop:10},

  sub:{fontSize:20,fontWeight:'700',marginTop:15,marginBottom:10},
  insightsRow:{flexDirection:'row',justifyContent:'space-between',marginHorizontal:-5,marginBottom:10},

  item:{backgroundColor:'#FFF',padding:15,borderRadius:12,marginBottom:12,elevation:1,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:2},
  itemTitle:{fontWeight:'800',fontSize:16},
  reminder:{fontSize:12,color:'#666',marginTop:2},
  empty:{textAlign:'center',marginTop:40,color:'#888'},
});
