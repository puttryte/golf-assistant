import './RecordContainer.css';
import {hourglassOutline, golf, camera} from 'ionicons/icons';
import React from 'react';
import {useState} from 'react';
import {IonButton, IonIcon} from '@ionic/react';
import { Plugins } from "@capacitor/core"
import { CameraPreviewOptions } from '@capacitor-community/camera-preview';
import LoadingComponent from './LoadingComponent'
import { useHistory, Redirect } from 'react-router-dom';
import {Modal} from 'antd';
import 'antd/dist/antd.css'


const { CameraPreview } = Plugins;
interface ContainerProps { }

const RecordContainer: React.FC<ContainerProps> = () => {

    let history = useHistory();

    let [imgArr, setImgArr] = useState([""]);

    let result: any = [];

    const [isModalVisible, setIsModalVisible] = useState(false);

    const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'rear',
        height: 300,
    };

    const handleOk = () => {
        setIsModalVisible(false);
    }

    const handleCancel = () => {
        setIsModalVisible(false);
    }

    const takePicture = () => {
        // for (let i = 0; i < 20; i++) {
        //     result[i] = await Plugins.CameraPreview.capture();
        //     result[i].value = window.btoa(result[i].value);
        //     console.log('data:image/jpeg;base64,' + window.atob(result[i].value));
        //     setCurrentImg('data:image/jpeg;base64,' + window.atob(result[i].value));
        //     imgArr.push(currentImg);
        // }
        // Plugins.CameraPreview.stop();
        console.log("you got here");
        setIsModalVisible(true);
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
        <Modal title="Loading Data" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} centered>
                <p>hello</p>
        </Modal>
    </div>

  );
};

export default RecordContainer;