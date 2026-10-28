import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { addOutline, searchOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { api } from "../services/api";

type TmdbHit = {
  tmdbId: number;
  title: string;
  overview: string;
  year: number | null;
  poster: string | null;
};

const AdminMovies: React.FC = () => {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [genres, setGenres] = useState("");
  const [actors, setActors] = useState("");
  const [overview, setOverview] = useState("");
  const [poster, setPoster] = useState("");
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [hits, setHits] = useState<TmdbHit[]>([]);
  const [tmdbEnabled, setTmdbEnabled] = useState<boolean | null>(null);
  const [present] = useIonToast();

  useEffect(() => {
    api<{ tmdb: boolean }>("/api/health")
      .then((data) => setTmdbEnabled(data.tmdb))
      .catch((err) => present({ message: (err as Error).message, duration: 2500, color: "danger" }));
  }, [present]);

  useIonViewWillEnter(() => {
    api<{ tmdb: boolean }>("/api/health")
      .then((data) => setTmdbEnabled(data.tmdb))
      .catch((err) => present({ message: (err as Error).message, duration: 2500, color: "danger" }));
  }, [present]);

  const addManual = async () => {
    try {
      await api("/api/movies", {
        method: "POST",
        body: JSON.stringify({ title, year, genres, actors, overview, poster }),
      });
      present({ message: "Film ajouté à la base", duration: 2000, color: "success" });
      setTitle("");
      setYear("");
      setGenres("");
      setActors("");
      setOverview("");
      setPoster("");
    } catch (err) {
      present({ message: (err as Error).message, duration: 2500, color: "danger" });
    }
  };

  const searchTmdb = async () => {
    try {
      const data = await api<{ results: TmdbHit[] }>(
        `/api/admin/tmdb/search?q=${encodeURIComponent(tmdbQuery)}`
      );
      setHits(data.results);
    } catch (err) {
      present({ message: (err as Error).message, duration: 2800, color: "warning" });
    }
  };

  const importTmdb = async (tmdbId: number) => {
    try {
      await api("/api/admin/movies/import", {
        method: "POST",
        body: JSON.stringify({ tmdbId }),
      });
      present({ message: "Film importé depuis TMDB", duration: 2000, color: "success" });
    } catch (err) {
      present({ message: (err as Error).message, duration: 2500, color: "danger" });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/profil" />
          </IonButtons>
          <IonTitle>Ajouter un film</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard className="admin-card">
          <IonCardHeader>
            <IonCardTitle>Saisie manuelle</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonInput label="Titre" labelPlacement="stacked" value={title} onIonInput={(e) => setTitle(String(e.detail.value || ""))} />
              </IonItem>
              <IonItem>
                <IonInput label="Année" labelPlacement="stacked" type="number" value={year} onIonInput={(e) => setYear(String(e.detail.value || ""))} />
              </IonItem>
              <IonItem>
                <IonInput label="Genres (virgules)" labelPlacement="stacked" value={genres} onIonInput={(e) => setGenres(String(e.detail.value || ""))} />
              </IonItem>
              <IonItem>
                <IonInput label="Acteurs (virgules)" labelPlacement="stacked" value={actors} onIonInput={(e) => setActors(String(e.detail.value || ""))} />
              </IonItem>
              <IonItem>
                <IonInput label="Affiche (URL)" labelPlacement="stacked" value={poster} onIonInput={(e) => setPoster(String(e.detail.value || ""))} />
              </IonItem>
              <IonItem>
                <IonTextarea label="Synopsis" labelPlacement="stacked" value={overview} onIonInput={(e) => setOverview(String(e.detail.value || ""))} />
              </IonItem>
            </IonList>
            <IonButton expand="block" onClick={addManual}>
              <IonIcon slot="start" icon={addOutline} />
              Enregistrer
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard className="admin-card">
          <IonCardHeader>
            <IonCardTitle>Importer depuis TMDB</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {tmdbEnabled === false && (
              <IonNote className="tmdb-help">
                L'import TMDB nécessite TMDB_API_KEY dans le fichier .env à la racine du projet, puis un redémarrage de l'API. L'ajout manuel reste disponible.
              </IonNote>
            )}
            <IonItem>
              <IonInput
                label="Recherche"
                labelPlacement="stacked"
                value={tmdbQuery}
                onIonInput={(e) => setTmdbQuery(String(e.detail.value || ""))}
              />
            </IonItem>
            <IonButton
              expand="block"
              fill="outline"
              disabled={tmdbEnabled !== true || !tmdbQuery.trim()}
              onClick={searchTmdb}
            >
              <IonIcon slot="start" icon={searchOutline} />
              Chercher
            </IonButton>
            <IonList>
              {hits.map((hit) => (
                <IonItem key={hit.tmdbId}>
                  <IonLabel>
                    <h2>
                      {hit.title} {hit.year ? `(${hit.year})` : ""}
                    </h2>
                    <p>{hit.overview}</p>
                  </IonLabel>
                  <IonButton slot="end" onClick={() => importTmdb(hit.tmdbId)}>
                    <IonIcon slot="start" icon={addOutline} />
                    Ajouter
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminMovies;
