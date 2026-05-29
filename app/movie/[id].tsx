import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { fetchMovieDetails } from '../../src/api/client';
import { Movie } from '../../src/types';

export default function MovieDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadMovie();
        }
    }, [id]);

    const loadMovie = async () => {
        try {
            const data = await fetchMovieDetails(id as string);
            setMovie(data);
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

    return (
        <ScrollView className="flex-1 bg-gray-950">
            <Image
                source={{ uri: movie.posterUrl }}
                className="w-full h-80"
                resizeMode="cover"
            />

            <View className="p-4">
                <Text className="text-3xl font-bold text-white mb-2">{movie.title}</Text>

                <View className="flex-row items-center mb-4 gap-4">
                    <Text className="text-gray-400">{movie.duration}</Text>
                    <View className="flex-row items-center">
                        <Text className="text-yellow-500 font-bold mr-1">★</Text>
                        <Text className="text-white">{movie.rating.toFixed(1)}</Text>
                    </View>
                </View>

                <View className="flex-row flex-wrap gap-2 mb-6">
                    {movie.genre?.map((g) => (
                        <View key={g} className="bg-gray-800 px-3 py-1 rounded-full">
                            <Text className="text-gray-300">{g}</Text>
                        </View>
                    ))}
                </View>

                <Text className="text-xl font-bold text-white mb-2">Synopsis</Text>
                <Text className="text-gray-400 leading-6 mb-6">{movie.description}</Text>

                <Text className="text-xl font-bold text-white mb-4">Select Showtime</Text>
                {movie.showtimes && movie.showtimes.length > 0 ? (
                    <View className="flex-row flex-wrap gap-3 mb-6">
                        {movie.showtimes.map((st) => (
                            <TouchableOpacity
                                key={st.id}
                                className={`bg-gray-800 border rounded-lg px-4 py-3 ${router.canGoBack() ? 'min-w-[80px]' : ''} items-center border-gray-700`}
                                onPress={() => {
                                    router.push({
                                        pathname: `/seats/${movie.id}`,
                                        params: { time: st.time, showtimeId: st.id }
                                    } as any);
                                }}
                            >
                                <Text className="text-white font-semibold">{st.time}</Text>
                                <Text className="text-gray-500 text-[10px]">Hall A</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="bg-gray-900 p-8 rounded-xl items-center mb-6">
                        <Text className="text-gray-500">No showtimes available for this movie.</Text>
                    </View>
                )}

            </View>
        </ScrollView>
    );
}
