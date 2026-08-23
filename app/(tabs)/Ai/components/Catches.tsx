import CatchDetails from '@/components/CatchDetails';
import { API_BASE } from '@/constants/config';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  location: string;
  bait_used: string;
}

interface DateStats {
  count: number;
  species: string[];
}

export default function Catches() {
  const [markedDates, setMarkedDates] = useState<{
    [key: string]: MarkingProps;
  }>({});

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [catches, setCatches] = useState<Catch[]>([]);
  const [allCatches, setAllCatches] = useState<Catch[]>([]);
  const [selectedCatchId, setSelectedCatchId] = useState<number | null>(null);

  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, '0')}-01`;
  });

  /*
   * ----------------------------------------
   * Fetch all catches
   * ----------------------------------------
   */

  const fetchAllCatches = async () => {
    try {
      const res = await fetch(`${API_BASE}/catches`);

      if (!res.ok) {
        throw new Error('Failed to fetch catches');
      }

      const data: Catch[] = await res.json();

      setAllCatches(data);

      const marks: { [key: string]: MarkingProps } = {};

      data.forEach((c) => {
        const date = c.date_caught.split('T')[0];

        marks[date] = {
          marked: true,
        };
      });

      setMarkedDates(marks);
    } catch (error) {
      console.error('Error fetching catches:', error);
    }
  };

  useEffect(() => {
    fetchAllCatches();
  }, []);

  /*
   * ----------------------------------------
   * Fetch catches for selected day
   * ----------------------------------------
   */

  const fetchCatchesByDate = async (dateString: string) => {
    try {
      const res = await fetch(`${API_BASE}/catches/date/${dateString}`);

      if (!res.ok) {
        throw new Error('Failed to fetch catches for date');
      }

      const data: Catch[] = await res.json();

      setCatches(data);

      return data;
    } catch (error) {
      console.error('Error fetching catches by date:', error);

      setCatches([]);

      return [];
    }
  };

  /*
   * ----------------------------------------
   * Current month catches
   * ----------------------------------------
   */

  const currentMonthCatches = useMemo(() => {
    return allCatches.filter((c) => {
      return c.date_caught.startsWith(currentMonth.slice(0, 7));
    });
  }, [allCatches, currentMonth]);

  /*
   * ----------------------------------------
   * Date statistics
   * ----------------------------------------
   */

  const dateStats = useMemo(() => {
    const stats: { [key: string]: DateStats } = {};

    currentMonthCatches.forEach((c) => {
      const date = c.date_caught.split('T')[0];

      if (!stats[date]) {
        stats[date] = {
          count: 0,
          species: [],
        };
      }

      stats[date].count += 1;

      if (!stats[date].species.includes(c.species)) {
        stats[date].species.push(c.species);
      }
    });

    return stats;
  }, [currentMonthCatches]);

  /*
   * ----------------------------------------
   * Calendar summary
   * ----------------------------------------
   */

  const daysWithCatches = Object.keys(dateStats).length;

  const totalMonthlyCatches = currentMonthCatches.length;

  const mostActiveDate = useMemo(() => {
    const entries = Object.entries(dateStats);

    if (entries.length === 0) {
      return null;
    }

    return entries.reduce((best, current) => {
      return current[1].count > best[1].count ? current : best;
    });
  }, [dateStats]);


  /*
   * ----------------------------------------
   * Handle day press
   * ----------------------------------------
   */

  const handleDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);

    const data = await fetchCatchesByDate(day.dateString);

    if (data && data.length > 0) {
      setSelectedCatchId(data[0].id);
    }
  };

  /*
   * ----------------------------------------
   * Custom calendar day
   * ----------------------------------------
   */

  const renderDay = (day?: DateData) => {
    if (!day || typeof day.dateString !== 'string') {
      return <View style={styles.emptyDay} />;
    }

    const dateString = day.dateString;
    const stats = dateStats[dateString];

    const isSelected = selectedDate === dateString;
    const isMarked = !!markedDates[dateString];

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleDayPress(day)}
        style={[
          styles.dayCell,
          isSelected && styles.selectedDayCell,
          isMarked && !isSelected && styles.catchDayCell,
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            isSelected && styles.selectedDayNumber,
          ]}
        >
          {day.day}
        </Text>

        {isMarked && (
          <View style={styles.catchIndicator}>
            <Text style={styles.fishIcon}>🐟</Text>
          </View>
        )}

        {stats && stats.count > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {stats.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /*
   * ----------------------------------------
   * Calendar header
   * ----------------------------------------
   */

  const renderCalendarHeader = (date: any) => {
    const parsedDate = new Date(date);

    const monthName = parsedDate.toLocaleString('default', {
      month: 'long',
    });

    const year = parsedDate.getFullYear();

    return (
      <View style={styles.monthHeader}>
        <Text style={styles.monthTitle}>
          {monthName} {year}
        </Text>
      </View>
    );
  };

  /*
   * ----------------------------------------
   * Monthly summary
   * ----------------------------------------
   */

  const renderSummary = () => {
    const mostActiveDateString = mostActiveDate?.[0];

    let mostActiveLabel = '--';
    let mostActiveCount = 0;

    if (mostActiveDateString && mostActiveDate) {
      const [, month, day] = mostActiveDateString.split('-');

      mostActiveLabel = `${new Date(
        2026,
        Number(month) - 1,
        Number(day)
      ).toLocaleString('default', {
        month: 'short',
      })} ${Number(day)}`;

      mostActiveCount = mostActiveDate[1].count;
    }

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            Days with catches
          </Text>
          <Text style={styles.summaryValue}>
            {daysWithCatches}
          </Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            Most active
          </Text>

          <Text style={styles.summaryHighlight}>
            {mostActiveLabel}
          </Text>

          {mostActiveCount > 0 && (
            <Text style={styles.summarySubtext}>
              {mostActiveCount}{' '}
              {mostActiveCount === 1 ? 'catch' : 'catches'}
            </Text>
          )}
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            Total catches
          </Text>

          <Text style={styles.summaryValue}>
            {totalMonthlyCatches}
          </Text>
        </View>
      </View>
    );
  };

  /*
   * ----------------------------------------
   * Calendar section
   * ----------------------------------------
   */

  const renderHeader = () => (
    <View style={styles.container}>
      <View style={styles.calendarCard}>
        <Calendar
          current={currentMonth}
          hideExtraDays={false}
          enableSwipeMonths
          onMonthChange={(month) => {
            setCurrentMonth(
              `${month.year}-${String(month.month).padStart(
                2,
                '0'
              )}-01`
            );

            setSelectedDate('');
            setCatches([]);
          }}
          onDayPress={handleDayPress}
          dayComponent={({ date }) =>
            date ? renderDay(date) : null
          }
          renderHeader={renderCalendarHeader}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',

            textSectionTitleColor: '#91a0ad',

            dayTextColor: '#eef6f8',
            textDisabledColor: '#3d4852',

            monthTextColor: '#eef6f8',

            arrowColor: '#12b8ff',

            selectedDayBackgroundColor: '#12b8ff',
            selectedDayTextColor: '#ffffff',

            todayTextColor: '#12b8ff',

            textDayFontSize: 16,
            textDayFontWeight: '500',

            textMonthFontSize: 20,
            textMonthFontWeight: '700',

            textDayHeaderFontSize: 14,
            textDayHeaderFontWeight: '500',
          }}
        />

        {renderSummary()}
      </View>

      {selectedDate !== '' && (
        <View style={styles.selectedDateHeader}>
          <Text style={styles.selectedDateTitle}>
            Catches on {selectedDate}
          </Text>

          {catches.length > 0 && (
            <Text style={styles.selectedDateCount}>
              {catches.length}{' '}
              {catches.length === 1 ? 'catch' : 'catches'}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  /*
   * ----------------------------------------
   * Render
   * ----------------------------------------
   */

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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setSelectedCatchId(item.id)
              }
            >
              <View style={styles.catchItem}>
                <View>
                  <Text style={styles.catchSpecies}>
                    {item.species}
                  </Text>

                  <Text style={styles.catchMeta}>
                    {item.weight} lbs
                  </Text>
                </View>

                <Text style={styles.catchTime}>
                  {new Date(
                    item.date_caught
                  ).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            selectedDate !== '' ? (
              <Text style={styles.emptyText}>
                No catches logged on this date
              </Text>
            ) : null
          }
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#02090f',
  },

  /*
   * Calendar
   */

  calendarCard: {
    backgroundColor: '#06131e',
    borderRadius: 28,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: '#0d6d96',
  },

  monthHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  monthTitle: {
    color: '#eef6f8c6',
    fontSize: 18,
    fontWeight: '600',
  },

  /*
   * Calendar days
   */

  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#12303f',
    backgroundColor: '#07151f',
  },

  catchDayCell: {
    borderColor: '#1e7291',
    backgroundColor: '#081a26',
  },

  selectedDayCell: {
    borderColor: '#12b8ff',
    backgroundColor: '#0b4d69',
  },

  dayNumber: {
    color: '#eef6f8d1',
    fontSize: 13,
    fontWeight: '500',
  },

  selectedDayNumber: {
    color: '#ffffff',
    fontWeight: '700',
  },

  emptyDay: {
    width: 40,
    height: 40,
  },

  catchIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  fishIcon: {
    fontSize: 17,
    lineHeight: 16,
  },

  countBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#12b8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },

  /*
   * Monthly summary
   */

  summaryCard: {
    marginHorizontal: 8,
    marginTop: 7,
    borderRadius: 20,
    backgroundColor: '#091c29',
    borderWidth: 1,
    borderColor: '#0d6d96',
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#28404d',
  },

  summaryValue: {
    color: '#eef6f8',
    fontSize: 20,
    fontWeight: '600',  
    marginRight: 40,
  },

  summaryHighlight: {
    color: '#12b8ff',
    fontSize: 15,
    fontWeight: '600',
  },

  summaryLabel: {
    color: '#8fa1ad',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },

  summarySubtext: {
    color: '#b7c5cc',
    fontSize: 9,
    marginTop: 2,
  },

  /*
   * Selected date
   */

  selectedDateHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedDateTitle: {
    color: '#eef6f8',
    fontSize: 18,
    fontWeight: '600',
  },

  selectedDateCount: {
    color: '#12b8ff',
    fontSize: 13,
    fontWeight: '600',
  },

  /*
   * Catch list
   */

  catchItem: {
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#06131e',
    borderWidth: 1,
    borderColor: '#12303f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  catchSpecies: {
    color: '#eef6f8',
    fontSize: 16,
    fontWeight: '600',
  },

  catchMeta: {
    color: '#7f929e',
    fontSize: 13,
    marginTop: 3,
  },

  catchTime: {
    color: '#12b8ff',
    fontSize: 13,
  },

  emptyText: {
    color: '#71808b',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },

  listContent: {
    backgroundColor: '#02090f',
    paddingBottom: 30,
  },
});