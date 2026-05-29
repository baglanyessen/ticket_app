import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { fetchBookings } from '../../src/api/client';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Booking {
    id: string;
    movieTitle: string;
    showtimeTime: string;
    seats: string[];
    totalPrice: number;
    createdAt: string;
}

export default function ProfileScreen() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await fetchBookings();
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadBookings();
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as any);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-950 justify-center items-center">
                <ActivityIndicator size="large" color="#eab308" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-950">
            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="bg-gray-900 mx-4 my-2 p-4 rounded-2xl border border-gray-800">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-yellow-500 font-bold text-xs">
                                #{item.id.slice(-6).toUpperCase()}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text className="text-white text-xl font-bold mb-2">
                            {item.movieTitle}
                        </Text>
                        <View className="flex-row justify-between items-end">
                            <View>
                                <Text className="text-gray-400 text-xs mb-1">Seats: {item.seats.join(', ')}</Text>
                                <Text className="text-gray-400 text-xs">Time: {item.showtimeTime}</Text>
                            </View>
                            <Text className="text-white font-bold text-lg">
                                ${item.totalPrice.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#eab308" />
                }
                ListHeaderComponent={
                    <View className="p-4 pt-10">
                        <View className="items-center mb-8 bg-gray-900 p-6 rounded-3xl border border-gray-800">
                            <View className="w-20 h-20 bg-yellow-500 rounded-full justify-center items-center mb-4">
                                <Text className="text-gray-950 text-4xl font-bold">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <Text className="text-white text-2xl font-bold mb-1">{user?.username}</Text>
                            <Text className="text-gray-400 mb-6">CineStar Member</Text>
                            
                            <TouchableOpacity 
                                className="flex-row items-center bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20"
                                onPress={handleLogout}
                            >
                                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                                <Text className="text-red-400 font-bold ml-2">Log Out</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-white text-2xl font-bold mb-4 px-2">My Tickets</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View className="py-10 items-center">
                        <Text className="text-gray-500">You haven't booked any tickets yet.</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </View>
    );
}
