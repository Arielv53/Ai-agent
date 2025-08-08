import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';

interface Catch {
  id: number;
  species: string;
  weight: number;
  timestamp: string;
}

export default function CatchesScreen() {
  const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkingProps }>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [catches, setCatches] = useState<Catch[]>([]);

  const API_BASE = 'http://192.168.1.23:5000'; // your Flask server

  // Fetch all catches to mark dates
  useEffect(() => {
    fetch(`${API_BASE}/catches`)
      .then(res => res.json())
      .then((data: Catch[]) => {
        const marks: { [key: string]: MarkingProps } = {};
        data.forEach(c => {
          const date = c.timestamp.split('T')[0];
          marks[date] = { marked: true, dotColor: 'blue' };
        });
        setMarkedDates(marks);
      });
  }, []);

  const fetchCatchesByDate = (date: string) => {
    setSelectedDate(date);
    fetch(`${API_BASE}/catches/${date}`)
      .then(res => res.json())
      .then((data: Catch[]) => setCatches(data));
  };

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: 'orange', ...markedDates[selectedDate] }
        }}
        onDayPress={(day: DateData) => fetchCatchesByDate(day.dateString)}
      />

      <Text style={styles.header}>Catches on {selectedDate}</Text>
      <FlatList
        data={catches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.catchItem}>
            <Text>{item.species} - {item.weight} lbs</Text>
            <Text>{new Date(item.timestamp).toLocaleTimeString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No catches logged</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold'
  },
  catchItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  }
});
