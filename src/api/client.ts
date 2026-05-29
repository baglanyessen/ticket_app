import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://localhost:3001/api';

const getHeaders = async () => {
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    try {
        const authDataStr = await AsyncStorage.getItem('@auth_data');
        if (authDataStr) {
            const { token } = JSON.parse(authDataStr);
            if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Failed to get auth token', error);
    }
    return defaultHeaders;
};

export const registerUser = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to register');
    return data;
};

export const loginUser = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to login');
    return data;
};

export const fetchMovies = async () => {
    const response = await fetch(`${API_URL}/movies`);
    if (!response.ok) throw new Error('Failed to fetch movies');
    return response.json();
};

export const fetchMovieDetails = async (id: string) => {
    const response = await fetch(`${API_URL}/movies/${id}`);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return response.json();
};

export const fetchSeats = async (showtimeId: string) => {
    const response = await fetch(`${API_URL}/seats/${showtimeId}`);
    if (!response.ok) throw new Error('Failed to fetch seats');
    return response.json();
};

export const createBooking = async (showtimeId: string, seats: string[], totalPrice: number) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ showtimeId, seats, totalPrice })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create booking');
    return data;
};

export const fetchBookings = async () => {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/bookings`, { headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
    return data;
};
