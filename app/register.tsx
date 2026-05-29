import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { registerUser } from '../src/api/client';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await registerUser(username, password);
            await login(data.user, data.token);
            router.replace('/(tabs)' as any);
        } catch (e: any) {
            setError(e.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-950 justify-center px-6">
            <View className="mb-10 items-center">
                <Text className="text-white text-3xl font-bold">Create Account</Text>
                <Text className="text-gray-400 mt-2 text-center">Sign up to get started</Text>
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
                        placeholder="Choose a username"
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
                        placeholder="Create a password"
                        placeholderTextColor="#6b7280"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <View>
                    <Text className="text-gray-400 text-sm mb-2 ml-1">Confirm Password</Text>
                    <TextInput
                        className="bg-gray-900 border border-gray-800 text-white px-4 py-4 rounded-xl"
                        placeholder="Confirm your password"
                        placeholderTextColor="#6b7280"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                </View>
            </View>

            <TouchableOpacity 
                className={`bg-yellow-500 py-4 rounded-xl items-center mb-6 shadow-lg shadow-yellow-500/20 ${loading ? 'opacity-70' : ''}`}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text className="text-gray-950 font-bold text-lg">Sign Up</Text>
                )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-4">
                <Text className="text-gray-400">Already have an account? </Text>
                <Link href={'/login' as any} asChild>
                    <TouchableOpacity>
                        <Text className="text-yellow-500 font-bold">Log In</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}
