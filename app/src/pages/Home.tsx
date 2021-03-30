import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import FeedbackAnalysis from "../components/FeedbackAnalysis";

const Home: React.FC = () => {
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
        {/* <RecordContainer /> */}
        <FeedbackAnalysis />
      </IonContent>
    </IonPage>
  );
};

export default Home;
