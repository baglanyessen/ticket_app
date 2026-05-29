import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { fetchMovieDetails, fetchSeats } from '../../src/api/client';
import { Movie, Seat } from '../../src/types';

export default function SeatSelection() {
    const { id, time, showtimeId } = useLocalSearchParams();
    const router = useRouter();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && showtimeId) {
            loadData();
        }
    }, [id, showtimeId]);

    const loadData = async () => {
        try {
            const [movieData, seatsData] = await Promise.all([
                fetchMovieDetails(id as string),
                fetchSeats(showtimeId as string)
            ]);
            setMovie(movieData);
            setSeats(seatsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-950 p-4 justify-center items-center">
                <ActivityIndicator size="large" color="#eab308" />
            </View>
        );
    }

    if (!movie) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-950">
                <Text className="text-white">Movie not found</Text>
            </View>
        );
    }

    const handleSeatPress = (seatId: string, status: string) => {
        if (status === 'booked') return;

        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(s => s !== seatId);
            } else {
                return [...prev, seatId];
            }
        });
    };

    const getSeatColor = (status: string, isSelected: boolean) => {
        if (isSelected) return 'bg-yellow-500 border-yellow-500';
        if (status === 'booked') return 'bg-gray-700 border-gray-700';
        return 'bg-transparent border-gray-500';
    };

    return (
        <View className="flex-1 bg-gray-950">
            <ScrollView className="flex-1 p-4" contentContainerStyle={{ alignItems: 'center' }}>
                <Text className="text-xl font-bold text-white mb-1">{movie.title}</Text>
                <Text className="text-gray-400 mb-8">{time}</Text>

                {/* Screen layout arc */}
                <View className="w-full h-8 border-t-4 border-gray-600 rounded-t-full mb-8 relative justify-center items-center opacity-50">
                    <Text className="text-gray-500 text-xs mt-2">SCREEN</Text>
                </View>

                {/* Seats Grid with Row Labels */}
                <View className="flex-row mb-8">
                    {/* Row Labels Column */}
                    <View className="justify-center gap-2 mr-4 pt-1">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(row => (
                            <View key={row} className="h-8 justify-center">
                                <Text className="text-gray-500 font-bold text-xs">{row}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Seats Container */}
                    <View className="flex-row flex-wrap justify-center max-w-[320px] gap-2">
                        {seats.map((seat) => {
                            const isSelected = selectedSeats.includes(seat.id);
                            return (
                                <TouchableOpacity
                                    key={seat.id}
                                    onPress={() => handleSeatPress(seat.id, seat.status)}
                                    activeOpacity={seat.status === 'booked' ? 1 : 0.7}
                                    className={`w-8 h-8 rounded-t-lg rounded-b-sm border items-center justify-center ${getSeatColor(seat.status, isSelected)}`}
                                >
                                    <Text className={`text-[9px] ${isSelected ? 'text-gray-950 font-bold' : 'text-gray-400'}`}>
                                        {seat.id.split('_').pop()}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Legend */}
                <View className="flex-row gap-6 mb-8 w-full justify-center">
                    <View className="flex-row items-center gap-2">
                        <View className="w-4 h-4 rounded-md border border-gray-700" />
                        <Text className="text-gray-400 text-xs">Available</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View className="w-4 h-4 rounded-md bg-yellow-500" />
                        <Text className="text-gray-400 text-xs">Selected</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <View className="w-4 h-4 rounded-md bg-gray-800" />
                        <Text className="text-gray-400 text-xs">Booked</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            {selectedSeats.length > 0 && (
                <View className="p-6 bg-gray-900 border-t border-gray-800 flex-row justify-between items-center rounded-t-3xl">
                    <View>
                        <Text className="text-gray-400 text-xs mb-1">
                            {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'} selected
                        </Text>
                        <Text className="text-2xl font-bold text-white">
                            ${(selectedSeats.length * 12.5).toFixed(2)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="bg-yellow-500 px-8 py-4 rounded-2xl shadow-lg shadow-yellow-500/20"
                        onPress={() => {
                            router.push({
                                pathname: '/summary',
                                params: {
                                    movieId: movie.id,
                                    time: time,
                                    showtimeId: showtimeId,
                                    seats: JSON.stringify(selectedSeats),
                                    totalPrice: selectedSeats.length * 12.5
                                }
                            } as any);
                        }}
                    >
                        <Text className="text-gray-950 font-bold text-lg">Continue</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
}
