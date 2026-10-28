const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function apiKey() {
  return process.env.TMDB_API_KEY || "";
}

export function hasTmdbKey() {
  return Boolean(apiKey());
}

async function tmdb(path, params = {}) {
  const key = apiKey();
  if (!key) {
    const err = new Error("Clé TMDB absente. Ajoutez TMDB_API_KEY dans le fichier .env");
    err.status = 400;
    throw err;
  }
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", key);
  url.searchParams.set("language", "fr-FR");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error("Erreur TMDB");
    err.status = 502;
    throw err;
  }
  return res.json();
}

export async function searchTmdb(query) {
  const data = await tmdb("/search/movie", { query, include_adult: "false" });
  return (data.results || []).slice(0, 12).map((m) => ({
    tmdbId: m.id,
    title: m.title,
    overview: m.overview,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    poster: m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : null,
  }));
}

export async function fetchTmdbMovie(tmdbId) {
  const [movie, credits] = await Promise.all([
    tmdb(`/movie/${tmdbId}`),
    tmdb(`/movie/${tmdbId}/credits`),
  ]);
  return {
    tmdb_id: movie.id,
    title: movie.title,
    overview: movie.overview,
    year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
    poster: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : null,
    genres: (movie.genres || []).map((g) => g.name),
    actors: (credits.cast || []).slice(0, 8).map((c) => c.name),
  };
}
