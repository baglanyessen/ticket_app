const express = require('express');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// Middleware for JWT auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

/* Auth Endpoints */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if(!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username', [username, hashedPassword]);
        const token = jwt.sign({ id: newUser.rows[0].id, username: newUser.rows[0].username }, JWT_SECRET);

        res.status(201).json({ user: newUser.rows[0], token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ user: { id: user.id, username: user.username }, token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/* Existing Endpoints (Refactored to pg) */
app.get('/api/movies', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM movies');
        const movies = result.rows;
        
        for (const movie of movies) {
            const genresRes = await db.query('SELECT genre FROM movie_genres WHERE "movieId" = $1', [movie.id]);
            movie.genre = genresRes.rows.map(g => g.genre);

            const showtimeRes = await db.query('SELECT id, time FROM showtimes WHERE "movieId" = $1', [movie.id]);
            movie.showtimes = showtimeRes.rows;
        }

        res.json(movies);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Movie not found' });
        
        const movie = result.rows[0];
        const genresRes = await db.query('SELECT genre FROM movie_genres WHERE "movieId" = $1', [movie.id]);
        movie.genre = genresRes.rows.map(g => g.genre);

        const showtimeRes = await db.query('SELECT id, time FROM showtimes WHERE "movieId" = $1', [movie.id]);
        movie.showtimes = showtimeRes.rows;

        res.json(movie);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/seats/:showtimeId', async (req, res) => {
    try {
        const result = await db.query('SELECT "seatId" as id, row, col, status FROM seats WHERE "showtimeId" = $1', [req.params.showtimeId]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Bookings Endpoints require auth
app.post('/api/bookings', authenticateToken, async (req, res) => {
    const { showtimeId, seats, totalPrice } = req.body;
    const userId = req.user.id;

    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ error: 'Invalid booking data' });
    }

    const bookingId = Date.now().toString();
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        
        await client.query('INSERT INTO bookings (id, "userId", "showtimeId", seats, "totalPrice") VALUES ($1, $2, $3, $4, $5)', 
            [bookingId, userId, showtimeId, JSON.stringify(seats), totalPrice]);

        for (const seatId of seats) {
            await client.query('UPDATE seats SET status = $1 WHERE "showtimeId" = $2 AND "seatId" = $3', ['booked', showtimeId, seatId]);
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, bookingId });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Failed to create booking' });
    } finally {
        client.release();
    }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT b.*, m.title as "movieTitle", s.time as "showtimeTime"
            FROM bookings b
            JOIN showtimes s ON b."showtimeId" = s.id
            JOIN movies m ON s."movieId" = m.id
            WHERE b."userId" = $1
            ORDER BY b."createdAt" DESC
        `;
        const result = await db.query(query, [req.user.id]);
        
        const parsedBookings = result.rows.map(b => ({
            ...b,
            seats: JSON.parse(b.seats),
            movieTitle: b.movieTitle,
            showtimeTime: b.showtimeTime
        }));
        
        res.json(parsedBookings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT b.*, m.title as "movieTitle", s.time as "showtimeTime", m."posterUrl"
            FROM bookings b
            JOIN showtimes s ON b."showtimeId" = s.id
            JOIN movies m ON s."movieId" = m.id
            WHERE b.id = $1 AND b."userId" = $2
        `;
        const result = await db.query(query, [req.params.id, req.user.id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
        
        const booking = result.rows[0];
        booking.seats = JSON.parse(booking.seats);
        res.json(booking);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
