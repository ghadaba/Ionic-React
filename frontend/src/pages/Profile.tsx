import {
  IonButton,
  IonAvatar,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { filmOutline, logOutOutline, peopleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const leave = () => {
    logout();
    history.replace("/login");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user?.photo && (
          <IonAvatar className="photo-preview">
            <img src={user.photo} alt={`Photo de ${user.firstName} ${user.lastName}`} />
          </IonAvatar>
        )}
        <IonCard className="profile-card">
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <p>Nom</p>
                  <h2>
                    {user?.firstName} {user?.lastName}
                  </h2>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Âge</p>
                  <h2>{user?.age}</h2>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Email</p>
                  <h2>{user?.email}</h2>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <p>Rôle</p>
                  <h2>{user?.role === "admin" ? "Administrateur" : "Utilisateur"}</h2>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
        {user?.role === "admin" && (
          <>
            <IonButton expand="block" routerLink="/app/admin/users">
              <IonIcon slot="start" icon={peopleOutline} />
              Gérer les utilisateurs
            </IonButton>
            <IonButton expand="block" fill="outline" routerLink="/app/admin/films">
              <IonIcon slot="start" icon={filmOutline} />
              Ajouter des films
            </IonButton>
          </>
        )}
        <IonButton expand="block" fill="outline" className="ion-margin-top" onClick={leave}>
          <IonIcon slot="start" icon={logOutOutline} />
          Déconnexion
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
