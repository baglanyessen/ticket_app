import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Confirmation() {
    const { bookingId, movieTitle, time, seats, totalPrice } = useLocalSearchParams();
    const router = useRouter();

    const parsedSeats = seats ? JSON.parse(seats as string) : [];

    return (
        <View className="flex-1 bg-gray-950 justify-center items-center p-6">
            <View className="w-24 h-24 bg-yellow-500 rounded-full justify-center items-center mb-8 shadow-xl shadow-yellow-500/40">
                <Text className="text-gray-950 text-5xl font-bold">✓</Text>
            </View>

            <Text className="text-3xl font-bold text-white mb-2 text-center">Booking Success!</Text>
            <Text className="text-gray-400 text-center mb-8 px-6">
                Your payment was successful. Enjoy your movie!
            </Text>

            <View className="w-full bg-gray-900 rounded-3xl p-6 mb-12 border border-gray-800">
                <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-800">
                    <Text className="text-gray-400">Booking ID</Text>
                    <Text className="text-yellow-500 font-bold">#{bookingId?.toString().slice(-6).toUpperCase()}</Text>
                </View>
                <View className="mb-4">
                    <Text className="text-gray-400 text-xs mb-1">Movie</Text>
                    <Text className="text-white font-bold text-lg">{movieTitle}</Text>
                </View>
                <View className="flex-row justify-between mb-4">
                    <View>
                        <Text className="text-gray-400 text-xs mb-1">Showtime</Text>
                        <Text className="text-white font-medium">{time}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-gray-400 text-xs mb-1">Seats</Text>
                        <Text className="text-white font-medium">{parsedSeats.join(', ')}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-400">Total Paid</Text>
                    <Text className="text-white font-bold">${totalPrice}</Text>
                </View>
            </View>

            <TouchableOpacity
                className="bg-yellow-500 py-4 rounded-2xl w-full mb-4 shadow-lg shadow-yellow-500/20"
                onPress={() => router.replace('/(tabs)' as any)}
            >
                <Text className="text-gray-950 text-center font-bold text-lg">Return to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile' as any)}
            >
                <Text className="text-gray-400 text-center font-medium">View My Tickets</Text>
            </TouchableOpacity>
        </View>
    );
}

