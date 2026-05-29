import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { createBooking, fetchMovieDetails } from '../src/api/client';
import { Movie } from '../src/types';

export default function BookingSummary() {
    const { movieId, time, showtimeId, seats, totalPrice } = useLocalSearchParams();
    const router = useRouter();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        if (movieId) loadMovie();
    }, [movieId]);

    const loadMovie = async () => {
        try {
            const data = await fetchMovieDetails(movieId as string);
            setMovie(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    let parsedSeats: string[] = [];
    try {
        if (typeof seats === 'string') {
            parsedSeats = JSON.parse(seats);
        }
    } catch (e) {
        console.error(e);
    }

    const handleConfirmBooking = async () => {
        if (!movie) return;
        setBooking(true);
        try {
            const result = await createBooking(showtimeId as string, parsedSeats, Number(totalPrice));
            router.push({
                pathname: '/confirmation',
                params: {
                    bookingId: result.bookingId,
                    movieTitle: movie.title,
                    time: time,
                    seats: JSON.stringify(parsedSeats),
                    totalPrice: (Number(totalPrice) + 2.5).toFixed(2)
                }
            } as any);
        } catch (error) {
            console.error(error);
            alert("Failed to confirm booking.");
        } finally {
            setBooking(false);
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
                <Text className="text-white">Invalid booking details</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-950 p-4">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="bg-gray-900 rounded-2xl p-4 mb-6">
                    <View className="flex-row mb-4 border-b border-gray-800 pb-4">
                        <Image
                            source={{ uri: movie.posterUrl }}
                            className="w-20 h-28 rounded-lg mr-4"
                            resizeMode="cover"
                        />
                        <View className="flex-1 justify-center">
                            <Text className="text-white text-xl font-bold mb-1">{movie.title}</Text>
                            <Text className="text-gray-400 mb-1">{movie.duration}</Text>
                            <Text className="text-yellow-500 font-semibold">{time}</Text>
                        </View>
                    </View>

                    <View className="mb-4 space-y-2">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Date</Text>
                            <Text className="text-white font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Tickets ({parsedSeats.length})</Text>
                            <Text className="text-white font-medium">{parsedSeats.join(', ')}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-400">Cinema</Text>
                            <Text className="text-white font-medium">CineStar Max - Hall A</Text>
                        </View>
                    </View>
                </View>

                <View className="bg-gray-900 rounded-2xl p-6 mb-6">
                    <Text className="text-white text-lg font-bold mb-4">Price Detail</Text>
                    <View className="flex-row justify-between mb-3">
                        <Text className="text-gray-400">Tickets ($12.50 x {parsedSeats.length})</Text>
                        <Text className="text-white">${Number(totalPrice).toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-400">Convenience Fee</Text>
                        <Text className="text-white">$2.50</Text>
                    </View>
                    <View className="border-t border-gray-800 pt-4 flex-row justify-between">
                        <Text className="text-white font-bold text-lg">Total Amount</Text>
                        <Text className="text-yellow-500 font-bold text-xl">${(Number(totalPrice) + 2.5).toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>


            <TouchableOpacity
                className={`bg-yellow-500 p-4 rounded-xl flex-row justify-center items-center shadow-lg mb-4 ${booking ? 'opacity-50' : ''}`}
                onPress={handleConfirmBooking}
                disabled={booking}
            >
                {booking ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text className="text-gray-950 font-bold text-lg">Confirm Booking</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
