import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonNote,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { logInOutline, personAddOutline } from "ionicons/icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState("alice@filmmatch.app");
  const [password, setPassword] = useState("Alice123!");
  const [present] = useIonToast();

  const submit = async () => {
    try {
      await login(email, password);
      history.replace("/app/films");
    } catch (err) {
      present({ message: (err as Error).message, duration: 2500, color: "danger" });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Film Match</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding auth-content">
        <div className="auth-shell">
          <div className="auth-heading">
            <p className="auth-kicker">Film Match</p>
            <h1>Connexion</h1>
            <p>Gérez vos films favoris et trouvez des goûts en commun.</p>
          </div>
          <IonCard className="auth-card">
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonInput
                    label="Email"
                    labelPlacement="stacked"
                    type="email"
                    value={email}
                    onIonInput={(e) => setEmail(String(e.detail.value || ""))}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Mot de passe"
                    labelPlacement="stacked"
                    type="password"
                    value={password}
                    onIonInput={(e) => setPassword(String(e.detail.value || ""))}
                  />
                </IonItem>
              </IonList>
              <div className="auth-actions">
                <IonButton expand="block" onClick={submit}>
                  <IonIcon slot="start" icon={logInOutline} />
                  Se connecter
                </IonButton>
                <IonButton expand="block" fill="outline" routerLink="/register">
                  <IonIcon slot="start" icon={personAddOutline} />
                  Créer un compte
                </IonButton>
              </div>
              <IonNote className="auth-note">
                Démo : alice@filmmatch.app / Alice123! — admin@filmmatch.app / Admin123!
              </IonNote>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
