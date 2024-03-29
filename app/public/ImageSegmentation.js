//type="text/javascript"
import MyImageData from "./MyImageData.js";
import ImageProcessing from "./ImageProcessing.js";
import KMeans from "./KMeans.js";
import Segment from "./Segment.js";
import HoughTransform from "./HoughTransform.js";
// import {useEffect} from 'react';

//for keeping up a record of time of each processes.
var startTime = Date.now();
var currentTime = Date.now();

//easier access for the html canvases
var canvases;

//base size of each image while keeping the image ratio
//the bigger the base the more pixels it would have to process
//a very small base would make the process inaccurate
var imageSize = 300;

//the average brightness of each image will have before going through the process
var normalBrightness = 75;

//for k-means algorithm
//clusters are the number of color the image is separated with.
//2 clusters for separating the grass with everything else.
//iteration is the number of times the algorithm will run. 
//the higher the number, the more accurate it would be. 
var cluster = 2;
var iteration = 10;

//for denoising and morphological closing.
//the lower the number, the less processing it would do but the image would keep it integrity.
var numOfErosion = 1;
var numOfDilation = 1;

//Start of the Process. 
function main()
{

    // useEffect(() => {
        
    //     Apply(imgArr);

    // }, [imgArr]);
    //set up the drop selection base on the TestImages.js
    // var mySelect = document.getElementById("testImage");

    // for (let i = 0; i < TestImages.images.length; i++)
    // {
    //     let option = document.createElement("option");
    //     option.value = i;
    //     option.text = TestImages.images[i].name;
    //     mySelect.add(option);
    // }

    //set the default value of the drop selection
    // mySelect.value = 6;

    // //declare a behavior of the apply button
    // document.getElementById("applybtn").addEventListener('click', Apply);

    document.getElementById("applybtn").addEventListener('click', Apply);

    //var imgArr = document.getElementById("inputArray").value;


    //start the proccess with the default image 

}

//fuction gets trigger when the apply button is pressed.
function Apply()
{
    canvases = document.getElementsByTagName("canvas");
    var canvasContext = canvases[0].getContext('2d');
    var imgArr = document.getElementById("inputArray").value;
    var splitArr = imgArr.split('|,');
    var imageShownIndex = 0;
    var prevButton = document.getElementById('prevButton');
    var nextButton = document.getElementById('nextButton');
    canvasContext.clearRect(0, 0, canvases[0].height, canvases[0].width);
    prevButton.onclick = function () {
        imageShownIndex = (imageShownIndex === splitArr.length - 1) ? 0 : imageShownIndex - 1;
        updateImage(splitArr, imageShownIndex, canvases[0], canvasContext);
    };
    nextButton.onclick = function () {
        imageShownIndex = (imageShownIndex === splitArr.length - 1) ? 0 : imageShownIndex + 1;
        updateImage(splitArr, imageShownIndex, canvases[0], canvasContext);
    };

    updateImage(splitArr, imageShownIndex, canvases[0], canvasContext);

    //for record timing purposes
    startTime = Date.now();
    currentTime = Date.now();


}

function updateImage(imgArr, index, canvas, canvasContext)
{
    let image = new Image();
    image.src = imgArr[index];
    console.log(image.width + "   " + image.height);
    canvasContext.clearRect(0, 0, image.height, image.width);
    image.onload = function()
    {
        //scale the image
        let size = ImageProcessing.GetImageScale(image.width, image.height, imageSize);

        //using the dimension of scaled image, scale all the canvases.
        // for(let i = 0; i < canvases.length; i++)
        // {
        //     canvases[i].width = size[0];
        //     canvases[i].height = size[1];
        //     ctxs[i] = canvases[i].getContext('2d');
        //     ctxs[i].imageSmoothinEnabled = true;
        // }


        canvas.width = size[0];
        canvas.height = size[1];
        canvasContext.imageSmoothinEnabled = true;


        //set one canvas in memory so all other canvases are for output only
        // let tempCanvas = document.createElement("canvas");
        // tempCanvas.width = size[0];
        // tempCanvas.height = size [1];

        //set up context
        // let tempCtx = tempCanvas.getContext('2d');
        // tempCtx.imageSmoothingEnabled = true;
        canvasContext.drawImage(image, 0, 0, size[0], size[1]);

        //get image data
        let imageData = new MyImageData(
            size[0],
            size[1],
            canvasContext.getImageData(0, 0, size[0], size[1]).data
        );

        //used for output
        let tempImageData = new ImageData(size[0], size[1]);

        //convert image data to Uint8ClampedArray then output to canvas
        tempImageData.data.set(imageData.getUint8Array());
        canvasContext.putImageData(tempImageData, 0, 0);

        //record time
        console.log("Showing Original Image: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //normalize the image's brighness level
        ImageProcessing.NormalizeImageBrightness(imageData, normalBrightness);
        // tempImageData.data.set(imageData.getUint8Array());
        // ctxs[1].putImageData(tempImageData, 0, 0);

        //record time.
        console.log("After normalizing the image: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //get the selected colorspace to use, defaulted to CMYK
        let colorSpace = 1;
        let kMeansImageDatas = KMeans.ProcessImage(imageData, colorSpace, cluster, iteration);

        //record time.
        // tempImageData.data.set(kMeansImageDatas[0].getUint8Array());
        // ctxs[3].putImageData(tempImageData, 0, 0);

        // tempImageData.data.set(kMeansImageDatas[1].getUint8Array());
        // ctxs[4].putImageData(tempImageData, 0, 0);

        // tempImageData.data.set(kMeansImageDatas[2].getUint8Array());
        // ctxs[5].putImageData(tempImageData, 0, 0);

        console.log("After K-means Algorithm: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        // //denoise the image.
        // //erode the image and inflate it.
        // //pixels with radius equal to the numOfErosion should disappears.
        ImageProcessing.Erosion(kMeansImageDatas[1], numOfErosion);
        ImageProcessing.Dilation(kMeansImageDatas[1], numOfDilation);

        // tempImageData.data.set(kMeansImageDatas[1].getUint8Array());
        // ctxs[6].putImageData(tempImageData, 0, 0);

        //record time
        console.log("After Denoising Clusters: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //mophological closing
        //infate it then erode it back
        //any holes or cravases would get smaller by the number equal to the numOfDilation
        ImageProcessing.Dilation(kMeansImageDatas[1], numOfDilation);
        ImageProcessing.Erosion(kMeansImageDatas[1], numOfErosion);

        // tempImageData.data.set(kMeansImageDatas[1].getUint8Array());
        // ctxs[7].putImageData(tempImageData, 0, 0);

        //record time
        console.log("After Morphologically Closing: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //sepated the golf ball and the putter
        //HorizontalSeparation(ctxs[7], ctxs[9], ctxs[10]);
        let segments = GetSegments(kMeansImageDatas[1]);

        // tempImageData.data.set(kMeansImageDatas[1].getUint8Array());
        // ctxs[8].putImageData(tempImageData, 0, 0);

        //record time
        console.log("After Getting all the segments: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        let peaks = [];
        let diameter = 0;
        let detectionRange = [size[0] * (1 / 16), size[0] * (5 / 8)]

        //checks segments length for analysis
        if(segments.length === 0)
        {
            console.log("-----> No Object Dectected!");
        }
        else if(segments.length === 1)
        {
            segments.push(segments[0]);
            diameter = segments[0].height / 2;
        }
        else if(segments.length > 2)
        {
            segments = IsolateSegments(segments, detectionRange[0], detectionRange[1]);

            if(segments[0].height < segments[0].width)
            {
                diameter = segments[0].height;
            }
            else
            {
                diameter = segments[0].width;
            }
        }

        if(segments.length === 2)
        {
            let radius = Math.round(diameter / 2);
            let houghCircleOutput = HoughTransform.HoughCircleTranform(segments[0], radius);
            let houghLineOutput = HoughTransform.HoughLineTranform(segments[1]);

            peaks[0] = HoughTransform.GetHoughCirclePeaks(houghCircleOutput , 0.99, 5);
            peaks[1] = HoughTransform.GetHoughLinePeaks(houghLineOutput , 0.75, 200);

            for(let i = 0; i < peaks[0].length; i++)
            {
                peaks[0][i][1] += segments[0].xMin - radius;
                peaks[0][i][0] += segments[0].yMin - radius;
            }

            for(let i = 0; i < peaks[1].length; i++)
            {
                let r = peaks[1][i][0];
                let angle = peaks[1][i][1];
                let angle2 = angle + 270;

                if(angle < 0)
                {
                    r *= -1;
                    angle *= -1;
                    angle2 = (90 - angle) ;
                }

                peaks[1][i] = [
                    r,
                    angle,
                    angle2,
                    segments[1].xMin,
                    segments[1].yMin,
                    segments[1].xMax,
                    segments[1].yMax
                ];
            }
            if (peaks[1].length > 1)
            {
                peaks[1].sort(function(a, b){
                    return a[0]-b[0]
                });
                peaks[1] = [peaks[1][0]];
            }


            HoughTransform.ShowHoughCircle(canvasContext, canvasContext, segments[0], peaks[0], radius);
            HoughTransform.ShowHoughLines(canvasContext, canvasContext, segments[1], peaks[1]);
        }
        else
        {
            console.log("-----> More Than 3 objects detected!")
        }

        //record time
        console.log("After analyzing all segments: " + (Date.now() - currentTime) + " miliseconds");
        currentTime = Date.now();

        ShowBorderAndSegment(canvasContext, canvasContext,  detectionRange[0], detectionRange[1], segments)
        canvasContext.putImageData(canvasContext.getImageData(0, 0, size[0], size[1]), 0, 0);

        console.log("Total time: " + (Date.now() - startTime) + " miliseconds")

        return peaks;
    }
}

//Analyze the image and outputs an array of Segments
//Parameter: source : MyImageData   : from MyImageData.js
//Return:    Array of Segment   : from Segment.js
function GetSegments(source)
{
    //for return
    let out = [];

    for(let i = 0; i < source.data.length; i++)
    {
        for(let j = 0; j < source.data[i].length; j++)
        {
            if(source.data[i][j][0] === 255)
            {
                let startPixel = [i, j];
                let edges = GetEdge(source, startPixel);

                let xMin = source.width;
                let xMax = 0;
                let yMin = source.height;
                let yMax = 0;

                for(let k = 0; k < edges.length; k++)
                {
                    if(edges[k][0] < yMin)
                    {
                        yMin = edges[k][0];
                    }

                    if(edges[k][0] > yMax)
                    {
                        yMax = edges[k][0];
                    }

                    if(edges[k][1] < xMin)
                    {
                        xMin = edges[k][1];
                    }

                    if(edges[k][1] > xMax)
                    {
                        xMax = edges[k][1];
                    }
                }

                xMin -= 1;
                xMax += 2;
                yMin -= 1;
                yMax += 2;

                let segmentImageData = new MyImageData(xMax - xMin, yMax - yMin)

                for(let a = 0; a < edges.length; a++)
                {
                    segmentImageData.data[edges[a][0] - yMin][edges[a][1] - xMin] = [255, 255, 255, 255];
                }

                FloodFill(segmentImageData.data, 0, 0);

                InvertBlackAndWhite(segmentImageData.data);

                let segment = new Segment(segmentImageData, xMin, yMin, xMax, yMax);

                for(let a = 0; a < segmentImageData.data.length; a++)
                {
                    for(let b = 0; b < segmentImageData.data[a].length; b++)
                    {
                        if(segmentImageData.data[a][b][0] === 255)
                        {
                            source.data[a + yMin][b + xMin] = [0, 0, 0, 255];
                        }
                    }
                }

                out.push(segment);
            }
        }
    }

    return out;
}

function GetEdge(source, start)
{
    let output = [];
    let current = [start[0], start[1]];
    let dir = 3;

    do
    {
        output.push([current[0], current[1]]);
        let found = false;

        while(!found)
        {
            let x = current[1];
            let y = current[0];

            if(dir === 0)
            {
                x -= 1;
                y -= 1;
            }
            else if(dir === 1)
            {
                y -= 1;
            }
            else if(dir === 2)
            {
                x += 1;
                y -= 1;
            }
            else if(dir === 3)
            {
                x += 1;
            }
            else if(dir === 4)
            {
                x += 1;
                y += 1;
            }
            else if(dir === 5)
            {
                y += 1;
            }
            else if(dir === 6)
            {
                x -= 1;
                y += 1;
            }
            else if(dir === 7)
            {
                x -= 1;
            }

            if(source.data[y][x][0] === 255)
            {
                found = true;
                current = [y, x];
                dir -= 3;

                if(dir < 0)
                {
                    dir += 8;
                }
            }
            else
            {
                dir++;

                if(dir > 7)
                {
                    dir = 0;
                }
            }
        }
    }
    while(!(start[0] === current[0] && start[1] === current[1]))

    return output;
}

function FloodFill(data, x, y)
{
    FillStage1(data, x, y);
    FillStage2(data);
}

//#region FloodFill recursive version
// function FillStage1(pixels, x, y)
// {
//     pixels[y][x] = [255, 0, 0, 255];

//     if((y - 1) > 0)
//     {
//         if(pixels[y - 1][x][0] != 255)
//         {
//             FillStage1(pixels, x, y - 1);
//         }
//     }

//     if((x - 1) > 0)
//     {
//         if(pixels[y][x - 1][0] != 255)
//         {
//             FillStage1(pixels, x - 1, y);
//         }
//     }

//     if((y + 1) < pixels.length)
//     {
//         if(pixels[y + 1][x][0] != 255)
//         {
//             FillStage1(pixels, x, y + 1);
//         }
//     }

//     if((x + 1) < pixels[0].length)
//     {
//         if(pixels[y][x + 1][0] != 255)
//         {
//             FillStage1(pixels, x + 1, y);
//         }
//     }
// }
//#endregion

function FillStage1(pixels, x, y)
{
    let stack = [];
    stack.push([y,x]);

    while(stack.length > 0)
    {
        let col = stack[stack.length - 1][0];
        let row = stack[stack.length - 1][1];
        stack.pop();

        pixels[col][row] = [255, 0, 0, 255];

        if(((col - 1) >= 0) && (pixels[col -1][row][0] != 255))
        {
            stack.push([(col - 1), row]);
        }

        if(((row + 1) < pixels[0].length) && (pixels[col][row + 1][0] != 255))
        {
            stack.push([col, (row + 1)]);
        }

        if(((col + 1) < pixels.length) && (pixels[col + 1][row][0] != 255))
        {
            stack.push([(col + 1), row]);
        }

        if(((row - 1) >= 0) && (pixels[col][row - 1][0] != 255))
        {
            stack.push([col, (row - 1)]);
        }
    }
}

function FillStage2(pixels)
{
    for(let a = 0; a < pixels.length; a++)
    {
        for(let b = 0; b < pixels[a].length; b++)
        {
            if(pixels[a][b][0] == 255 && pixels[a][b][1] == 0)
            {
                pixels[a][b] = [255, 255, 255, 255];
            }
            else
            {
                pixels[a][b] = [0, 0, 0, 255];
            }
        }
    }
}

function InvertBlackAndWhite(pixels)
{
    for(let a = 0; a < pixels.length; a++)
    {
        for(let b = 0; b < pixels[a].length; b++)
        {
            if(pixels[a][b][0] == 0)
            {
                pixels[a][b] = [255, 255, 255, 255];
            }
            else
            {
                pixels[a][b] = [0, 0, 0, 255];
            }
        }
    }
}

function SeparateSegment(segment)
{
    let verticalHistrogram = new Array(segment.width).fill(0);
    let horizontalHistogram = new Array(segment.height).fill(0);

    for(let i = 0; i < segment.data.length; i++)
    {
        for(let j = 0; j < segment.data[i].length; j++)
        {
            if(segment.data[i][j][0] === 255)
            {
                verticalHistrogram[j]++;
                horizontalHistogram[i]++;
            }
        }
    }

    if(segment.width > segment.height)
    {
        let startCheking = Math.round(verticalHistrogram.length / 4);
        let average = 0;
        let cutoff = 0;

        for(let i = 0; i < horizontalHistogram.length; i++)
        {
            if(i >= startCheking)
            {
                if(((average / (i + 1)) * 2) < horizontalHistogram[i])
                {
                    cutoff = i;
                    break
                }
            }

            average += horizontalHistogram[i]
        }

        let topSegmentImageData = new MyImageData(segment.width, cutoff)
        let bottomSegmentImageData = new MyImageData(segment.width, segment.height - cutoff)

        for(let i = 0; i < segment.data.length; i++)
        {
            for(let j = 0; j < segment.data[i].length; j++)
            {
                if(i < cutoff)
                {
                    topSegmentImageData.data[i][j] = [
                        segment.data[i][j][0],
                        segment.data[i][j][1],
                        segment.data[i][j][2],
                        segment.data[i][j][3]
                    ]
                }
                else
                {
                    bottomSegmentImageData.data[i - cutoff][j] = [
                        segment.data[i][j][0],
                        segment.data[i][j][1],
                        segment.data[i][j][2],
                        segment.data[i][j][3]
                    ]
                }
            }
        }

        ImageProcessing.Erosion(topSegmentImageData, 1);
        ImageProcessing.Erosion(bottomSegmentImageData, 1);
        ImageProcessing.Dilation(topSegmentImageData, 1);
        ImageProcessing.Dilation(bottomSegmentImageData, 1)





        verticalHistrogram = new Array(topSegmentImageData.width).fill(0);

        for(let i = 0; i < topSegmentImageData.data.length; i++)
        {
            for(let j = 0; j < topSegmentImageData.data[i].length; j++)
            {
                if(topSegmentImageData.data[i][j][0] === 255)
                {
                    verticalHistrogram[j]++;
                }
            }
        }

        let newXMax = 0;

        for(let i = verticalHistrogram.length - 1; i >= 0; i--)
        {
            if(verticalHistrogram[i] > 0)
            {
                newXMax = i + 2;
                break;
            }
        }

        let topSegment = new Segment(topSegmentImageData, segment.xMin, segment.yMin, segment.xMin + newXMax, segment.yMin + cutoff);
        let bottomSegment = new Segment(bottomSegmentImageData, segment.xMin, segment.yMin + cutoff + 1, segment.xMax, segment.yMax);

        return [topSegment, bottomSegment];
    }
    else
    {
        console.log("Segment need a vertical separation")
    }
}

function IsolateSegments(segments, left, right)
{
    let out = [];

    for(let i = 0; i < segments.length; i++)
    {
        if((segments[i].xMin > left) && (segments[i].xMax < right))
        {
            out.push(segments[i]);
        }
    }

    return out;
}

function ShowBorderAndSegment(source, output, left, right, segments)
{
    let temp_ImageData = source.getImageData(0,0, output.canvas.width, output.canvas.height);
    output.putImageData(temp_ImageData, 0, 0);

    output.beginPath();
    output.lineWidth = "1";
    output.strokeStyle = "blue";
    output.moveTo(left, 0);
    output.lineTo(left, output.canvas.height);
    output.moveTo(right, 0);
    output.lineTo(right, output.canvas.height);
    output.stroke()

    output.beginPath();
    output.lineWidth = "1";
    output.strokeStyle = "white";
    for(let i = 0; i < segments.length; i++)
    {
        output.rect(segments[i].xMin, segments[i].yMin, segments[i].xMax - segments[i].xMin, segments[i].yMax - segments[i].yMin);
    }
    output.stroke()

}

function ShowSegments(output, segments)
{
    let newImage = new MyImageData(output.canvas.width, output.canvas.height)

    for(let i = 0; i < segments.length; i++)
    {
        for(let j = 0; j < segments[i].data.length; j++)
        {
            for(let k = 0; k < segments[i].data[j].length; k++)
            {
                newImage.data[j + segments[i].yMin][k + segments[i].xMin] = [
                    segments[i].data[j][k][0],
                    segments[i].data[j][k][1],
                    segments[i].data[j][k][2],
                    segments[i].data[j][k][3]
                ];
            }
        }
    }

    let temp_ImageData = new ImageData(output.canvas.width, output.canvas.height);
    temp_ImageData.data.set(newImage.getUint8Array());
    output.putImageData(temp_ImageData, 0, 0);

}

//call main to start the script.
main();