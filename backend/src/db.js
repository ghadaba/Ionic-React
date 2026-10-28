import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "film-match.db"));
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    photo TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    overview TEXT,
    year INTEGER,
    poster TEXT,
    genres TEXT NOT NULL DEFAULT '[]',
    actors TEXT NOT NULL DEFAULT '[]',
    added_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (movie_id) REFERENCES movies(id)
  );
`);

function parseList(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    age: row.age,
    photo: row.photo,
    role: row.role,
    active: Boolean(row.active),
    createdAt: row.created_at,
  };
}

export function toPublicMovie(row) {
  if (!row) return null;
  return {
    id: row.id,
    tmdbId: row.tmdb_id,
    title: row.title,
    overview: row.overview,
    year: row.year,
    poster: row.poster,
    genres: parseList(row.genres),
    actors: parseList(row.actors),
  };
}

const SEED_MOVIES = [
  {
    tmdb_id: 27205,
    title: "Inception",
    year: 2010,
    overview: "Un voleur s'infiltre dans les rêves pour voler des secrets.",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    genres: ["Action", "Science-Fiction", "Aventure"],
    actors: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
  },
  {
    tmdb_id: 157336,
    title: "Interstellar",
    year: 2014,
    overview: "Des explorateurs voyagent à travers un trou de ver pour sauver l'humanité.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genres: ["Aventure", "Drame", "Science-Fiction"],
    actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
  },
  {
    tmdb_id: 155,
    title: "The Dark Knight",
    year: 2008,
    overview: "Batman affronte le Joker qui plonge Gotham dans le chaos.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genres: ["Action", "Crime", "Drame"],
    actors: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
  },
  {
    tmdb_id: 254128,
    title: "Dunkirk",
    year: 2017,
    overview: "L'évacuation de Dunkerque vue par terre, mer et air.",
    poster: "https://image.tmdb.org/t/p/w500/ebSnODDg9lbsMIaWg2uAbjn7TO5.jpg",
    genres: ["Guerre", "Action", "Drame"],
    actors: ["Fionn Whitehead", "Tom Hardy", "Harry Styles"],
  },
  {
    tmdb_id: 577922,
    title: "Tenet",
    year: 2020,
    overview: "Un agent affronte une menace liée à l'inversion du temps.",
    poster: "https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
    genres: ["Action", "Science-Fiction", "Thriller"],
    actors: ["John David Washington", "Robert Pattinson", "Elizabeth Debicki"],
  },
  {
    tmdb_id: 872585,
    title: "Oppenheimer",
    year: 2023,
    overview: "L'histoire de J. Robert Oppenheimer et de la bombe atomique.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    genres: ["Drame", "Histoire"],
    actors: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
  },
  {
    tmdb_id: 77,
    title: "Memento",
    year: 2000,
    overview: "Un homme amnésique reconstitue le meurtre de sa femme à rebours.",
    poster: "https://image.tmdb.org/t/p/w500/fQMSaP88cf1nz4qwuNEEFtazuDM.jpg",
    genres: ["Mystère", "Thriller"],
    actors: ["Guy Pearce", "Carrie-Anne Moss", "Joe Pantoliano"],
  },
  {
    tmdb_id: 313369,
    title: "La La Land",
    year: 2016,
    overview: "Une actrice et un pianiste de jazz tombent amoureux à Los Angeles.",
    poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    genres: ["Comédie", "Drame", "Romance", "Musique"],
    actors: ["Ryan Gosling", "Emma Stone", "John Legend"],
  },
  {
    tmdb_id: 11036,
    title: "The Notebook",
    year: 2004,
    overview: "Une histoire d'amour racontée à une femme atteinte d'Alzheimer.",
    poster: "https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3f6B4Mhf.jpg",
    genres: ["Romance", "Drame"],
    actors: ["Ryan Gosling", "Rachel McAdams", "James Garner"],
  },
  {
    tmdb_id: 597,
    title: "Titanic",
    year: 1997,
    overview: "Jack et Rose se rencontrent à bord du Titanic.",
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    genres: ["Drame", "Romance"],
    actors: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane"],
  },
  {
    tmdb_id: 194,
    title: "Amélie",
    year: 2001,
    overview: "Amélie Poulain décide d'arranger la vie des gens autour d'elle.",
    poster: "https://image.tmdb.org/t/p/w500/nSxDz3ZkDFg0Wptir4Lh9w9pOy6.jpg",
    genres: ["Comédie", "Romance"],
    actors: ["Audrey Tautou", "Mathieu Kassovitz", "Rufus"],
  },
  {
    tmdb_id: 1934,
    title: "Pride & Prejudice",
    year: 2005,
    overview: "Elizabeth Bennet croise le chemin de Mr Darcy.",
    poster: "https://image.tmdb.org/t/p/w500/sGjIvtVvTlWnia2zfJfHz81pZ9Q.jpg",
    genres: ["Drame", "Romance"],
    actors: ["Keira Knightley", "Matthew Macfadyen", "Judi Dench"],
  },
  {
    tmdb_id: 680,
    title: "Pulp Fiction",
    year: 1994,
    overview: "Histoires croisées de criminels à Los Angeles.",
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    genres: ["Thriller", "Crime"],
    actors: ["John Travolta", "Samuel L. Jackson", "Uma Thurman"],
  },
  {
    tmdb_id: 278,
    title: "The Shawshank Redemption",
    year: 1994,
    overview: "Un banquier innocent survit et s'évade de Shawshank.",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    genres: ["Drame", "Crime"],
    actors: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
  },
  {
    tmdb_id: 13,
    title: "Forrest Gump",
    year: 1994,
    overview: "Forrest traverse l'histoire américaine avec son cœur simple.",
    poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    genres: ["Comédie", "Drame", "Romance"],
    actors: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
  },
];

export function seedIfNeeded() {
  const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  if (userCount > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, first_name, last_name, age, photo, role, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);
  const insertMovie = db.prepare(`
    INSERT INTO movies (tmdb_id, title, overview, year, poster, genres, actors)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertFav = db.prepare(
    "INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)"
  );

  insertUser.run(
    "admin@filmmatch.app",
    bcrypt.hashSync("Admin123!", 10),
    "Ada",
    "Admin",
    34,
    null,
    "admin"
  );
  const alice = Number(
    insertUser.run(
      "alice@filmmatch.app",
      bcrypt.hashSync("Alice123!", 10),
      "Alice",
      "Martin",
      27,
      null,
      "user"
    ).lastInsertRowid
  );
  const bob = Number(
    insertUser.run(
      "bob@filmmatch.app",
      bcrypt.hashSync("Bob123!", 10),
      "Bob",
      "Nguyen",
      29,
      null,
      "user"
    ).lastInsertRowid
  );
  const charlie = Number(
    insertUser.run(
      "charlie@filmmatch.app",
      bcrypt.hashSync("Charlie123!", 10),
      "Charlie",
      "Dupont",
      24,
      null,
      "user"
    ).lastInsertRowid
  );

  const ids = {};
  for (const movie of SEED_MOVIES) {
    const result = insertMovie.run(
      movie.tmdb_id,
      movie.title,
      movie.overview,
      movie.year,
      movie.poster,
      JSON.stringify(movie.genres),
      JSON.stringify(movie.actors)
    );
    ids[movie.title] = Number(result.lastInsertRowid);
  }

  for (const title of ["Inception", "Interstellar", "The Dark Knight", "Dunkirk", "Tenet"]) {
    insertFav.run(alice, ids[title]);
  }
  for (const title of ["Inception", "Interstellar", "The Dark Knight", "Dunkirk", "Oppenheimer"]) {
    insertFav.run(bob, ids[title]);
  }
  for (const title of ["La La Land", "The Notebook", "Titanic", "Amélie", "Pride & Prejudice"]) {
    insertFav.run(charlie, ids[title]);
  }
}
