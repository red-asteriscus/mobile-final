//src/components/TimePicker.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type TimePickerProps = {
  value: Date;                          // the selected time
  onChange: (date: Date) => void;       // callback when time changed
};

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const [show, setShow] = useState(false);

  const onTimeSelected = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") setShow(false);

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <TouchableOpacity
        style={{
          padding: 15,
          backgroundColor: "#eee",
          borderRadius: 8,
        }}
        onPress={() => setShow(true)}
      >
        <Text>{value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"})}</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={onTimeSelected}
        />
      )}
    </View>
  );
}
