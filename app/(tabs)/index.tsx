import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchMovies } from "../../src/api/client";
import MovieCard from "../../src/components/MovieCard";
import { Movie } from "../../src/types";

export default function Index() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredMovies(movies);
    } else {
      const lowerSearch = search.toLowerCase();
      setFilteredMovies(
        movies.filter(
          (m) =>
            m.title.toLowerCase().includes(lowerSearch) ||
            m.genre.some((g) => g.toLowerCase().includes(lowerSearch))
        )
      );
    }
  }, [search, movies]);

  const loadMovies = async () => {
    setError(false);
    setLoading(true);
    try {
      const data = await fetchMovies();
      setMovies(data);
      setFilteredMovies(data);
    } catch (err) {
      console.error(err);
      setError(true);
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

  if (error) {
    return (
      <View className="flex-1 bg-gray-950 p-4 justify-center items-center">
        <Text className="text-white text-lg mb-4">Failed to load movies</Text>
        <TouchableOpacity 
          className="bg-yellow-500 px-6 py-2 rounded-lg"
          onPress={loadMovies}
        >
          <Text className="text-gray-950 font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-950 pt-10">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-gray-400 text-sm uppercase tracking-widest mb-1">Welcome to</Text>
            <Text className="text-white text-3xl font-bold">CineStar <Text className="text-yellow-500">Max</Text></Text>
          </View>
        </View>

        <View className="flex-row items-center bg-gray-900 rounded-2xl border border-gray-800 px-4 mb-4">
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            placeholder="Search movies or genres..."
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-white px-3 py-4"
          />
        </View>
      </View>


      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MovieCard movie={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Text className="text-gray-500 text-lg">No movies found match your search.</Text>
          </View>
        }
      />
    </View>
  );
}

