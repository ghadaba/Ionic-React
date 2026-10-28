function dice(a, b) {
  const A = new Set(a.filter(Boolean).map((x) => String(x).toLowerCase()));
  const B = new Set(b.filter(Boolean).map((x) => String(x).toLowerCase()));
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  for (const value of A) if (B.has(value)) inter += 1;
  return (2 * inter) / (A.size + B.size);
}

export function buildTasteProfile(movies) {
  const movieIds = movies.map((m) => String(m.id));
  const titles = movies.map((m) => m.title);
  const genres = movies.flatMap((m) => m.genres || []);
  const actors = movies.flatMap((m) => m.actors || []);
  const years = movies.map((m) => m.year).filter(Boolean);
  const decades = years.map((y) => `${Math.floor(y / 10) * 10}s`);
  return { movieIds, titles, genres, actors, years, decades };
}

export function matchScore(profileA, profileB) {
  const movies = dice(profileA.movieIds, profileB.movieIds);
  const genres = dice(profileA.genres, profileB.genres);
  const actors = dice(profileA.actors, profileB.actors);
  const years = dice(
    profileA.years.map(String),
    profileB.years.map(String)
  );
  const decades = dice(profileA.decades, profileB.decades);

  const total =
    movies * 0.28 +
    genres * 0.3 +
    actors * 0.24 +
    years * 0.08 +
    decades * 0.1;

  return {
    total: Math.round(total * 1000) / 10,
    breakdown: {
      films: Math.round(movies * 1000) / 10,
      genres: Math.round(genres * 1000) / 10,
      acteurs: Math.round(actors * 1000) / 10,
      annees: Math.round(years * 1000) / 10,
      decennies: Math.round(decades * 1000) / 10,
    },
  };
}

export const MATCH_THRESHOLD = 75;
