import { useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { typography } from "../../constants/typography";
import { showError, showSuccess } from "../../utils/helperFunctions";
import { useDispatch } from "react-redux";
import { getPhotographerTimeSlots, managePhotographerTimeSlots } from "../../features/photographers/photographersSlice";
import { getUserData } from "../../lib/http";
import TimeSlotSkeleton from "../skeletonLoaders/Photographer/TimeSlotSkeleton";

export const SlotsManagementComponent = () => {
    const dispatch = useDispatch();
    const [showPicker, setShowPicker] = useState(false);
    const [pickerType, setPickerType] = useState<"open" | "close" | null>(null);
    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // pull to refresh
    const [refreshing, setRefreshing] = useState(false);

    const [days, setDays] = useState([
        { id: 1, name: "Monday", selected: true, openTime: null, closeTime: null },
        { id: 2, name: "Tuesday", selected: true, openTime: null, closeTime: null },
        { id: 3, name: "Wednesday", selected: true, openTime: null, closeTime: null },
        { id: 4, name: "Thursday", selected: true, openTime: null, closeTime: null },
        { id: 5, name: "Friday", selected: true, openTime: null, closeTime: null },
        { id: 6, name: "Saturday", selected: true, openTime: null, closeTime: null },
        { id: 7, name: "Sunday", selected: true, openTime: null, closeTime: null },
    ]);

    useEffect(() => {
        getTimeSlots();
    }, []);

    const getTimeSlots = async () => {
        setIsLoading(true);

        const backendToUI = {
            0: 7, // Sunday
            1: 1, // Monday
            2: 2, // Tuesday
            3: 3, // Wednesday
            4: 4, // Thursday
            5: 5, // Friday
            6: 6, // Saturday
        };

        await dispatch(getPhotographerTimeSlots())
            .unwrap()
            .then((res) => {
                if (!res?.availability) return;

                setDays((prevDays) =>
                    prevDays.map((day) => {
                        const match = res.availability.find(
                            (a) => backendToUI[a.day_of_week] === day.id
                        );

                        if (match) {
                            return {
                                ...day,
                                selected: match.is_available,
                                openTime: match.start_time?.substring(0, 5) || null,
                                closeTime: match.end_time?.substring(0, 5) || null,
                            };
                        }

                        return day;
                    })
                );

                setIsLoading(false);
                setRefreshing(false);
            })
            .catch((err) => {
                setIsLoading(false);
                setRefreshing(false);
                showError('Failed to load availability time slots!...');
                console.error("Failed to load availability", err);
            });
    };


    const onRefresh = async () => {
        setRefreshing(true);
        await getTimeSlots();
    }

    const formatTime = (value: any, fallback: any) => {
        if (!value) return fallback;

        // If Date object
        if (value instanceof Date) {
            return value.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        }

        // If string "09:00"
        if (typeof value === "string") return value;

        return fallback;
    };


    const updatePhotographerTimeSlots = async () => {
        setIsLoading(true);
        const payload = { availability_slots: buildOperatingHoursPayload(days) };

        try {
            const response = await dispatch(managePhotographerTimeSlots(payload)).unwrap();
            showSuccess('Availability time slots updated successfully!...');
            setIsLoading(false);
            getTimeSlots();

        } catch (error: any) {
            setIsLoading(false);
            showError('Something went wrong while updating availability!...');
            console.error('❌ Error updating photographer availability:', error);
        }

    };

    const buildOperatingHoursPayload = (days: any[]) => {
        return days.map((day) => {
            const format = (value: any, fallback: any) => {
                if (!value) return fallback;

                if (value instanceof Date) {
                    return value.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    });
                }

                return value; // already a string like "09:00"
            };

            const dayOfWeekMap = {
                Sunday: 0,
                Monday: 1,
                Tuesday: 2,
                Wednesday: 3,
                Thursday: 4,
                Friday: 5,
                Saturday: 6,
            };

            return {
                day_of_week: dayOfWeekMap[day.name],
                start_time: format(day.openTime, "09:00"),
                end_time: format(day.closeTime, "21:00"),
                is_available: day.selected,
            };
        });
    };


    const toggleDay = (id: number) => {
        setDays((prev) =>
            prev.map((day) =>
                day.id === id ? { ...day, selected: !day.selected } : day
            )
        );
    };

    const onTimeChange = (event: any, selectedTime: Date | undefined) => {
        if (event.type === "dismissed") {
            setShowPicker(false);
            return;
        }

        if (selectedTime && selectedDayId !== null && pickerType) {
            // Round to full hour
            const rounded = new Date(selectedTime);
            rounded.setMinutes(0, 0, 0);

            // Clamp between 09:00 and 21:00
            const hour = rounded.getHours();
            if (hour < 9) rounded.setHours(9);
            if (hour > 21) rounded.setHours(21);

            // Update the correct day & time
            setDays((prevDays) =>
                prevDays.map((day) => {
                    if (day.id === selectedDayId) {
                        return {
                            ...day,
                            [pickerType === "open" ? "openTime" : "closeTime"]: rounded,
                        };
                    }
                    return day;
                })
            );

            setShowPicker(false);
        }
    };

    // 🕘 open picker
    const handleOpenTimePress = (dayId: number) => {
        setSelectedDayId(dayId);
        setPickerType("open");
        setShowPicker(true);
    };

    // 🕕 close picker
    const handleCloseTimePress = (dayId: number) => {
        setSelectedDayId(dayId);
        setPickerType("close");
        setShowPicker(true);
    };

    // ✅ Render each day
    const renderDayList = ({ item }: any) => {
        return (
            <View style={styles.dayOuterContainer}>
                <View key={item.id} style={styles.dayContainer}>
                    {/* Day Row with Checkbox */}
                    <TouchableOpacity
                        style={styles.dayHeader}
                        activeOpacity={0.8}
                        onPress={() => toggleDay(item.id)}
                    >
                        <Icon
                            name={item.selected ? "check-box" : "check-box-outline-blank"}
                            size={24}
                            color={item.selected ? "#1B4332" : "#444"}
                        />
                        <Text style={styles.DayText}>{item.name}</Text>
                    </TouchableOpacity>

                    {/* Time Picker Row (Visible only if selected) */}
                    {item.selected && (
                        <View style={styles.timeRow}>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => handleOpenTimePress(item.id)}
                            >
                                <Text style={styles.timeLabel}>Open Time</Text>
                                <Text style={styles.timeValue}>
                                    {formatTime(item.openTime, "09:00")}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => handleCloseTimePress(item.id)}
                            >
                                <Text style={styles.timeLabel}>Close Time</Text>
                                <Text style={styles.timeValue}>
                                    {formatTime(item.closeTime, "21:00")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#034833"]}      // Android
                />}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Time Slot Management</Text>
                <Text style={styles.labelText}>Operating Hours Only (9:00 to 21:00)</Text>

                {isLoading ? <TimeSlotSkeleton /> :
                    <FlatList
                        data={days}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderDayList}
                    />}

                <TouchableOpacity style={styles.saveButton} onPress={updatePhotographerTimeSlots}>
                    <Text style={styles.saveButtonText}>Update time slots</Text>
                </TouchableOpacity>

            </View>
            {/* ✅ Show native time picker */}
            {showPicker && (
                <DateTimePicker
                    mode="time"
                    value={new Date("1970-01-01T09:00:00")}
                    is24Hour={true}
                    display="default"
                    onChange={onTimeChange}
                />
            )}
        </ScrollView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginBottom: 180
    },
    title: {
        color: '#101010',
        fontSize: 16,
        marginVertical: 15,
        ...typography.bold,
    },
    labelText: {
        color: '#101010',
        fontSize: 16,
        marginBottom: 6,
        ...typography.semibold,
    },
    DayText: {
        fontSize: 16,
        marginRight: 25,
        marginLeft: 5,
        color: '#333', // Dark text color
        ...typography.medium
    },
    dayOuterContainer: {
        marginTop: 10,
    },
    dayContainer: {
        marginVertical: 12,
    },
    dayHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        paddingHorizontal: 10,
    },
    timeButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 10,
        marginHorizontal: 5,
        alignItems: "center",
    },
    timeLabel: {
        fontSize: 13,
        color: "#555",
        ...typography.semibold
    },
    timeValue: {
        fontSize: 15,
        color: "#1B4332",
        ...typography.bold
    },
    saveButton: {
        backgroundColor: "#034833",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    saveButtonText: {
        color: "#FFFFFF",
        ...typography.bold,
        fontSize: 16,
    },
})