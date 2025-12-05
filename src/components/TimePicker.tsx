import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

type TimePickerListProps = {
  times: Date[]; // array of times
  onChange: (idx: number, newTime: Date) => void; // when a time is updated
  onRemove?: (idx: number) => void; // optional removal callback
};

const TimePickerList: React.FC<TimePickerListProps> = ({ times, onChange, onRemove }) => {
  const [showIndex, setShowIndex] = useState<number | null>(null);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (showIndex === null) return;

    if (Platform.OS === "android") setShowIndex(null);

    if (selected) {
      const newTime = new Date(times[showIndex]);
      newTime.setHours(selected.getHours(), selected.getMinutes());
      onChange(showIndex, newTime);
    }
  };

  return (
    <View>
      {times.map((time, idx) => (
        <View key={idx} style={styles.row}>
          <TouchableOpacity style={styles.timeButton} onPress={() => setShowIndex(idx)}>
            <Text style={styles.timeText}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </TouchableOpacity>

          {onRemove && (
            <TouchableOpacity onPress={() => onRemove(idx)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={20} color="#FF4500" />
            </TouchableOpacity>
          )}

          {showIndex === idx && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              is24Hour={false}
              onChange={handleChange}
            />
          )}
        </View>
      ))}

      {/* iOS overlay to dismiss picker */}
      {Platform.OS === "ios" && showIndex !== null && (
        <TouchableOpacity style={styles.overlay} onPress={() => setShowIndex(null)} />
      )}
    </View>
  );
};

export default TimePickerList;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  timeButton: {
    padding: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  timeText: { fontSize: 16, color: "#333" },
  removeButton: { marginLeft: 10, padding: 5 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
});
