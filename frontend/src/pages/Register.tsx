import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import {
  IonButton,
  IonAvatar,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { cameraOutline, personAddOutline } from "ionicons/icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register: React.FC = () => {
  const { register } = useAuth();
  const history = useHistory();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [present] = useIonToast();

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        width: 600,
      });
      setPhoto(image.dataUrl || null);
    } catch {
      present({
        message: "Caméra refusée ou indisponible. Autorisez l'accès dans le navigateur.",
        duration: 2800,
        color: "warning",
      });
    }
  };

  const submit = async () => {
    try {
      await register({
        firstName,
        lastName,
        age: Number(age),
        email,
        password,
        photo,
      });
      history.replace("/app/films");
    } catch (err) {
      present({ message: (err as Error).message, duration: 2500, color: "danger" });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inscription</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding auth-content">
        <div className="auth-shell">
          <div className="auth-heading">
            <p className="auth-kicker">Film Match</p>
            <h1>Créer un compte</h1>
            <p>Rejoignez votre espace de films et de favoris.</p>
          </div>
          <IonCard className="auth-card">
            <IonCardContent>
              <IonGrid className="auth-form-grid">
                <IonRow>
                  <IonCol size="12" sizeSm="6">
                    <IonItem>
                      <IonInput
                        label="Prénom"
                        labelPlacement="stacked"
                        value={firstName}
                        onIonInput={(e) => setFirstName(String(e.detail.value || ""))}
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeSm="6">
                    <IonItem>
                      <IonInput
                        label="Nom"
                        labelPlacement="stacked"
                        value={lastName}
                        onIonInput={(e) => setLastName(String(e.detail.value || ""))}
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeSm="4">
                    <IonItem>
                      <IonInput
                        label="Âge"
                        labelPlacement="stacked"
                        type="number"
                        value={age}
                        onIonInput={(e) => setAge(String(e.detail.value || ""))}
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeSm="8">
                    <IonItem>
                      <IonInput
                        label="Email"
                        labelPlacement="stacked"
                        type="email"
                        value={email}
                        onIonInput={(e) => setEmail(String(e.detail.value || ""))}
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="12">
                    <IonItem>
                      <IonInput
                        label="Mot de passe"
                        labelPlacement="stacked"
                        type="password"
                        value={password}
                        onIonInput={(e) => setPassword(String(e.detail.value || ""))}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
              <IonButton expand="block" fill="outline" onClick={takePhoto}>
                <IonIcon slot="start" icon={cameraOutline} />
                Prendre une photo
              </IonButton>
              {photo && (
                <IonAvatar className="photo-preview">
                  <img src={photo} alt={`Photo de ${firstName || "profil"}`} />
                </IonAvatar>
              )}
              <div className="auth-actions">
                <IonButton expand="block" onClick={submit}>
                  <IonIcon slot="start" icon={personAddOutline} />
                  S'inscrire
                </IonButton>
                <IonButton expand="block" fill="clear" routerLink="/login">
                  Déjà un compte ? Se connecter
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
