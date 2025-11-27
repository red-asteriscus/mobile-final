import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  LayoutAnimation 
} from 'react-native'; // <-- Added Animated, LayoutAnimation
import { Ionicons } from '@expo/vector-icons'; // <-- Added Ionicons
import { Habit } from '../types/HabitTypes'; 
import { getTodayDate } from '../data/HabitUtils'; // <-- Added getTodayDate import

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  onLongPress: () => void;
}

// FIX 1: Define the component and accept props
const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onLongPress }) => { 
  
  // FIX 2: Initialize the Animated value
  const scale = useRef(new Animated.Value(1)).current;

  // FIX 4: Call the imported function
  const today = getTodayDate(); 
  
  // FIX 3: 'habit' is now available from props
  const done = habit.completedDates.includes(today);


  useEffect(() => {
    // simple pop when status changes
    // FIX 1: 'Animated' is now imported
    // FIX 2: 'scale' is now defined
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 120, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [done]);


  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle(habit.id);
        }}
        onLongPress={onLongPress}
      >
        <View style={[styles.card, { backgroundColor: habit.color || '#ffffff' }]}>
          <View style={styles.left}>
            <Text style={styles.emoji}>{habit.emoji || '✨'}</Text>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.title}>{habit.title}</Text>
              <Text style={styles.cat}>{habit.category}</Text>
            </View>
          </View>

          {/* FIX: Ionicons needs to be imported */}
          <Ionicons
            name={done ? 'checkmark-circle' : 'ellipse-outline'}
            size={30}
            color={done ? '#0f9d58' : '#333'}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};


export default HabitCard;

const styles = StyleSheet.create({
wrapper: { marginBottom: 12 },
card: {
padding: 14,
borderRadius: 12,
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
elevation: 2,
},
left: { flexDirection: 'row', alignItems: 'center' },
emoji: { fontSize: 28 },
title: { fontSize: 16, fontWeight: '700', color: '#111' },
cat: { marginTop: 4, fontSize: 12, color: '#333', opacity: 0.8 },
});