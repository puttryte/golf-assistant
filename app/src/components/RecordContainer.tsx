import './RecordContainer.css';
import {hourglassOutline, golf, camera, golfOutline, arrowForward, arrowBack} from 'ionicons/icons';
import React, { useEffect } from 'react';
import {useState} from 'react';
import {IonButton, IonIcon, IonSelectPopover} from '@ionic/react';
import { Plugins } from "@capacitor/core"
import { CameraPreviewOptions } from '@capacitor-community/camera-preview';
// import LoadingComponent from './LoadingComponent'
import {Modal} from 'antd';
import 'antd/dist/antd.css';


const { CameraPreview } = Plugins;
interface ContainerProps { }

const RecordContainer: React.FC<ContainerProps> = () => {

    const tempResult: any = [];

    const [buttonValue, setButtonValue] = useState("Capture");

    const [result, setResult] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);

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
        height: 550,
    };

    const handleOk = () => {
        setIsModalVisible(false);
    }

    const handleCancel = () => {
        setIsModalVisible(false);
    }

    function timeout(delay: number) {
        return new Promise( res => setTimeout(res, delay) );
    }


    const takePicture = async () => {
        await timeout(2000);
        for (let i = 0; i < 30; i++) {
            tempResult[i] = await Plugins.CameraPreview.capture();
            tempResult[i].value = window.btoa(tempResult[i].value);
            //console.log(i + ' data:image/jpeg;base64,' + window.atob(tempResult[i].value));
            tempResult[i] = ('data:image/jpeg;base64,' + window.atob(tempResult[i].value) + '|');
        }
        setResult(tempResult);
        Plugins.CameraPreview.stop();
        setIsModalVisible(true);
        setButtonValue("Get Results");
        //console.log(result);
    };


  return (
      <div>
          <div className="recording">
              <div>
                  <IonButton shape='round' size='large' color='primary' mode={'ios'} onClick={() => {
                      Plugins.CameraPreview.start(cameraPreviewOptions);
                      setButtonValue("Capture");
                  }}>
                      <IonIcon icon={camera} />
                      Open Camera
                  </IonButton>
              </div>
              <div>
                  <IonButton id='applybtn' shape='round' size='large' color='secondary' mode={'ios'} onClick={() => { takePicture() }}>
                      <IonIcon icon={golfOutline} />
                      {buttonValue}
                  </IonButton>
              </div>

            {/* <Modal title="Loading Data" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} centered>
                <IonButton id='applybtn' ><IonIcon icon={golf}></IonIcon>Get Results</IonButton>
                <canvas></canvas>
                <input type="hidden" value={result} id='inputArray' />
            </Modal> */}
          </div>
          <div className='canvas'>
              <canvas></canvas>
              <input type="hidden"  value={result} id='inputArray' />
          </div>
          <div className="imageButtons">
              <IonButton id='prevButton' shape='round' size='default' color='medium' mode={'ios'} >
                  <IonIcon icon={arrowBack} />
                  BACK
              </IonButton>
              <IonButton id='nextButton' shape='round' size='default' color='medium' mode={'ios'} >
                  <IonIcon icon={arrowForward} />
                  NEXT
              </IonButton>

          </div>
      </div>

  );
};

export default RecordContainer;