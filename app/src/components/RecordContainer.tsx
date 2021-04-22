import './RecordContainer.css';
import {hourglassOutline, golf, camera} from 'ionicons/icons';
import React, { useEffect } from 'react';
import {useState} from 'react';
import {IonButton, IonIcon, IonSelectPopover} from '@ionic/react';
import { Plugins } from "@capacitor/core"
import { CameraPreviewOptions } from '@capacitor-community/camera-preview';
// import LoadingComponent from './LoadingComponent'
// import {Modal} from 'antd';
//import 'antd/dist/antd.css';


const { CameraPreview } = Plugins;
interface ContainerProps { }

const RecordContainer: React.FC<ContainerProps> = () => {

    const result: any = [];




    useEffect(() => {
        const script = document.createElement('script');

        script.src = './ImageSegmentation.js';
        script.async = true;
        script.type = 'module';
        
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }

    }, []);

    const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        height: 300,
    };


    // const handleOk = () => {
    //     setIsModalVisible(false);
    // }

    // const handleCancel = () => {
    //     setIsModalVisible(false);
    // }


    const takePicture = async () => {
        for (let i = 0; i < 20; i++) {
            result[i] = await Plugins.CameraPreview.capture();
            result[i].value = window.btoa(result[i].value);
            //console.log('data:image/jpeg;base64,' + window.atob(result[i].value));
            result[i].value = window.atob(result[i].value);
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
        {/* <Modal title="Loading Data" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} centered>
                <p>hello</p>
        </Modal> */}
        <input type="hidden" value={result} id='inputArray' />
        <canvas></canvas>
    </div>

  );
};

export default RecordContainer;