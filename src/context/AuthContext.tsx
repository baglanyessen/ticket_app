import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    username: string;
}

interface AuthContextData {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (userData: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const authData = await AsyncStorage.getItem('@auth_data');
            if (authData) {
                const { user, token } = JSON.parse(authData);
                setUser(user);
                setToken(token);
            }
        } catch (error) {
            console.error('Failed to load auth data', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData: User, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        await AsyncStorage.setItem('@auth_data', JSON.stringify({ user: userData, token: authToken }));
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('@auth_data');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
