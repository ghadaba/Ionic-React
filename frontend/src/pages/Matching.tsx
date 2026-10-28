import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonAvatar,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { Match } from "../types";

const Matching: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [suggestions, setSuggestions] = useState<Match[]>([]);
  const [threshold, setThreshold] = useState(75);
  const [message, setMessage] = useState<string | null>(null);
  const [present] = useIonToast();

  const loadMatching = useCallback(async () => {
    const data = await api<{
      matches: Match[];
      suggestions?: Match[];
      threshold: number;
      message?: string;
    }>("/api/matching");
    setMatches(data.matches);
    setSuggestions(data.suggestions || []);
    setThreshold(data.threshold);
    setMessage(data.message || null);
  }, []);

  useEffect(() => {
    loadMatching().catch((err) =>
      present({ message: (err as Error).message, duration: 2000, color: "danger" })
    );
  }, [loadMatching, present]);

  useIonViewWillEnter(() => {
    loadMatching().catch((err) =>
      present({ message: (err as Error).message, duration: 2000, color: "danger" })
    );
  }, [loadMatching, present]);

  const displayedProfiles = matches.length > 0 ? matches : suggestions;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Matching</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p className="muted">
          Correspondance sur les films, genres, acteurs, années et décennies. Seuil : {threshold}%.
        </p>
        {message && <IonNote className="matching-empty-note">{message}</IonNote>}
        {matches.length === 0 && suggestions.length === 0 && !message && (
          <IonNote className="matching-empty-note">
            Aucun utilisateur ne dépasse le seuil de {threshold}%.
          </IonNote>
        )}
        {matches.length === 0 && suggestions.length > 0 && (
          <>
            <IonNote className="matching-empty-note">
              Aucun profil ne dépasse {threshold}%. Les profils suivants sont les plus proches, mais restent sous le seuil.
            </IonNote>
            <h2 className="matching-section-title">Profils les plus proches</h2>
          </>
        )}
        {displayedProfiles.map((match) => (
          <IonCard key={match.user.id}>
            <IonCardHeader>
              <IonCardTitle>
                {match.user.firstName} {match.user.lastName}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {match.user.photo && (
                <IonAvatar className="photo-preview">
                  <img
                    src={match.user.photo}
                    alt={`Photo de ${match.user.firstName} ${match.user.lastName}`}
                  />
                </IonAvatar>
              )}
              <div className="match-score">{match.score}%</div>
              <IonNote>
                Films {match.breakdown.films}% · Genres {match.breakdown.genres}% · Acteurs{" "}
                {match.breakdown.acteurs}% · Années {match.breakdown.annees}% · Décennies{" "}
                {match.breakdown.decennies}%
              </IonNote>
              <p>
                Films en commun : {match.sharedMovies.map((m) => m.title).join(", ") || "aucun titre identique"}
              </p>
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Matching;
