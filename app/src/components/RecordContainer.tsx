import './ExploreContainer.css';
import { camera, trash, close } from 'ionicons/icons';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonFab, IonFabButton, IonIcon, IonGrid, IonRow,
    IonCol, IonImg, IonActionSheet } from '@ionic/react';
import { useMediaCapture } from '../hooks/useMediaCapture';

interface ContainerProps { }

const RecordContainer: React.FC<ContainerProps> = () => {
    const { doMediaCapture } = useMediaCapture();
  return (
    <div className="container">
        START
        <IonFabButton onClick={() => doMediaCapture()}>
            <IonIcon icon={camera}/>
        </IonFabButton>
    </div>
  );
};

export default RecordContainer;
