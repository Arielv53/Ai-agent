import CatchDetails from '@/components/CatchDetails';
import { API_BASE } from '@/constants/config';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  length: number;
  weight: number;
  wind_speed: number;
  method: string;
  bait_used: string;
}

export default function Catches() {
  const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkingProps }>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [catches, setCatches] = useState<Catch[]>([]);
  const [selectedCatchId, setSelectedCatchId] = useState<number | null>(null);


  const renderDay = (day?: DateData) => {
  if (!day || typeof day.dateString !== 'string') {
    return <View style={{ width: 32, height: 32 }} />;
  }

  const dateString = day.dateString;
  const isMarked = markedDates[dateString];
  const isSelected = selectedDate === dateString;

  return (
    <TouchableOpacity
      onPress={async () => {
        setSelectedDate(dateString);
        const data = await fetchCatchesByDate(dateString);
        if (data && data.length > 0) {
          setSelectedCatchId(data[0].id);
        }
      }}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
      }}
    >
      <Text style={{ color: isSelected ? 'orange' : 'white' }}>{day.day}</Text>
      {isMarked ? <Text style={{ color: 'orange' }}>🐟</Text> : null}
    </TouchableOpacity>
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

  const fetchCatchesByDate = async (dateString: string) => {
    const res = await fetch(`${API_BASE}/catches/date/${dateString}`);
    const data: Catch[] = await res.json();
    setCatches(data);
    return data; 
  };


  const renderHeader = () => (
    <View style={{ backgroundColor: 'black', paddingBottom: 10 }}>
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            selectedColor: 'orange',
            ...markedDates[selectedDate],
          },
        }}
        onDayPress={async (day: DateData) => {
          setSelectedDate(day.dateString);

          // Fetch catches for this date
          const data = await fetchCatchesByDate(day.dateString);

          // If at least one catch exists, show its details
          if (data && data.length > 0) {
            setSelectedCatchId(data[0].id);
          }
        }}
        dayComponent={({ date }) => (date ? renderDay(date) : null)}
        theme={{
          backgroundColor: 'black',
          calendarBackground: 'black',
          textSectionTitleColor: 'white', // weekday labels (Mon, Tue, etc.)
          selectedDayBackgroundColor: 'orange',
          selectedDayTextColor: 'black',
          todayTextColor: 'orange',
          dayTextColor: 'white',
          textDisabledColor: '#555',
          monthTextColor: 'white',
          arrowColor: 'orange',
        }}
      />

      <Text style={styles.header}>Catches on {selectedDate}</Text>

      
    </View>
  );


  return (
  <>
    {selectedCatchId ? (
      <CatchDetails
        catchId={selectedCatchId}
        onClose={() => setSelectedCatchId(null)}
      />
    ) : (
      <FlatList
        data={catches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedCatchId(item.id)}>
            <View style={styles.catchItem}>
              <Text>{item.species} - {item.weight} lbs</Text>
              <Text>{new Date(item.date_caught).toLocaleTimeString()}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No catches logged
          </Text>
        }
        ListHeaderComponent={renderHeader()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    )}
  </>
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
