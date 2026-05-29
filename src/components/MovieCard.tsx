import { Link } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Movie } from '../types';

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
    return (
        <Link href={`/movie/${movie.id}` as any} asChild>
            <TouchableOpacity className="flex-row bg-gray-900 rounded-xl overflow-hidden mb-4 border border-gray-800">
                <Image
                    source={{ uri: movie.posterUrl }}
                    className="w-32 h-48"
                    resizeMode="cover"
                />
                <View className="flex-1 p-4 justify-between">
                    <View>
                        <Text className="text-white text-xl font-bold mb-1">{movie.title}</Text>
                        <Text className="text-gray-400 text-sm mb-2">{movie.duration}</Text>
                        <View className="flex-row flex-wrap gap-1 mb-2">
                            {movie.genre.map((g) => (
                                <View key={g} className="bg-gray-800 px-2 py-1 rounded-md">
                                    <Text className="text-gray-300 text-xs">{g}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-yellow-500 font-bold mr-1">★</Text>
                        <Text className="text-white">{movie.rating.toFixed(1)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}
