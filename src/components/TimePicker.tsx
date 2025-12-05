// src/components/TimePicker.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

type TimePickerListProps = {
  times: Date[];
  onChange: (idx: number, newTime: Date) => void;
  onRemove?: (idx: number) => void;
  openIndex?: number; // index to open immediately
};

const TimePickerList: React.FC<TimePickerListProps> = ({ times, onChange, onRemove, openIndex }) => {
  const [showIndex, setShowIndex] = useState<number | null>(openIndex ?? null);

  useEffect(() => {
    if (openIndex !== undefined) setShowIndex(openIndex);
  }, [openIndex]);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (showIndex === null) return;

    if (event.type === "dismissed") {
      setShowIndex(null);
      return;
    }

    if (selectedDate) {
      const newTime = new Date(times[showIndex]);
      newTime.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      onChange(showIndex, newTime);
    }

    if (Platform.OS === "android") setShowIndex(null); // auto-hide picker on Android
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
