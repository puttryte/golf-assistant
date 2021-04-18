import TestImages from "../TestImages/TestImages.js";
import ImageProcessing from "./ImageProcessing.js";
import KMeans from "./KMeans.js";

//for keeping up a record of time of each processes.
var startTime = Date.now();
var currentTime = Date.now();

//easier access for the html canvases
var canvases;
var ctxs;

//base size of each image while keeping the image ratio
//the bigger the base the more pixels it would have to process
//a very small base would make the process inaccurate
var imageSize = 200;

//the average brightness of each image will have before going through the process
var normalBrightness = 80;

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

        //output the original image
        ctxs[0].drawImage(image, 0, 0, size[0], size[1]);

        //record time
        console.log("Showing Original Image: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //normalize the image's brighness level
        ImageProcessing.NormalizeImageBrightness(ctxs[0], ctxs[1], normalBrightness);

        //record time.
        console.log("After normalizing the image: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //preset canvases to use.
        let temp_ctxs = [
            ctxs[1], //normal image:    source
            ctxs[3], //kmeans image:    output
            ctxs[4], //cluster 1 image: output
            ctxs[5]  //cluster 2 image: output
        ]

        //get the selected colorspace to use, defaulted to CMYK
        let colorSpace = parseInt(document.getElementById("colorSpace").value);

        //call kmeans algorithm.
        //author' note: could refactor the his into one function but it easier and faster to have 3 copied modified a little bit.
        switch(colorSpace)
        {
            case 0:
                KMeans.ProcessImageRGB(temp_ctxs, cluster, iteration);
                break;
            case 1:
                KMeans.ProcessImageCMYK(temp_ctxs, cluster, iteration);
                break;
            case 2:
                KMeans.ProcessImageHSV(temp_ctxs, cluster, iteration);
                break;
        }

        //record time.
        console.log("After K-means Algorithm: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //denoise the image.
        //erode the image and inflate it.
        //pixels with radius equal to the numOfErosion should disappears.
        ImageProcessing.Erosion(ctxs[4], ctxs[6], numOfErosion);
        ImageProcessing.Dilation(ctxs[6], ctxs[6], numOfDilation);

        //record time

        console.log("After Denoising Clusters: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //mophological closing
        //infate it then erode it back
        //any holes or cravases would get smaller by the number equal to the numOfDilation
        ImageProcessing.Dilation(ctxs[6], ctxs[7], numOfDilation);
        ImageProcessing.Erosion(ctxs[7], ctxs[7], numOfErosion);

        //record time
        console.log("After Morphologically Closing: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //sepated the golf ball and the putter
        HorizontalSeparation(ctxs[7], ctxs[9], ctxs[10]);

        console.log("After Separating Objects: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //denoise the separated parts
        ImageProcessing.Erosion(ctxs[9], ctxs[9], 2);
        ImageProcessing.Dilation(ctxs[9], ctxs[9], 2);

        ImageProcessing.Erosion(ctxs[10], ctxs[10], 2);
        ImageProcessing.Dilation(ctxs[10], ctxs[10], 2);

        //get the grass mask
        InvertCanvasBW(ctxs[7], ctxs[8]);

        //record time.
        console.log("After prossecing the masks: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //get the original images masked parts.
        ApplyMask(ctxs[0], ctxs[8], ctxs[11]);
        ApplyMask(ctxs[0], ctxs[9], ctxs[12]);
        ApplyMask(ctxs[0], ctxs[10], ctxs[13]);

        //recode time.
        console.log("After applying the masks: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //apply a bounding box based the mask.
        ctxs[2].drawImage(image, 0, 0, size[0], size[1]);
        BoundingBox(ctxs[9], ctxs[2], 1);
        BoundingBox(ctxs[10], ctxs[2], 0);

        //record time
        console.log("Showing Bounding Box: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        //record total time
        console.log("Total time: " + (Date.now() - startTime) + " miliseconds")
    }
}

//a brute for approach of separting the ball and the putter.
//only work in initial position of the put
//assume the golf is on the left and the putter is on the right.
//Parameter:source  : CanvasRenderingContext2D : input canvas
//          ctx1    : CanvasRenderingContext2D : output canvas
//          ctx2    : CanvasRenderingContext2D : output canvas
function HorizontalSeparation(source, ctx1, ctx2)
{
    //get the image dimensions
    let width = source.canvas.clientWidth;
    let height = source.canvas.clientHeight;
    let row = width * 4;

    //get the pixel data
    let imageData = source.getImageData(0, 0, width, height);

    let verticalCount = new Array(width).fill(0);

    //count each white pixel in a column
    for(let i = 0; i < imageData.data.length; i += row)
    {
        for(let j = i; j < (i + row); j += 4)
        {
            if(imageData.data[j] == 255)
            {
                verticalCount[(j % row)/4] += 1;
            }
        }
    }

    let start = 0;
    let end = 0;

    //get first instance of a white pixel
    //expects the left side of the ball
    for(let i = 0; i < verticalCount.length; i++)
    {
        if(verticalCount[i] != 0)
        {
            start = i;
            break;
        }
    }

    //get last instance of a white pixel
    //expects the right side of the putter
    for(let i = (verticalCount.length - 1); i > 0; i--)
    {
        if(verticalCount[i] != 0)
        {
            end = i;
            break;
        }
    }

    let total = 0;
    let count = 0;
    let index = 0;

    //try to predict where the ball end and the putter to start.
    //start of the left side of the ball and get the avarage white pixels per column.
    //if the next column is double the avarage, then that where the putter should be.
    for(let i = start; i <= end; i++)
    {
        total += verticalCount[i];
        count++;

        //dont check until the 11th column
        if(i > (start + 10))
        {
            if((total / count) / verticalCount[i+1] < 0.5)
            {
                index = i;
                break;
            }
        }
    }

    //black out the right of the prediction. for the ball.
    ctx1.putImageData(imageData, 0, 0)

    ctx1.beginPath();
    ctx1.lineWidth = "1";
    ctx1.strokeStyle = "black";
    ctx1.rect(index, 0, (width - index), height);
    ctx1.fill();
    ctx1.stroke();

    //black out the left side of the prediction fro the putter.
    ctx2.putImageData(imageData, 0, 0)

    ctx2.beginPath();
    ctx2.lineWidth = "1";
    ctx2.strokeStyle = "black";
    ctx2.rect(0, 0, index, height);
    ctx2.fill();
    ctx2.stroke();
}

//the funtion inverts a black and white(not grayscale) image
//Parameter:source  : CanvasRenderingContext2D : input canvas
//          ctx     : CanvasRenderingContext2D : output canvas
function InvertCanvasBW(source, ctx)
{
    let imageData = source.getImageData(0, 0, source.canvas.clientWidth, source.canvas.clientHeight);

    for(let i = 0; i < imageData.data.length; i += 4)
    {
        if(imageData.data[i] == 0)
        {
            imageData.data[i] = 255;
            imageData.data[i + 1] = 255;
            imageData.data[i + 2] = 255;
            continue;
        }

        if(imageData.data[i] == 255)
        {
            imageData.data[i] = 0;
            imageData.data[i + 1] = 0;
            imageData.data[i + 2] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0)
}

//the fuction used a black and white images(not grayscale) to mask another image
//the black parts will stay black while the white part will keep the source image's color.
//Parameter:source  : CanvasRenderingContext2D : input canvas
//          mask    : CanvasRenderingContext2D : input canvas
//          ctx     : CanvasRenderingContext2D : output canvas
function ApplyMask(source, mask, ctx)
{
    let imageData = source.getImageData(0, 0, source.canvas.clientWidth, source.canvas.clientHeight);
    let maskData = mask.getImageData(0, 0, mask.canvas.clientWidth, mask.canvas.clientHeight);

    for(let i = 0; i < maskData.data.length; i += 4)
    {
        if(maskData.data[i] == 255)
        {
            maskData.data[i] = imageData.data[i];
            maskData.data[i + 1] = imageData.data[i+1];
            maskData.data[i + 2] = imageData.data[i+2];
        }
    }

    ctx.putImageData(maskData, 0, 0)
}

//apply a bouding box around the white parts of a black and white (not grayscale) image
//mod parameter is for a box or a circle bounding "box"
//Parameter:mask    : CanvasRenderingContext2D : input canvas
//          ctx     : CanvasRenderingContext2D : output canvas
//          mod     : int                      : 0 for rectangle, 1 for circle
function BoundingBox(mask, ctx, mod)
{
    let coor = GetBBCoor(mask);

    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = "red";

    if(mod == 0)
    {
        ctx.rect(coor[0], coor[2], (coor[1] - coor[0]), (coor[3] - coor[2]));
    }
    else if (mod == 1)
    {
        let rad = (coor[3] - coor[2]) / 2;
        ctx.arc((coor[0] + rad), (coor[2] + rad), rad, 0, (2 * Math.PI) )
    }

    ctx.stroke();
}

//Get the top left and bottom right XY coordinates of the white parts of the mask
//Parameter:source  : CanvasRenderingContext2D  : input canvas
//Return   :        : Int Array                 : length of 4
function GetBBCoor(source)
{
    let x1, x2, y1, y2;

    let width = source.canvas.clientWidth;
    let height = source.canvas.clientHeight;
    let row = width * 4;

    let maskData = source.getImageData(0, 0, width, height);

    let verticalCount = new Array(width).fill(0);
    let horizontalCount = new Array(height).fill(0);

    //create a vertical and horizontal histogram
    for(let i = 0; i < maskData.data.length; i += row)
    {
        for(let j = i; j < (i + row); j += 4)
        {
            if(maskData.data[j] == 255)
            {
                verticalCount[(j % row)/4] += 1;
                horizontalCount[i / row] += 1;
            }
        }
    }

    for(let i = 0; i < verticalCount.length; i++)
    {
        if(verticalCount[i] != 0)
        {
            x1 = i;
            break;
        }
    }

    for(let i = 0; i < horizontalCount.length; i++)
    {
        if(horizontalCount[i] != 0)
        {
            y1 = i;
            break;
        }
    }

    for(let i = (verticalCount.length - 1); i >= 0; i--)
    {
        if(verticalCount[i] != 0)
        {
            x2 = i;
            break;
        }
    }
    
    for(let i = (horizontalCount.length - 1); i >= 0; i--)
    {
        if(horizontalCount[i] != 0)
        {
            y2 = i;
            break;
        }
    }

    return [x1, x2, y1, y2];
}

function TestSeparation(source, ctx, ctx1)
{
    let imgWidth = source.canvas.clientWidth;
    let imgHeight = source.canvas.clientHeight;
    let imageData = source.getImageData(0, 0, imgWidth, imgHeight);
    let copyData = source.getImageData(0, 0, imgWidth, imgHeight);
    let startPixel = 0;

    // Direction
    // [0] [1] [2]
    // [7] [X] [3]
    // [6] [5] [4]

    let directions = [
        (-1 * (imgWidth * 4) - 4),
        (-1 * (imgWidth * 4)),
        (-1 * (imgWidth * 4) + 4),
        (4),
        ((imgWidth * 4) + 4),
        ((imgWidth * 4)),
        ((imgWidth * 4) - 4),
        (-4)
    ];

    //turn the image into black
    for(let i = 0; i < copyData.data.length; i += 4)
    {
        copyData.data[i + 0] = 0;
        copyData.data[i + 1] = 0;
        copyData.data[i + 2] = 0;
        copyData.data[i + 3] = 255;
    }
    
    //get the first white pixel
    for(let i = 0; i < imageData.data.length; i += 4)
    {
        if(imageData.data[i] == 255)
        {
            startPixel = i;
            break;
        }
    }

    let currentPixel = startPixel;
    let direction = 0;
    let found = false;

    //Get the edge of the segment
    do
    {
        found = false;
        //turn the pixel to white
        copyData.data[currentPixel] = 255;
        copyData.data[currentPixel + 1] = 255;
        copyData.data[currentPixel + 2] = 255;

        while(!found)
        {
            //found the pixel on the direction
            if(imageData.data[currentPixel + directions[direction]] == 255)
            {
                found = true;
                currentPixel += directions[direction];

                //turn direction 135 degree counter clock wise
                direction -= 3;
                if(direction < 0)
                {
                    direction += 8;
                }
            }
            //turn clockwise
            else 
            {
                direction++;

                if(direction > 7)
                {
                    direction = 0;
                }
            }
        }
    }
    while(currentPixel != startPixel)

    //#region 
    // fill in the outline of the edge
    for(let i = 0; i < copyData.data.length; i += (imgWidth * 4))
    {
        let pixel = 0;
        let count = 0;
        let whitePixels = [];

        //find the points where the white pixels are in a row
        for(let j = i; j < (i + (imgWidth * 4)); j += 4)
        {
            if(copyData.data[j] == 255)
            {
                if(pixel == 0)
                {
                    pixel = j;
                }
                count++;
            }
            else if(pixel != 0)
            {
                whitePixels.push([pixel, count]);
                pixel = 0;
                count = 0;
            }
        }

        let fillInColor = [255, 0, 0];

        //find and fill in pairs of points
        while(whitePixels.length > 1)
        {
            let start = 0;
            let end = 0;

            //if the amount of points are even it is guaranteed the first and second are pairs
            if((whitePixels.length % 2) == 0)
            {
                start = whitePixels[0][0] + 4;
                end = whitePixels[1][0];

                if(whitePixels[0][1] > 1)
                {
                    start += (whitePixels[0][1] - 1) * 4;
                }

                fillIn(copyData, start, end, fillInColor);

                whitePixels.splice(0, 2);
            }
            //the amount of points are odd
            else 
            {
                if((whitePixels[1][1] + whitePixels[2][1]) == 2)
                {
                    whitePixels.splice(0, 1);
                }
                else if(whitePixels[0][1] == 1)
                {
                    let marker = whitePixels[1];
                    whitePixels.splice(1, 1, [marker[0], 1], [(marker[0] + 4), (marker[1] - 1)]);
                }
                else
                {
                    let marker = whitePixels[1];
                    whitePixels.splice(1, 1, [marker[0], 1], [(marker[0] + 4), (marker[1] - 1)]);
                }
            }
        }
    }
    //#endregion

    ctx.putImageData(copyData, 0, 0);
    ctx1.putImageData(imageData, 0, 0);
}

function fillIn(imageData, start, end, color)
{
    for(let i = start; start < end; start += 4)
    {
        imageData.data[start] = color[0];
        imageData.data[start + 1] = color[1];
        imageData.data[start + 2] = color[2];
    }
}

//call main to start the script.
main();     