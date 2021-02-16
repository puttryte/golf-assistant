import { useState, useEffect } from "react";
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import { MediaFile, VideoCapturePlusOptions, VideoCapturePlus} from "@ionic-native/video-capture-plus";

export function useMediaCapture() {

    const doMediaCapture = async () => {
        let options: VideoCapturePlusOptions = {
            limit: 1, duration: 30
        };
        let capture:any = await VideoCapturePlus.captureVideo(options);
        console.log((capture[0] as MediaFile).fullPath)
    }
    return {
        doMediaCapture
    };
}

