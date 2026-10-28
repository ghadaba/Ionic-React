import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonImg,
  IonPage,
  IonSearchbar,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Movie } from "../types";

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [q, setQ] = useState("");
  const [present] = useIonToast();

  const load = useCallback(async (query = "") => {
    const data = await api<{ movies: Movie[] }>(`/api/movies${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setMovies(data.movies);
  }, []);

  useEffect(() => {
    load().catch((err) => present({ message: err.message, duration: 2000, color: "danger" }));
  }, [load, present]);

  useIonViewWillEnter(() => {
    load().catch((err) => present({ message: err.message, duration: 2000, color: "danger" }));
  }, [load, present]);

  const toggle = async (movie: Movie) => {
    try {
      if (movie.favorite) {
        await api(`/api/favorites/${movie.id}`, { method: "DELETE" });
      } else {
        await api(`/api/favorites/${movie.id}`, { method: "POST" });
      }
      await load(q);
    } catch (err) {
      present({ message: (err as Error).message, duration: 2000, color: "danger" });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Films</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={q}
            placeholder="Titre, genre, acteur..."
            onIonInput={(e) => {
              const value = String(e.detail.value || "");
              setQ(value);
              load(value).catch(() => undefined);
            }}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid className="movie-grid">
          <IonRow>
            {movies.map((movie) => (
              <IonCol key={movie.id} size="6" sizeSm="4" sizeMd="3" sizeLg="2">
                <IonCard className="movie-card">
                  {movie.poster ? (
                    <IonImg className="hero-poster" src={movie.poster} alt={movie.title} />
                  ) : (
                    <div className="hero-poster" aria-hidden="true" />
                  )}
                  <IonCardHeader>
                    <IonCardTitle>
                      {movie.title} {movie.year ? `(${movie.year})` : ""}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p className="muted movie-genres">{movie.genres.join(" · ")}</p>
                    <IonButton
                      expand="block"
                      size="small"
                      fill={movie.favorite ? "solid" : "outline"}
                      onClick={() => toggle(movie)}
                    >
                      {movie.favorite ? "Retirer" : "Favori"}
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Movies;
