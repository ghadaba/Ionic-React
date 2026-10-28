import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonButton,
  IonToolbar,
  useIonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import { banOutline, refreshOutline } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import type { User } from "../types";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [present] = useIonToast();

  const load = useCallback(async () => {
    const data = await api<{ users: User[] }>("/api/admin/users");
    setUsers(data.users);
  }, []);

  useEffect(() => {
    load().catch((err) => present({ message: err.message, duration: 2000, color: "danger" }));
  }, [load, present]);

  useIonViewWillEnter(() => {
    load().catch((err) => present({ message: err.message, duration: 2000, color: "danger" }));
  }, [load, present]);

  const toggleActive = async (user: User) => {
    try {
      await api(`/api/admin/users/${user.id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ active: !user.active }),
      });
      await load();
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
          <IonTitle>Utilisateurs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {users.map((user) => (
            <IonItem key={user.id}>
              <IonLabel>
                <h2>
                  {user.firstName} {user.lastName} {user.role === "admin" ? "(admin)" : ""}
                </h2>
                <p>
                  {user.email} · {user.active ? "actif" : "désactivé"}
                </p>
              </IonLabel>
              {user.role !== "admin" && (
                <IonButton slot="end" fill="outline" onClick={() => toggleActive(user)}>
                  <IonIcon slot="start" icon={user.active ? banOutline : refreshOutline} />
                  {user.active ? "Désactiver" : "Réactiver"}
                </IonButton>
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;
