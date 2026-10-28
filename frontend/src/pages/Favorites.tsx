import {
  IonContent,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Movie } from "../types";

const Favorites: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [present] = useIonToast();

  const loadFavorites = useCallback(async () => {
    const data = await api<{ movies: Movie[] }>("/api/favorites");
    setMovies(data.movies);
  }, []);

  useEffect(() => {
    loadFavorites().catch((err) =>
      present({ message: (err as Error).message, duration: 2000, color: "danger" })
    );
  }, [loadFavorites, present]);

  useIonViewWillEnter(() => {
    loadFavorites().catch((err) =>
      present({ message: (err as Error).message, duration: 2000, color: "danger" })
    );
  }, [loadFavorites, present]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ma playlist</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {movies.map((movie) => (
            <IonItem key={movie.id}>
              {movie.poster && (
                <IonThumbnail slot="start">
                  <IonImg src={movie.poster} alt={movie.title} />
                </IonThumbnail>
              )}
              <IonLabel>
                <h2>
                  {movie.title} {movie.year ? `(${movie.year})` : ""}
                </h2>
                <p>{movie.genres.join(", ")}</p>
                <p>{movie.actors.join(", ")}</p>
              </IonLabel>
            </IonItem>
          ))}
          {movies.length === 0 && (
            <IonItem>
              <IonLabel>Aucun favori pour le moment.</IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
