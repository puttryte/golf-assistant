import './RecordContainer.css';
import {camera, trash, close, hourglass, hourglassOutline, golf} from 'ionicons/icons';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonFab, IonButton, IonIcon, IonGrid, IonRow,
    IonCol, IonImg, IonActionSheet } from '@ionic/react';
import { useMediaCapture } from '../hooks/useMediaCapture';

interface ContainerProps { }

const RecordContainer: React.FC<ContainerProps> = () => {
    const { doSinglePutt } = useMediaCapture(30);
    const { doTimelessPutts } = useMediaCapture(0);
  return (
    <div className="recording">
        <div>
            <IonButton shape='round' size='large' color='success' mode={'ios'} onClick={() => doSinglePutt()}>
                <IonIcon icon={golf} />
                SINGLE
            </IonButton>
        </div>
        <div>
            <IonButton shape='round' size='large' color='dark' mode={'ios'} onClick={() => doTimelessPutts()}>
                <IonIcon icon={hourglassOutline} />
                ENDLESS
            </IonButton>
        </div>

    </div>
  );
};

export default RecordContainer;
