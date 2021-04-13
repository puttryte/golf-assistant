import './RecordContainer.css';
import {hourglassOutline, golf, camera} from 'ionicons/icons';
import React from 'react';
import {useState} from 'react';
import {IonButton, IonIcon} from '@ionic/react';
import { Plugins } from "@capacitor/core"
import { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import LoadingComponent from './LoadingComponent'
import { useHistory, Redirect } from 'react-router-dom';

const { CameraPreview } = Plugins;
interface ContainerProps { }

const RecordContainer: React.FC<ContainerProps> = () => {

    let history = useHistory();

    let [currentImg, setCurrentImg] = useState("");

    let imgArr = [''];

    let result: any = [];

    const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        height: 300,
    };

    const takePicture = async () => {
        // for (let i = 0; i < 20; i++) {
        //     result[i] = await Plugins.CameraPreview.capture();
        //     result[i].value = window.btoa(result[i].value);
        //     console.log('data:image/jpeg;base64,' + window.atob(result[i].value));
        //     setCurrentImg('data:image/jpeg;base64,' + window.atob(result[i].value));
        //     imgArr.push(currentImg);
        // }
        // Plugins.CameraPreview.stop();
        console.log("you got here");
    // });
    };


  return (
    <div className="recording">
        {/* <div>
            <IonButton shape='round' size='large' color='success' mode={'ios'} onClick={() => { Plugins.CameraPreview.start(cameraPreviewOptions) }}>
                <IonIcon icon={golf} />
                Start
            </IonButton>
        </div> */}
        <div>
            <IonButton shape='round' size='large' color='dark' mode={'ios'} onClick={() => { takePicture() }}>
                <IonIcon icon={hourglassOutline} />
                Capture
            </IonButton>
        </div>
        <div>
        <LoadingComponent />
        </div>
    </div>

  );
};

export default RecordContainer;