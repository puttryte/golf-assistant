import TestImages from "../TestImages/TestImages.js";
import MyImageData from "./MyImageData.js";
import ImageProcessing from "./ImageProcessing.js"
import KMeans from "./KMeans.js";
import Segment from "./Segment.js"

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
var numOfErosion = 2;
var numOfDilation = 2;

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

        // ImageProcessing.CombineImageData(kMeansImageDatas[1].data, kMeansImageDatas[2].data);
        // kMeansImageDatas.splice(2,1);

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
        let temp_ImageData2 = ctxs[7].getImageData(0,0,size[0], size[1]);
        ctxs[9].putImageData(temp_ImageData2, 0, 0)


        for(let j = 0; j < segments.length; j++)
        {
            let segment = segments[j];
            let output =  Test(segment);

            let houghImage = output[0];

            canvases[8].width = houghImage.width * 2;
            canvases[8].height = houghImage.height * 2;
            ctxs[8] = canvases[8].getContext('2d');

            let temp_ImageData = new ImageData(houghImage.width, houghImage.height);
            temp_ImageData.data.set(houghImage.getUint8Array());
            ctxs[8].putImageData(temp_ImageData, 0, 0)

            ctxs[8].beginPath();
            ctxs[8].lineWidth = ".5";
            ctxs[8].strokeStyle = "blue";
            ctxs[8].moveTo(0, houghImage.height / 2);
            ctxs[8].lineTo(houghImage.width, houghImage.height / 2);
            ctxs[8].moveTo(houghImage.width / 2, 0);
            ctxs[8].lineTo(houghImage.width / 2, houghImage.height);
            ctxs[8].stroke()

            ctxs[8].scale(2, 2)
            ctxs[8].drawImage(canvases[8],0, 0)

            let peaks = output[1];
            console.log(peaks)

            for(let i = 0; i < peaks.length; i++)
            {
                let peak = peaks[i];
                let r = peak[0];
                let angle = peak[1];
                let rad = (angle) * (Math.PI / 180);
                let x = r * Math.cos(rad) + segment.xMin;
                let y = r * Math.sin(rad) + segment.yMin;

                ctxs[9].beginPath();
                ctxs[9].lineWidth = "1";
                ctxs[9].strokeStyle = "red";
                ctxs[9].moveTo(x, y);
                //ctxs[9].lineTo(x +  100, y);
                let l = 0
                if(angle < 0)
                {
                    angle += 90;
                    l = segment.width;
                }
                else
                {
                    angle -= 90;
                    l = segment.height;
                }

                ctxs[9].lineTo(x + Math.cos((angle) * (Math.PI / 180)) * l, y + ((angle) * (Math.PI / 180)) * l);
                ctxs[9].stroke()
            }
        }

        //record time
        console.log("After analyzing all segments: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        ////#region for testing
        // let test2 = 0;

        // console.log(segments.length)
        // for(let i = 0; i < segments[test2].data.length; i++)
        // {
        //     for(let j = 0; j < segments[test2].data[i].length; j++)
        //     {
        //         if(segments[test2].data[i][j][0] == 255)
        //         {
        //             kMeansImageDatas[1].data[i + segments[test2].yMin][j + segments[test2].xMin] = [255, 255, 255, 255];
        //         }
        //     }
        // }

        // for(let i = 0; i < segments.length; i++)
        // {
        //     tempCtx.beginPath();
        //     tempCtx.lineWidth = "2";
        //     tempCtx.strokeStyle = "red";
        //     tempCtx.rect(segments[i].xMin, segments[i].yMin, segments[i].xMax - segments[i].xMin, segments[i].yMax - segments[i].yMin);
        //     tempCtx.stroke();
        // }

        // let test = tempCtx.getImageData(0, 0, size[0], size[1]);
        // ctxs[2].putImageData(test, 0, 0);
        
        // tempImageData.data.set(kMeansImageDatas[1].getUint8Array());
        // ctxs[8].putImageData(tempImageData, 0, 0);
        // //#endregion

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

//recursive version
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

        // let out = [];

        // ImageProcessing.Erosion(topSegmentImageData, 1);
        // ImageProcessing.Dilation(topSegmentImageData, 1)

        // ImageProcessing.Erosion(bottomSegmentImageData, 1);
        // ImageProcessing.Dilation(bottomSegmentImageData, 1)

        // let test = GetSegments(topSegmentImageData);
        // let test2 = GetSegments(bottomSegmentImageData);

        // out.push(test2)
        // console.log(test)
        // console.log(test2)

        let topSegment = new Segment(topSegmentImageData, segment.xMin, segment.yMin, segment.xMax, segment.yMin + cutoff);
        let bottomSegment = new Segment(bottomSegmentImageData, segment.xMin, segment.yMin + cutoff + 1, segment.xMax, segment.yMax);

        return [topSegment, bottomSegment];

        // console.log(bottomSegment)
        // out.push(bottomSegment)
        // return out;
    }
    else
    {   
        console.log("PORTRAIT")
    }



}

function Test(segment)
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
            accumulator.push([angles[j], distance]);
        }
    }
    
    let houghImage = new MyImageData(angles.length, maxDistance * 2);
    let max = 0;
    
    for(let i = 0; i < accumulator.length; i++)
    {
        let col = accumulator[i][1] + maxDistance;
        let row = accumulator[i][0] + 90;

        houghImage.data[col][row][0] += 1;
        houghImage.data[col][row][1] += 1;
        houghImage.data[col][row][2] += 1;

        if(houghImage.data[col][row][0] > max)
        {
            max = houghImage.data[col][row][0];
        }
    }

    let scale = 255 / max;
    let peakthreshold = 255 * (90/ 100);
    let peaks = [];

    for(let i = 0; i < houghImage.data.length; i++)
    {
        for(let j = 0; j < houghImage.data[i].length; j++)
        {
            if(houghImage.data[i][j][0] > 0)
            {
                houghImage.data[i][j][0] *= scale;
                houghImage.data[i][j][1] *= scale;
                houghImage.data[i][j][2] *= scale;

                if(houghImage.data[i][j][0] > peakthreshold)
                {
                    console.log(houghImage.data[i][j][0], i - maxDistance, j - 90)
                    houghImage.data[i][j][0] = 255;
                    houghImage.data[i][j][1] = 0;
                    houghImage.data[i][j][2] = 0;

                    peaks.push([i - maxDistance, j - 90]);
                }
            }
        }
    }

    return [houghImage, peaks];
}
//call main to start the script.
main();     