import AddCatch from '@/components/AddCatch';
import { API_BASE } from '@/constants/config';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';

interface Catch {
  id: number;
  species: string;
  image_url: string;
  date_caught: string;
  water_temp: number;
  air_temp: number;
  moon_phase: string;
  tide: string;
  size: string;
  bait_used: string;
}

export default function Catches() {
  const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkingProps }>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [catches, setCatches] = useState<Catch[]>([]);

  const renderDay = (day?: DateData) => {
    if (!day || typeof day.dateString !== 'string') {
      // Return an empty View for non-date cells (like leading/trailing blank days)
      return <View style={{ width: 32, height: 32 }} />;
    }

    const dateString = day.dateString;
    const isMarked = markedDates[dateString];
    const isSelected = selectedDate === dateString;

    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', height: 40 }}>
        <Text style={{ color: isSelected ? 'orange' : 'black' }}>{day.day}</Text>
        {isMarked ? <Text>🐟</Text> : null}
      </View>
    );
  };

  // Fetch all catches to mark dates
  const fetchAllCatches = async () => {
    const res = await fetch(`${API_BASE}/catches`);
    const data: Catch[] = await res.json();
    const marks: { [key: string]: MarkingProps } = {};
    data.forEach(c => {
      const date = c.date_caught.split('T')[0];
      marks[date] = { marked: true };
    });
    setMarkedDates(marks);
  };

  useEffect(() => {
    fetchAllCatches();
  }, []);

  const fetchCatchesByDate = (date: string) => {
    setSelectedDate(date);
    fetch(`${API_BASE}/catches/${date}`)
      .then(res => res.json())
      .then((data: Catch[]) => setCatches(data));
  };

  const renderHeader = () => (
    <View>
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: 'orange', ...markedDates[selectedDate] }
        }}
        onDayPress={(day: DateData) => fetchCatchesByDate(day.dateString)}
        dayComponent={({ date }) => date ? renderDay(date) : null}
      />
      <Text style={styles.header}>Catches on {selectedDate}</Text>
      <AddCatch
        onCatchAdded={() => {
          fetchAllCatches();                     // refresh calendar marks 🐟
          if (selectedDate) fetchCatchesByDate(selectedDate);  // refresh list if a date is selected
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={catches}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.catchItem}>
          <Text>{item.species} - {item.size} lbs</Text>
          <Text>{new Date(item.date_caught).toLocaleTimeString()}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No catches logged</Text>}
      ListHeaderComponent={renderHeader()} // <-- NEW LINE: moved Calendar & AddCatch here
      contentContainerStyle={{ paddingBottom: 20 }} // optional, adds spacing at bottom
    />
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
