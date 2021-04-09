import './RecordContainer.css';
import {hourglassOutline, golf, camera} from 'ionicons/icons';
import React from 'react';
import {IonButton, IonIcon} from '@ionic/react';
import { Plugins } from "@capacitor/core"
import { CameraPreviewOptions } from '@capacitor-community/camera-preview';
const { CameraPreview } = Plugins;
interface ContainerProps { }

const RecordContainer: React.FC<ContainerProps> = () => {

    let result: any = [];

    const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        height: 300,
    };

    const takePicture = async () => {
        for (let i = 0; i < 5; i++) {
            result[i] = await Plugins.CameraPreview.capture();
            result[i].value = window.btoa(result[i].value);
            console.log('data:image/jpeg;base64,' + window.atob(result[i].value))
        }
        Plugins.CameraPreview.stop();
    };


  return (
    <div className="recording">
        <div>
            <IonButton shape='round' size='large' color='success' mode={'ios'} onClick={() => { Plugins.CameraPreview.start(cameraPreviewOptions) }}>
                <IonIcon icon={golf} />
                Start
            </IonButton>
        </div>
        <div>
            <IonButton shape='round' size='large' color='dark' mode={'ios'} onClick={() => { takePicture() }}>
                <IonIcon icon={hourglassOutline} />
                Capture
            </IonButton>
        </div>
    </div>

  );
};

export default RecordContainer;
