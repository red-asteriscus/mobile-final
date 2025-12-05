import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type TimeInputProps = {
  value: Date;
  onChange: (newTime: Date) => void;
};

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange }) => {
  const incrementHour = () => {
    const newTime = new Date(value);
    newTime.setHours((newTime.getHours() + 1) % 24);
    onChange(newTime);
  };

  const decrementHour = () => {
    const newTime = new Date(value);
    newTime.setHours((newTime.getHours() + 23) % 24); // wrap around 0-23
    onChange(newTime);
  };

  const incrementMinute = () => {
    const newTime = new Date(value);
    newTime.setMinutes((newTime.getMinutes() + 1) % 60);
    onChange(newTime);
  };

  const decrementMinute = () => {
    const newTime = new Date(value);
    newTime.setMinutes((newTime.getMinutes() + 59) % 60); // wrap around 0-59
    onChange(newTime);
  };

  const hourStr = value.getHours().toString().padStart(2, '0');
  const minStr = value.getMinutes().toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      {/* Hours */}
      <View style={styles.timeUnit}>
        <TouchableOpacity onPress={incrementHour} style={styles.arrow}>
          <Text style={styles.arrowText}>▲</Text>
        </TouchableOpacity>
        <Text style={styles.timeText}>{hourStr}</Text>
        <TouchableOpacity onPress={decrementHour} style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.separator}>:</Text>

      {/* Minutes */}
      <View style={styles.timeUnit}>
        <TouchableOpacity onPress={incrementMinute} style={styles.arrow}>
          <Text style={styles.arrowText}>▲</Text>
        </TouchableOpacity>
        <Text style={styles.timeText}>{minStr}</Text>
        <TouchableOpacity onPress={decrementMinute} style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  timeUnit: { alignItems: 'center', justifyContent: 'center' },
  arrow: { padding: 4 },
  arrowText: { fontSize: 16, fontWeight: '600' },
  timeText: { fontSize: 20, fontWeight: '700', marginVertical: 2 },
  separator: { fontSize: 20, fontWeight: '700', marginHorizontal: 4 },
});

export default TimeInput;
