import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { filmOutline, heartOutline, peopleOutline, personOutline } from "ionicons/icons";
import { Redirect, Route } from "react-router-dom";
import Movies from "./Movies";
import Favorites from "./Favorites";
import Matching from "./Matching";
import Profile from "./Profile";
import AdminUsers from "./AdminUsers";
import AdminMovies from "./AdminMovies";

const Tabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/app/films" component={Movies} />
        <Route exact path="/app/favoris" component={Favorites} />
        <Route exact path="/app/matching" component={Matching} />
        <Route exact path="/app/profil" component={Profile} />
        <Route exact path="/app/admin/users" component={AdminUsers} />
        <Route exact path="/app/admin/films" component={AdminMovies} />
        <Route exact path="/app">
          <Redirect to="/app/films" />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="films" href="/app/films">
          <IonIcon icon={filmOutline} />
          <IonLabel>Films</IonLabel>
        </IonTabButton>
        <IonTabButton tab="favoris" href="/app/favoris">
          <IonIcon icon={heartOutline} />
          <IonLabel>Favoris</IonLabel>
        </IonTabButton>
        <IonTabButton tab="matching" href="/app/matching">
          <IonIcon icon={peopleOutline} />
          <IonLabel>Matching</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profil" href="/app/profil">
          <IonIcon icon={personOutline} />
          <IonLabel>Profil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
