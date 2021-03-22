
// This file uses the devices camera to capture video

import { useState, useEffect } from "react";
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import { MediaFile, VideoCapturePlusOptions, VideoCapturePlus} from "@ionic-native/video-capture-plus";

// Uses an async function which awaits video capture
// You can restrict the duration uses the duration option
// For IOS devices, you cause insert an overlay using the overlayText option
// Returns the media capture of either a single, or timeless putt

export function useMediaCapture(duration:any) {

    
    const doMediaCapture = async () => {
        let options: VideoCapturePlusOptions = {
            limit: 1,
            duration: duration,
            overlayText: 'Start Putting!'
        };
        let capture:any = await VideoCapturePlus.captureVideo(options);
        console.log((capture[0] as MediaFile).fullPath)
    };

    //return the media capture of either the single or timeless putt
    return {
        doSinglePutt: doMediaCapture,
        doTimelessPutts: doMediaCapture
    };
}

