const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'tiket_app',
  password: process.env.PG_PASSWORD || 'postgres',
  port: process.env.PG_PORT || 5432,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function initDB() {
    console.log("Initializing database schema...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Movies Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS movies (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                "posterUrl" TEXT,
                rating REAL,
                duration VARCHAR(50),
                description TEXT
            )
        `);

        // Genres Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS movie_genres (
                "movieId" VARCHAR(255),
                genre VARCHAR(255),
                FOREIGN KEY ("movieId") REFERENCES movies(id) ON DELETE CASCADE
            )
        `);

        // Showtimes Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS showtimes (
                id VARCHAR(255) PRIMARY KEY,
                "movieId" VARCHAR(255),
                time VARCHAR(50),
                FOREIGN KEY ("movieId") REFERENCES movies(id) ON DELETE CASCADE
            )
        `);

        // Seats Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS seats (
                id VARCHAR(255) PRIMARY KEY,
                "showtimeId" VARCHAR(255),
                "seatId" VARCHAR(50),
                row VARCHAR(10),
                col INTEGER,
                status VARCHAR(50),
                FOREIGN KEY ("showtimeId") REFERENCES showtimes(id) ON DELETE CASCADE
            )
        `);

        // Bookings Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(255) PRIMARY KEY,
                "userId" INTEGER,
                "showtimeId" VARCHAR(255),
                seats TEXT,
                "totalPrice" REAL,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY ("showtimeId") REFERENCES showtimes(id) ON DELETE CASCADE
            )
        `);

        // Seed data if empty
        const res = await client.query('SELECT COUNT(*) FROM movies');
        if (parseInt(res.rows[0].count) === 0) {
            console.log('Seeding initial mock data...');
            await seedDatabase(client);
        }

        await client.query('COMMIT');
        console.log('Database initialization complete.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Failed to initialize database', e);
        throw e;
    } finally {
        client.release();
    }
}

async function seedDatabase(client) {
    const movies = [
        {
            id: '1',
            title: 'Dune: Part Two',
            posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjc99w.jpg',
            rating: 8.8,
            duration: '2h 46m',
            description: 'Paul Atreides unites with Chani and the Fremen...',
            genre: ['Sci-Fi', 'Adventure'],
            showtimes: [{ id: 'st1', time: '10:00 AM' }, { id: 'st2', time: '1:30 PM' }]
        },
        {
            id: '2',
            title: 'Kung Fu Panda 4',
            posterUrl: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
            rating: 7.2,
            duration: '1h 34m',
            description: 'Po is gearing up to become the spiritual leader...',
            genre: ['Animation', 'Action', 'Comedy'],
            showtimes: [{ id: 'st5', time: '11:00 AM' }, { id: 'st6', time: '2:15 PM' }]
        }
    ];

    for (const movie of movies) {
        await client.query('INSERT INTO movies (id, title, "posterUrl", rating, duration, description) VALUES ($1, $2, $3, $4, $5, $6)', [movie.id, movie.title, movie.posterUrl, movie.rating, movie.duration, movie.description]);

        for (const genre of movie.genre) {
            await client.query('INSERT INTO movie_genres ("movieId", genre) VALUES ($1, $2)', [movie.id, genre]);
        }

        for (const st of movie.showtimes) {
            await client.query('INSERT INTO showtimes (id, "movieId", time) VALUES ($1, $2, $3)', [st.id, movie.id, st.time]);

            const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
            const cols = 8;
            for (const r of rows) {
                for (let c = 1; c <= cols; c++) {
                    const seatId = `${r}${c}`;
                    const id = `${st.id}_${seatId}`;
                    const status = Math.random() < 0.3 ? 'booked' : 'available';
                    await client.query('INSERT INTO seats (id, "showtimeId", "seatId", row, col, status) VALUES ($1, $2, $3, $4, $5, $6)', [id, st.id, seatId, r, c, status]);
                }
            }
        }
    }
}

initDB().catch(console.error);

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
