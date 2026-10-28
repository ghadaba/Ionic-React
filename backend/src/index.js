import "./env.js";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { db, seedIfNeeded, toPublicMovie, toPublicUser } from "./db.js";
import { adminRequired, authRequired, signToken } from "./auth.js";
import { fetchTmdbMovie, hasTmdbKey, searchTmdb } from "./tmdb.js";
import { MATCH_THRESHOLD, buildTasteProfile, matchScore } from "./matching.js";

seedIfNeeded();

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

function movieRowById(id) {
  return db.prepare("SELECT * FROM movies WHERE id = ?").get(id);
}

function userFavorites(userId) {
  return db
    .prepare(
      `SELECT m.* FROM movies m
       JOIN favorites f ON f.movie_id = m.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`
    )
    .all(userId)
    .map(toPublicMovie);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, tmdb: hasTmdbKey() });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, firstName, lastName, age, photo } = req.body || {};
  if (!email || !password || !firstName || !lastName || age === undefined) {
    return res.status(400).json({ error: "Nom, prénom, âge, email et mot de passe sont requis" });
  }
  if (!photo) {
    return res.status(400).json({ error: "Une photo prise avec la caméra est obligatoire" });
  }
  const numericAge = Number(age);
  if (!Number.isInteger(numericAge) || numericAge < 13 || numericAge > 120) {
    return res.status(400).json({ error: "Âge invalide" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO users (email, password_hash, first_name, last_name, age, photo, role, active)
         VALUES (?, ?, ?, ?, ?, ?, 'user', 1)`
      )
      .run(
        String(email).trim().toLowerCase(),
        bcrypt.hashSync(password, 10),
        String(firstName).trim(),
        String(lastName).trim(),
        numericAge,
        photo
      );
    const user = toPublicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(Number(result.lastInsertRowid)));
    return res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }
    return res.status(500).json({ error: "Inscription impossible" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }
  const row = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(String(email).trim().toLowerCase());
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: "Identifiants incorrects" });
  }
  if (!row.active) {
    return res.status(403).json({ error: "Compte désactivé. Contactez un administrateur." });
  }
  const user = toPublicUser(row);
  return res.json({ token: signToken(user), user });
});

app.get("/api/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/movies", authRequired, (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  let rows;
  if (q) {
    rows = db
      .prepare(
        `SELECT * FROM movies
         WHERE lower(title) LIKE ? OR lower(genres) LIKE ? OR lower(actors) LIKE ?
         ORDER BY year DESC, title ASC`
      )
      .all(`%${q}%`, `%${q}%`, `%${q}%`);
  } else {
    rows = db.prepare("SELECT * FROM movies ORDER BY year DESC, title ASC").all();
  }
  const favIds = new Set(
    db
      .prepare("SELECT movie_id FROM favorites WHERE user_id = ?")
      .all(req.user.id)
      .map((r) => r.movie_id)
  );
  res.json({
    movies: rows.map((row) => ({ ...toPublicMovie(row), favorite: favIds.has(row.id) })),
  });
});

app.get("/api/movies/:id", authRequired, (req, res) => {
  const row = movieRowById(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "Film introuvable" });
  const favorite = Boolean(
    db
      .prepare("SELECT 1 FROM favorites WHERE user_id = ? AND movie_id = ?")
      .get(req.user.id, row.id)
  );
  res.json({ movie: { ...toPublicMovie(row), favorite } });
});

app.post("/api/movies", authRequired, adminRequired, (req, res) => {
  const { title, overview, year, poster, genres, actors, tmdbId } = req.body || {};
  if (!title) return res.status(400).json({ error: "Le titre est requis" });
  const genreList = Array.isArray(genres)
    ? genres
    : String(genres || "")
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
  const actorList = Array.isArray(actors)
    ? actors
    : String(actors || "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
  try {
    const result = db
      .prepare(
        `INSERT INTO movies (tmdb_id, title, overview, year, poster, genres, actors, added_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        tmdbId || null,
        String(title).trim(),
        overview || "",
        year ? Number(year) : null,
        poster || null,
        JSON.stringify(genreList),
        JSON.stringify(actorList),
        req.user.id
      );
    res.status(201).json({ movie: toPublicMovie(movieRowById(Number(result.lastInsertRowid))) });
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Ce film TMDB est déjà dans la base" });
    }
    return res.status(500).json({ error: "Ajout impossible" });
  }
});

app.get("/api/admin/tmdb/search", authRequired, adminRequired, async (req, res) => {
  try {
    const results = await searchTmdb(String(req.query.q || ""));
    res.json({ results, tmdbEnabled: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, tmdbEnabled: hasTmdbKey() });
  }
});

app.post("/api/admin/movies/import", authRequired, adminRequired, async (req, res) => {
  try {
    const tmdbId = Number(req.body?.tmdbId);
    if (!tmdbId) return res.status(400).json({ error: "tmdbId requis" });
    const movie = await fetchTmdbMovie(tmdbId);
    const result = db
      .prepare(
        `INSERT INTO movies (tmdb_id, title, overview, year, poster, genres, actors, added_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        movie.tmdb_id,
        movie.title,
        movie.overview,
        movie.year,
        movie.poster,
        JSON.stringify(movie.genres),
        JSON.stringify(movie.actors),
        req.user.id
      );
    res.status(201).json({ movie: toPublicMovie(movieRowById(Number(result.lastInsertRowid))) });
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "Ce film est déjà dans la base" });
    }
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/favorites", authRequired, (req, res) => {
  res.json({ movies: userFavorites(req.user.id) });
});

app.post("/api/favorites/:movieId", authRequired, (req, res) => {
  const movieId = Number(req.params.movieId);
  if (!movieRowById(movieId)) return res.status(404).json({ error: "Film introuvable" });
  db.prepare(
    "INSERT OR IGNORE INTO favorites (user_id, movie_id) VALUES (?, ?)"
  ).run(req.user.id, movieId);
  res.json({ ok: true, movies: userFavorites(req.user.id) });
});

app.delete("/api/favorites/:movieId", authRequired, (req, res) => {
  db.prepare("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?").run(
    req.user.id,
    Number(req.params.movieId)
  );
  res.json({ ok: true, movies: userFavorites(req.user.id) });
});

app.get("/api/matching", authRequired, (req, res) => {
  const myMovies = userFavorites(req.user.id);
  if (myMovies.length === 0) {
    return res.json({
      threshold: MATCH_THRESHOLD,
      matches: [],
      suggestions: [],
      message: "Ajoutez des films favoris pour lancer le matching.",
    });
  }
  const mine = buildTasteProfile(myMovies);
  const others = db
    .prepare("SELECT * FROM users WHERE id != ? AND active = 1 AND role = 'user'")
    .all(req.user.id);

  const rankedProfiles = [];
  for (const other of others) {
    const theirMovies = userFavorites(other.id);
    if (theirMovies.length === 0) continue;
    const score = matchScore(mine, buildTasteProfile(theirMovies));
    rankedProfiles.push({
      user: toPublicUser(other),
      score: score.total,
      breakdown: score.breakdown,
      sharedMovies: theirMovies
        .filter((m) => myMovies.some((mineMovie) => mineMovie.id === m.id))
        .map((m) => ({ id: m.id, title: m.title, poster: m.poster })),
    });
  }
  const matches = rankedProfiles
    .filter((profile) => profile.score > MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
  const suggestions = rankedProfiles
    .filter((profile) => profile.score <= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  res.json({ threshold: MATCH_THRESHOLD, matches, suggestions });
});

app.get("/api/admin/users", authRequired, adminRequired, (_req, res) => {
  const users = db
    .prepare("SELECT * FROM users ORDER BY role DESC, created_at DESC")
    .all()
    .map(toPublicUser);
  res.json({ users });
});

app.patch("/api/admin/users/:id/active", authRequired, adminRequired, (req, res) => {
  const id = Number(req.params.id);
  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!target) return res.status(404).json({ error: "Utilisateur introuvable" });
  if (target.role === "admin") {
    return res.status(400).json({ error: "Impossible de désactiver un administrateur" });
  }
  const active = req.body?.active === false || req.body?.active === 0 ? 0 : 1;
  db.prepare("UPDATE users SET active = ? WHERE id = ?").run(active, id);
  res.json({ user: toPublicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id)) });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, "0.0.0.0", () => {
  console.log(`Film Match API on ${port}`);
});
