import { MediaFile, VideoCapturePlusOptions, VideoCapturePlus} from "@ionic-native/video-capture-plus";
import {any} from "prop-types";
import {Capacitor} from "@capacitor/core";
import {useEffect} from "react";
import { File, DirectoryEntry } from "@ionic-native/file"
import { useFilesystem } from "@ionic/react-hooks/filesystem";


export function useMediaCapture(duration:any) {

    let ffmpeg = require('fluent-ffmpeg');


    let video:any;



    const doMediaCapture = async () => {
        let options: VideoCapturePlusOptions = {
            limit: 1,
            //We can restrict the recording time here, need to decide how long
            duration: duration,
            highquality: true,
            //IOS only
            overlayText: 'Start Putting!'
        };
        let capture:any = await VideoCapturePlus.captureVideo(options);
        console.log(capture[0] as MediaFile)

        // video = capture[0] as MediaFile;
        //
        // let path = video.fullPath.substring(0, video.fullPath.lastIndexOf("/"));
        //
        // let convertedVideo = new ffmpeg(video.fullPath);
        // convertedVideo
        //     .format('avi')
        //     .save(path + "test.avi");
        // console.log(convertedVideo.fullPath);
        //
        // return convertedVideo;
        //
        //

    };

    return {
        doSinglePutt: doMediaCapture,
        doTimelessPutts: doMediaCapture,
    };
}

