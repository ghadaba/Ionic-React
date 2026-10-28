export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  photo: string | null;
  role: "admin" | "user";
  active: boolean;
};

export type Movie = {
  id: number;
  tmdbId?: number | null;
  title: string;
  overview?: string;
  year?: number | null;
  poster?: string | null;
  genres: string[];
  actors: string[];
  favorite?: boolean;
};

export type Match = {
  user: User;
  score: number;
  breakdown: {
    films: number;
    genres: number;
    acteurs: number;
    annees: number;
    decennies: number;
  };
  sharedMovies: { id: number; title: string; poster?: string | null }[];
};
