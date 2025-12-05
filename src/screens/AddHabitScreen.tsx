// src/screens/AddHabitScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Switch, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddHabitProps, Habit } from '../types/HabitTypes';
import { saveHabits, scheduleNotificationsForTimes } from '../data/HabitUtils';
import TimePickerList from '../components/TimePicker';

const EMOJIS = ['📚','💪','🧘','🚰','🧹','📝','🎧','🥗','🚶','😴','🎨','💰','🐶'];
const COLORS = ['#FFD6A5','#A2D2FF','#BDE0FE','#C8FFD4','#F7B7F3','#FFB4A2','#007AFF'];
const CATEGORIES = ['Health','Study','Mindset','Fitness','Work','Finance','Creative','Other'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const AddHabitScreen: React.FC<AddHabitProps> = ({ navigation, habits, setHabits }) => {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [frequency, setFrequency] = useState<'daily'|'custom'>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [openPickerIndex, setOpenPickerIndex] = useState<number | null>(null);

  const toggleWeekday = (index: number) => {
    setWeekdays(prev => prev.includes(index) ? prev.filter(d=>d!==index) : [...prev,index]);
  };

  const addReminder = () => {
    if(reminderTimes.length >= 5){
      Alert.alert('Too many reminders','You can set a maximum of 5 reminders per habit.');
      return;
    }
    const newTime = new Date(); // default placeholder
    setReminderTimes(prev => [...prev, newTime]);
    setOpenPickerIndex(reminderTimes.length); // open picker immediately
  };

  const removeReminder = (idx:number) => setReminderTimes(prev => prev.filter((_,i)=>i!==idx));

  const onSave = async () => {
    if(!title.trim()) return Alert.alert('Missing Title','Please enter a habit name.');
    if(frequency==='custom' && weekdays.length===0) return Alert.alert('Missing Weekdays','Select at least one day.');

    setLoading(true);

    const timesStr = reminderTimes.map(d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
    let notifIds: string[] = [];
    if(reminderEnabled){
      notifIds = await scheduleNotificationsForTimes(title.trim(), timesStr);
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      title: title.trim(),
      emoji,
      color,
      category,
      completedDates: [],
      frequency,
      weekdays: frequency==='custom'?weekdays:undefined,
      reminderTimes: reminderEnabled?timesStr:[],
      notificationIds: notifIds,
      lastStreakFreezeUsed: null,
      notes: {},
      xp:0,
      badges:[],
      createdAt: new Date().toISOString(),
    };

    const updated = [...habits,newHabit];
    setHabits(updated);
    await saveHabits(updated);
    setLoading(false);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom:80}}>
      <Text style={styles.header}>Create a New Habit</Text>

      {/* Habit Name & Icon/Color */}
      <View style={styles.sectionCard}>
        <Text style={styles.label}>Habit Name</Text>
        <TextInput style={styles.input} placeholder="e.g., Read for 30 minutes" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Icon & Color</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          {EMOJIS.map(e => (
            <TouchableOpacity key={e} onPress={() => setEmoji(e)}>
              <Text style={[styles.emoji, {opacity: e===emoji?1:0.4, transform:[{scale:e===emoji?1.2:1}]}]}>{e}</Text>
            </TouchableOpacity>
          ))}
          <View style={{flexDirection:'row',marginLeft:10}}>
            {COLORS.map(c=>(
              <TouchableOpacity key={c} onPress={()=>setColor(c)} style={[styles.colorDot,{backgroundColor:c,borderWidth:c===color?3:1}]}>
                {c===color && <Ionicons name="checkmark" size={18} color="#333"/>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap'}}>
          {CATEGORIES.map(cat=>(
            <TouchableOpacity key={cat} onPress={()=>setCategory(cat)} style={[styles.chip,{backgroundColor:cat===category?'#1D9BF0':'#E8EBF0'}]}>
              <Text style={{color:cat===category?'#fff':'#333',fontWeight:'500'}}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Frequency */}
      <View style={styles.sectionCard}>
        <Text style={styles.label}>Frequency</Text>
        <View style={{flexDirection:'row',marginBottom:12}}>
          <TouchableOpacity onPress={()=>setFrequency('daily')} style={[styles.freqChip,{backgroundColor:frequency==='daily'?'#1D9BF0':'#E8EBF0'}]}>
            <Text style={{color:frequency==='daily'?'#fff':'#333',fontWeight:'500'}}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setFrequency('custom')} style={[styles.freqChip,{backgroundColor:frequency==='custom'?'#1D9BF0':'#E8EBF0',marginLeft:8}]}>
            <Text style={{color:frequency==='custom'?'#fff':'#333',fontWeight:'500'}}>Custom Weekdays</Text>
          </TouchableOpacity>
        </View>

        {frequency==='custom' && (
          <View style={{marginTop:8}}>
            <Text style={styles.subLabel}>Pick specific days</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginTop:8}}>
              {WEEKDAYS.map((d,i)=>(
                <TouchableOpacity key={d} onPress={()=>toggleWeekday(i)} style={[styles.weekChip,{backgroundColor:weekdays.includes(i)?'#1D9BF0':'#fff',borderWidth:1,borderColor:weekdays.includes(i)?'#1D9BF0':'#ddd'}]}>
                  <Text style={{color:weekdays.includes(i)?'#fff':'#333',fontWeight:'600'}}>{d.slice(0,1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Reminders */}
      <View style={styles.sectionCard}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Text style={styles.label}>Enable Reminders</Text>
          <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{true:'#1D9BF0'}} />
        </View>

        {reminderEnabled && (
          <TimePickerList
            times={reminderTimes}
            onChange={(idx, newTime) => setReminderTimes(prev => prev.map((t,i)=>i===idx?newTime:t))}
            onRemove={removeReminder}
            openIndex={openPickerIndex ?? undefined}
          />
        )}

        {reminderEnabled && reminderTimes.length < 5 && (
          <TouchableOpacity onPress={addReminder} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={20} color="#1D9BF0" style={{marginRight:5}}/>
            <Text style={{color:'#1D9BF0',fontWeight:'600'}}>Add another time</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.button} onPress={onSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading?'Saving Habit...':'Create Habit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddHabitScreen;

const styles = StyleSheet.create({
  container:{flex:1,padding:20,backgroundColor:'#F0F2F5'},
  header:{fontSize:26,fontWeight:'800',marginBottom:20},
  sectionCard:{backgroundColor:'#fff',padding:15,borderRadius:15,marginBottom:15,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.1,shadowRadius:3,elevation:3},
  label:{marginTop:10,marginBottom:6,fontWeight:'700',fontSize:16},
  subLabel:{color:'#666',fontSize:13,marginBottom:5},
  input:{backgroundColor:'#F9F9F9',padding:12,borderRadius:10,borderWidth:1,borderColor:'#eee'},
  emoji:{fontSize:36,marginHorizontal:6,marginBottom:5},
  colorDot:{width:30,height:30,borderRadius:15,marginHorizontal:4,alignItems:'center',justifyContent:'center'},
  chip:{paddingHorizontal:12,paddingVertical:8,borderRadius:20,marginRight:8,marginBottom:8},
  freqChip:{paddingHorizontal:16,paddingVertical:10,borderRadius:10},
  weekChip:{width:38,height:38,borderRadius:19,alignItems:'center',justifyContent:'center',margin:3, ...Platform.select({ios:{width:'12%',height:38},android:{}})},
  addButton:{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',marginTop:10},
  button:{backgroundColor:'#1D9BF0',padding:16,borderRadius:12,alignItems:'center',marginTop:30,elevation:5},
  buttonText:{color:'white',fontWeight:'800',fontSize:18},
});
