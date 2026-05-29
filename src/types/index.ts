export interface ShowTime {
    id: string;
    time: string;
}

export interface Movie {
    id: string;
    title: string;
    posterUrl: string;
    rating: number;
    duration: string;
    description: string;
    genre: string[];
    showtimes: ShowTime[];
}

export interface Seat {
    id: string;
    row: string;
    col: number;
    status: 'available' | 'booked' | 'selected';
}
