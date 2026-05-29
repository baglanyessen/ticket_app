import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { loginUser } from '../src/api/client';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please enter username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await loginUser(username, password);
            await login(data.user, data.token);
            router.replace('/(tabs)' as any);
        } catch (e: any) {
            setError(e.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-950 justify-center px-6">
            <View className="mb-10 items-center">
                <View className="w-20 h-20 bg-yellow-500 rounded-full justify-center items-center mb-4">
                    <Text className="text-gray-950 text-4xl font-bold">C</Text>
                </View>
                <Text className="text-white text-3xl font-bold">Welcome Back</Text>
                <Text className="text-gray-400 mt-2 text-center">Log in to book your favorite movies</Text>
            </View>

            {error ? (
                <View className="bg-red-500/20 p-3 rounded-lg mb-6 border border-red-500/50">
                    <Text className="text-red-400 text-center">{error}</Text>
                </View>
            ) : null}

            <View className="space-y-4 mb-6">
                <View>
                    <Text className="text-gray-400 text-sm mb-2 ml-1">Username</Text>
                    <TextInput
                        className="bg-gray-900 border border-gray-800 text-white px-4 py-4 rounded-xl"
                        placeholder="Enter your username"
                        placeholderTextColor="#6b7280"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>

                <View>
                    <Text className="text-gray-400 text-sm mb-2 ml-1">Password</Text>
                    <TextInput
                        className="bg-gray-900 border border-gray-800 text-white px-4 py-4 rounded-xl"
                        placeholder="Enter your password"
                        placeholderTextColor="#6b7280"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
            </View>

            <TouchableOpacity 
                className={`bg-yellow-500 py-4 rounded-xl items-center mb-6 shadow-lg shadow-yellow-500/20 ${loading ? 'opacity-70' : ''}`}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text className="text-gray-950 font-bold text-lg">Log In</Text>
                )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4">
                <Text className="text-gray-400">Don't have an account? </Text>
                <Link href={'/register' as any} asChild>
                    <TouchableOpacity>
                        <Text className="text-yellow-500 font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}
