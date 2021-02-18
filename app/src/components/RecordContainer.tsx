import './RecordContainer.css';
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
        <IonFabButton onClick={() => doMediaCapture()}>
            START
        </IonFabButton>
    </div>
  );
};

export default RecordContainer;
