import TestImages from "../TestImages/TestImages.js";
import MyImageData from "./MyImageData.js";
import ImageProcessing from "./ImageProcessing.js";
import KMeans from "./KMeans.js";
import Segment from "./Segment.js";
import HoughTransform from "./HoughTransform.js";

//for keeping up a record of time of each processes.
var startTime = Date.now();
var currentTime = Date.now();

//easier access for the html canvases
var canvases;
var ctxs;

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
    //set up the drop selection base on the TestImages.js
    var mySelect = document.getElementById("testImage");

    for (let i = 0; i < TestImages.images.length; i++)
    {
        let option = document.createElement("option");
        option.value = i;
        option.text = TestImages.images[i].name;
        mySelect.add(option);
    }

    //set the default value of the drop selection
    mySelect.value = 6;

    //declare a behavior of the apply button
    document.getElementById("applybtn").addEventListener('click', Apply);

    canvases = document.getElementsByTagName("canvas");
    ctxs = new Array(canvases.length);

    //start the proccess with the default image 
    Apply();
}

//fuction gets trigger when the apply button is pressed.
function Apply()
{ 
    //for record timing purposes
    console.clear();
    startTime = Date.now();
    currentTime = Date.now();

    //get the image selected and declare the image variable.
    let mySelect = document.getElementById("testImage");
    let image = new Image();
    image.src = TestImages.images[mySelect.value].source;

    //start the function when the image is done loading
    image.onload = function()
    {
        //scale the image
        let size = ImageProcessing.GetImageScale(image.width, image.height, imageSize);

        //using the dimension of scaled image, scale all the canvases.
        for(let i = 0; i < canvases.length; i++)
        {
            canvases[i].width = size[0];
            canvases[i].height = size[1];
            ctxs[i] = canvases[i].getContext('2d');
            ctxs[i].imageSmoothinEnabled = true;
        }

        //set one canvas in memory so all other canvases are for output only
        let tempCanvas = document.createElement("canvas");
        tempCanvas.width = size[0];
        tempCanvas.height = size [1];

        //set up context
        let tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.drawImage(image, 0, 0, size[0], size[1]);

        //get image data
        let imageData = new MyImageData(
            size[0],
            size[1],
            tempCtx.getImageData(0, 0, size[0], size[1]).data
        )

        //used for output
        let tempImageData = new ImageData(size[0], size[1]);

        //convert image data to Uint8ClampedArray then output to canvas
        tempImageData.data.set(imageData.getUint8Array());
        ctxs[0].putImageData(tempImageData, 0, 0);

        //record time
        console.log("Showing Original Image: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //normalize the image's brighness level
        ImageProcessing.NormalizeImageBrightness(imageData, normalBrightness);

        //convert image data to Uint8ClampedArray then output to canvas
        tempImageData.data.set(imageData.getUint8Array());
        ctxs[1].putImageData(tempImageData, 0, 0);

        //record time.
        console.log("After normalizing the image: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //get the selected colorspace to use, defaulted to CMYK
        let colorSpace = parseInt(document.getElementById("colorSpace").value);
        let kMeansImageDatas = KMeans.ProcessImage(imageData, colorSpace, cluster, iteration);

        //convert image data to Uint8ClampedArray then output to canvas
        tempImageData.data.set(kMeansImageDatas[0].getUint8Array());
        ctxs[3].putImageData(tempImageData, 0, 0);

        tempImageData.data.set(kMeansImageDatas[1].getUint8Array());
        ctxs[4].putImageData(tempImageData, 0, 0);

        tempImageData.data.set(kMeansImageDatas[2].getUint8Array());
        ctxs[5].putImageData(tempImageData, 0, 0);
        
        //record time.
        console.log("After K-means Algorithm: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        // //denoise the image.
        // //erode the image and inflate it.
        // //pixels with radius equal to the numOfErosion should disappears.
        ImageProcessing.Erosion(kMeansImageDatas[1], numOfErosion);
        ImageProcessing.Dilation(kMeansImageDatas[1], numOfDilation);

        //convert image data to Uint8ClampedArray then output to canvas
        tempImageData.data.set(kMeansImageDatas[1].getUint8Array());
        ctxs[6].putImageData(tempImageData, 0, 0);

        //record time
        console.log("After Denoising Clusters: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //mophological closing
        //infate it then erode it back
        //any holes or cravases would get smaller by the number equal to the numOfDilation
        ImageProcessing.Dilation(kMeansImageDatas[1], numOfDilation);
        ImageProcessing.Erosion(kMeansImageDatas[1], numOfErosion);

        //convert image data to Uint8ClampedArray then output to canvas
        tempImageData.data.set(kMeansImageDatas[1].getUint8Array());
        ctxs[7].putImageData(tempImageData, 0, 0);

        //record time
        console.log("After Morphologically Closing: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //sepated the golf ball and the putter
        //HorizontalSeparation(ctxs[7], ctxs[9], ctxs[10]);
        let segments = GetSegments(kMeansImageDatas[1]);

        //record time
        console.log("After Getting all the segments: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //checks segments length for analysis

        if(segments.length == 0)
        {
            console.log("-----> No Object Dectected!");
        }
        else if(segments.length > 2)
        {
            segments = IsolateSegments(segments, size[0] / 3, size[0] * 2 / 3)
        }

        if(segments.length == 1)
        {
            let houghCircleOutput = HoughCircleTranform(segments[0], Math.round((segments[0].height) / 4));
            let houghLineOutput = HoughLineTranform(segments[0])

            let peaks1 = HoughTransform.GetHoughCirclePeaks(houghCircleOutput , 0.99, 5);
            let peaks2 = HoughTransform.GetHoughLinePeaks(houghLineOutput , 0.65, 5);

            HoughTransform.TestAnalysis2(ctxs[10], houghCircleOutput, peaks1);
            HoughTransform.TestAnalysis(ctxs[11], houghLineOutput , peaks2);

            HoughTransform.ShowHoughCircle(ctxs[0], ctxs[2], segments[0], peaks1, Math.round((segments[0].height) / 4));
            HoughTransform.ShowHoughLines(ctxs[2], ctxs[2], segments[0], peaks2);
        }
        else if(segments.length == 2)
        {
            let houghCircleOutput = HoughCircleTranform(segments[0], Math.round((segments[0].height) / 2));
            let houghLineOutput = HoughLineTranform(segments[1])

            let peaks1 = HoughTransform.GetHoughCirclePeaks(houghCircleOutput , 0.99, 5);
            let peaks2 = HoughTransform.GetHoughLinePeaks(houghLineOutput , 0.75, 5);

            HoughTransform.TestAnalysis2(ctxs[10], houghCircleOutput, peaks1);
            HoughTransform.TestAnalysis(ctxs[11], houghLineOutput , peaks2);

            HoughTransform.ShowHoughCircle(ctxs[0], ctxs[2], segments[0], peaks1, Math.round((segments[0].height) / 2));
            HoughTransform.ShowHoughLines(ctxs[2], ctxs[2], segments[1], peaks2);
        }
        else
        {
            console.log("-----> More Than 3 objects detected!")
        }

        ShowBorderAndSegment(ctxs[7], ctxs[8], size[0] / 3, size[0] * 2 / 3, segments)
        ShowSegments(ctxs[9], segments);

        //record time
        console.log("After analyzing all segments: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        tempImageData = ctxs[2].getImageData(0, 0, size[0], size[1]);
        tempCtx.putImageData(tempImageData, 0, 0);

        for(let i = 0; i < segments.length; i++)
        {
            tempCtx.beginPath();
            tempCtx.lineWidth = "1";
            tempCtx.strokeStyle = "white";
            tempCtx.rect(segments[i].xMin, segments[i].yMin, segments[i].xMax - segments[i].xMin, segments[i].yMax - segments[i].yMin);
            tempCtx.stroke();
        }
        
        ctxs[2].putImageData(tempCtx.getImageData(0, 0, size[0], size[1]), 0, 0);

        console.log("Total time: " + (Date.now() - startTime) + " miliseconds")
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
            if(source.data[i][j][0] == 255)
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
                        if(segmentImageData.data[a][b][0] == 255)
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

            if(dir == 0)
            {
                x -= 1;
                y -= 1;
            }
            else if(dir == 1)
            {
                y -= 1;
            }
            else if(dir == 2)
            {
                x += 1;
                y -= 1;
            }
            else if(dir == 3)
            {
                x += 1;
            }
            else if(dir == 4)
            {
                x += 1;
                y += 1;
            }
            else if(dir == 5)
            {
                y += 1;
            }
            else if(dir == 6)
            {
                x -= 1;
                y += 1;
            }
            else if(dir == 7)
            {
                x -= 1;
            }

            if(source.data[y][x][0] == 255)
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
    while(!(start[0] == current[0] && start[1] == current[1]))

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
            if(segment.data[i][j][0] == 255)
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
                if(topSegmentImageData.data[i][j][0] == 255)
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
    let out = []

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
    output.strokeStyle = "red";
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

function HoughLineTranform(segment)
{
    let width = segment.width;
    let height = segment.height;

    let angles = []
    let accumulator = [];
    let edges = [];
    let startPixel = -1;
    let maxDistance = Math.round(Math.sqrt((width * width) + (height * height)));

    for(let i = -90; i <= 89; i++)
    {
        angles.push(i);
    }

    for(let i = 0; i < segment.height; i++)
    {
        for(let j = 0; j < segment.width; j++)
        {
            if(segment.data[i][j][0] == 255)
            {
                startPixel = [i, j];
                break;
            }
        }
        if(startPixel != -1)
        {
            break;
        }
    }
    
    edges = GetEdge(segment, startPixel);

    for(let i = 0; i < edges.length; i++)
    {
        let x = edges[i][1];
        let y = edges[i][0];

        for(let j = 0; j < angles.length; j++)
        {
            let theta = angles[j] * (Math.PI/180);
            let distance = Math.round((x * Math.cos(theta)) + (y * Math.sin(theta)));
            accumulator.push([angles[j], distance, x, y]);
        }
    }
    
    let output = new Array(maxDistance * 2);

    for(let i = 0; i < output.length; i++)
    {
        output[i] = new Array(angles.length).fill(0);
    }

    for(let i = 0; i < accumulator.length; i++)
    {
        let col = accumulator[i][1] + maxDistance;
        let row = accumulator[i][0] + 90;

        output[col][row] += 1;
    }

    return output;
}

//#region Hough line transform image output version
// function HoughLineTranform(segment)
// {
//     let width = segment.width;
//     let height = segment.height;

//     let angles = []
//     let accumulator = [];
//     let edges = [];
//     let startPixel = -1;
//     let maxDistance = Math.round(Math.sqrt((width * width) + (height * height)));

//     for(let i = -90; i <= 89; i++)
//     {
//         angles.push(i);
//     }

//     for(let i = 0; i < segment.height; i++)
//     {
//         for(let j = 0; j < segment.width; j++)
//         {
//             if(segment.data[i][j][0] == 255)
//             {
//                 startPixel = [i, j];
//                 break;
//             }
//         }
//         if(startPixel != -1)
//         {
//             break;
//         }
//     }
    
//     edges = GetEdge(segment, startPixel);

//     for(let i = 0; i < edges.length; i++)
//     {
//         let x = edges[i][1];
//         let y = edges[i][0];

//         for(let j = 0; j < angles.length; j++)
//         {
//             let theta = angles[j] * (Math.PI/180);
//             let distance = Math.round((x * Math.cos(theta)) + (y * Math.sin(theta)));
//             accumulator.push([angles[j], distance]);
//         }
//     }
    
//     let houghImage = new MyImageData(angles.length, maxDistance * 2);
//     let max = 0;
    
//     for(let i = 0; i < accumulator.length; i++)
//     {
//         let col = accumulator[i][1] + maxDistance;
//         let row = accumulator[i][0] + 90;

//         houghImage.data[col][row][0] += 1;
//         houghImage.data[col][row][1] += 1;
//         houghImage.data[col][row][2] += 1;

//         if(houghImage.data[col][row][0] > max)
//         {
//             max = houghImage.data[col][row][0];
//         }
//     }

//     let scale = 255 / max;
//     let peakthreshold = 255 * (90/ 100);
//     let peaks = [];

//     for(let i = 0; i < houghImage.data.length; i++)
//     {
//         for(let j = 0; j < houghImage.data[i].length; j++)
//         {
//             if(houghImage.data[i][j][0] > 0)
//             {
//                 houghImage.data[i][j][0] *= scale;
//                 houghImage.data[i][j][1] *= scale;
//                 houghImage.data[i][j][2] *= scale;

//                 if(houghImage.data[i][j][0] > peakthreshold && Math.abs(j-90) > 80)
//                 {
//                     console.log(houghImage.data[i][j][0], i - maxDistance, j - 90)
//                     houghImage.data[i][j][0] = 255;
//                     houghImage.data[i][j][1] = 0;
//                     houghImage.data[i][j][2] = 0;

//                     peaks.push([i - maxDistance, j - 90]);
//                 }
//             }
//         }
//     }

//     return [houghImage, peaks];
// }
//#endregion

function HoughCircleTranform(segment, radius)
{
    let width = segment.width;
    let height = segment.height;
    let angles = []
    let edges = [];
    let accumulator = new Array(height+ (2 * radius));
    let startPixel = -1;

    for(let i = 0; i < accumulator.length; i++)
    {
        accumulator[i] = new Array(width + (2 * radius)).fill(0);
    }

    for(let i = 0; i <= 359; i++)
    {
        angles.push(i);
    }

    for(let i = 0; i < segment.height; i++)
    {
        for(let j = 0; j < segment.width; j++)
        {
            if(segment.data[i][j][0] == 255)
            {
                startPixel = [i, j];
                break;
            }
        }
        if(startPixel != -1)
        {
            break;
        }
    }

    edges = GetEdge(segment, startPixel);

    for(let i = 0; i < edges.length; i++)
    {
        let a = edges[i][1] + radius;
        let b = edges[i][0] + radius;

        for(let j = 0; j < angles.length; j++)
        {
            let theta = angles[j] * (Math.PI/180);
            let x = Math.round(a - (radius * Math.cos(theta)));
            let y = Math.round(b - (radius * Math.sin(theta)));
            accumulator[y][x] += 1;

        }
    }

    return accumulator;
}

function GetHoughLinePeaks(accumulator, peakThreshold, peakRange)
{
    let peaks = [];
    let max = 0;
    let threshold = 0;
    let maxDistance = accumulator.length / 2;
    
    for(let i = 0; i < accumulator.length; i++)
    {
        for(let j = 0; j < accumulator[i].length; j++)
        {
            if(accumulator[i][j] > max)
            {
                max = accumulator[i][j];
            }
        }
    }

    threshold = max * peakThreshold;

    for(let i = 0; i < accumulator.length; i++)
    {
        for(let j = 0; j < accumulator[i].length; j++)
        {
            if(accumulator[i][j] > threshold)
            {
                peaks.push([i, j]);
            }
        }
    }

    for(let i = 0; i < peaks.length; i++)
    {
        for(let j = i + 1; j < peaks.length; j++)
        {
            let y = Math.abs(peaks[i][0] - peaks[j][0]);
            let x = Math.abs(peaks[i][1] - peaks[j][1]);

            if(x < peakRange && y < peakRange)
            {
                peaks.splice(j - 1, 1);
                j--
            }
        }
    }

    for(let i = 0; i < peaks.length; i++)
    {
        peaks[i][0] = peaks[i][0] - maxDistance;
        peaks[i][1] = peaks[i][1] - 90;
    }

    return peaks;
}

function GetHoughCirclePeaks(accumulator, peakThreshold, peakRange)
{
    let peaks = [];
    let max = 0;
    let threshold = 0;
    
    for(let i = 0; i < accumulator.length; i++)
    {
        for(let j = 0; j < accumulator[i].length; j++)
        {
            if(accumulator[i][j] > max)
            {
                max = accumulator[i][j];
            }
        }
    }

    threshold = max * peakThreshold;

    for(let i = 0; i < accumulator.length; i++)
    {
        for(let j = 0; j < accumulator[i].length; j++)
        {
            if(accumulator[i][j] > threshold)
            {
                peaks.push([i, j]);
            }
        }
    }

    for(let i = 0; i < peaks.length; i++)
    {
        for(let j = i + 1; j < peaks.length; j++)
        {
            let y = Math.abs(peaks[i][0] - peaks[j][0]);
            let x = Math.abs(peaks[i][1] - peaks[j][1]);

            if(x < peakRange && y < peakRange)
            {
                peaks.splice(j - 1, 1);
                j--
            }
        }
    }

    return peaks;
}

function ShowHoughLines(source, output, segment, lineDatas)
{
    let temp_ImageData = source.getImageData(0, 0, source.canvas.width, source.canvas.height);
    output.putImageData(temp_ImageData, 0, 0);

    for(let i = 0; i < lineDatas.length; i++)
    {
        let r = lineDatas[i][0];
        let angle = lineDatas[i][1];
        let lineLength = segment.width;
    
        let x = segment.xMin + (r * Math.cos(angle * (Math.PI / 180)));
        let y = segment.yMin + (r * Math.sin(angle * (Math.PI / 180)));

        if(angle < 0)
        {
            angle += 90;
        }
        else
        {
            angle -= 90;
        }

        let a = x + (lineLength * Math.cos(angle * (Math.PI / 180)))
        let b = y + (lineLength * Math.sin(angle * (Math.PI / 180)))

        output.beginPath();
        output.lineWidth = '1';
        output.strokeStyle = 'red';
        output.moveTo(x, y);
        output.lineTo(a, b);
        output.stroke()
    }
}

function ShowHoughCircle(source, output, segment, lineDatas, radius)
{
    let temp_ImageData = source.getImageData(0, 0, source.canvas.width, source.canvas.height);
    output.putImageData(temp_ImageData, 0, 0);

    for(let i = 0; i < lineDatas.length; i++)
    {
        let x = lineDatas[i][1] + segment.xMin - radius;
        let y = lineDatas[i][0] + segment.yMin - radius;

        output.beginPath();
        output.lineWidth = '1';
        output.strokeStyle = 'red';
        output.arc(x, y, radius, 0, 2 * Math.PI);
        output.stroke()
    }
}

function TestAnalysis(houghImageOutput, accum, peaks)
{
    let newImage = new MyImageData(accum[0].length, accum.length)
    let max = 0;

    for(let i = 0; i < accum.length; i++)
    {
        for(let j = 0; j < accum[i].length; j++)
        {
            if(accum[i][j] > max)
            {
                max = accum[i][j];
            }
        }
    }

    let scale = 255 / max;

    for(let i = 0; i < accum.length; i++)
    {
        for(let j = 0; j < accum[i].length; j++)
        {
            //console.log(i, j)
            let color = accum[i][j] * scale;
            newImage.data[i][j][0] = color;
            newImage.data[i][j][1] = color;
            newImage.data[i][j][2] = color;
        }
    }

    for(let i = 0; i < peaks.length; i++)
    {
        newImage.data[peaks[i][0] + (accum.length / 2)][peaks[i][1] + 90] = [255, 0, 0, 255];
    }

    houghImageOutput.canvas.width = newImage.width;
    houghImageOutput.canvas.height = newImage.height;
    houghImageOutput = houghImageOutput.canvas.getContext('2d');
    let temp_ImageData = new ImageData(newImage.width, newImage.height);
    temp_ImageData.data.set(newImage.getUint8Array());
    houghImageOutput.putImageData(temp_ImageData, 0, 0);
}

function TestAnalysis2(houghImageOutput, accum, peaks)
{
    let newImage = new MyImageData(accum[0].length, accum.length)
    console.log(newImage)
    let max = 0;

    for(let i = 0; i < accum.length; i++)
    {
        for(let j = 0; j < accum[i].length; j++)
        {
            if(accum[i][j] > max)
            {
                max = accum[i][j];
            }
        }
    }

    let scale = 255 / max;

    for(let i = 0; i < accum.length; i++)
    {
        for(let j = 0; j < accum[i].length; j++)
        {
            let color = accum[i][j] * scale;
            newImage.data[i][j][0] = color;
            newImage.data[i][j][1] = color;
            newImage.data[i][j][2] = color;
        }
    }

    
    for(let i = 0; i < peaks.length; i++)
    {
        newImage.data[peaks[i][0]][peaks[i][1]] = [255, 0, 0, 255];
    }


    houghImageOutput.canvas.width = newImage.width;
    houghImageOutput.canvas.height = newImage.height;
    houghImageOutput = houghImageOutput.canvas.getContext('2d');
    let temp_ImageData = new ImageData(newImage.width, newImage.height);
    temp_ImageData.data.set(newImage.getUint8Array());
    houghImageOutput.putImageData(temp_ImageData, 0, 0);
}

//call main to start the script.
main();     