import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import LoadingComponent from "../components/LoadingComponent";

const LoadingPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>PuttRyte</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">PuttRyte</IonTitle>
          </IonToolbar>
        </IonHeader>
        <LoadingComponent />
      </IonContent>
    </IonPage>
  );
};

export default LoadingPage;