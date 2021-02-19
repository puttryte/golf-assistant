import { useState, useEffect } from "react";
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import { MediaFile, VideoCapturePlusOptions, VideoCapturePlus} from "@ionic-native/video-capture-plus";

export function useMediaCapture(duration:any) {

    const doMediaCapture = async () => {
        let options: VideoCapturePlusOptions = {
            limit: 1,
            //We can restrict the recording time here, need to decide how long
            duration: duration,
            //IOS only, potential here for a countdown timer?
            overlayText: 'Start Putting!'
        };
        let capture:any = await VideoCapturePlus.captureVideo(options);
        console.log((capture[0] as MediaFile).fullPath)
    };
    return {
        doSinglePutt: doMediaCapture,
        doTimelessPutts: doMediaCapture
    };
}

