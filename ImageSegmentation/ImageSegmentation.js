import TestImages from "../TestImages/TestImages.js";
import ImageProcessing from "./ImageProcessing.js";
import KMeans from "./KMeans.js";

var startTime = Date.now();
var currentTime = Date.now();

var canvases;
var ctxs;
var imageSize = 300;

var normalBrightness = 80;

var cluster = 2;
var iteration = 10;

var numOfErosion = 1;
var numOfDilation = 1;


function main()
{
    var mySelect = document.getElementById("testImage");

    for (let i = 0; i < TestImages.images.length; i++)
    {
        let option = document.createElement("option");
        option.value = i;
        option.text = TestImages.images[i].name;
        mySelect.add(option);
    }

    mySelect.value = 6;

    document.getElementById("applybtn").addEventListener('click', Apply);

    canvases = document.getElementsByTagName("canvas");
    ctxs = new Array(canvases.length);

    Apply();
}

function Apply()
{ 
    console.clear();
    startTime = Date.now();
    currentTime = Date.now();

    let mySelect = document.getElementById("testImage");
    let image = new Image();
    image.src = TestImages.images[mySelect.value].source;

    image.onload = function()
    {
        let size = ImageProcessing.GetImageScale(image.width, image.height, imageSize);

        for(let i = 0; i < canvases.length; i++)
        {
            canvases[i].width = size[0];
            canvases[i].height = size[1];
            ctxs[i] = canvases[i].getContext('2d');
            ctxs[i].imageSmoothinEnabled = true;
        }

        ctxs[0].drawImage(image, 0, 0, size[0], size[1]);

        console.log("Showing Original Image: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        ImageProcessing.NormalizeImageBrightness(ctxs[0], ctxs[1], normalBrightness);

        console.log("After normalizing the image: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        let temp_ctxs = [
            ctxs[1],
            ctxs[3],
            ctxs[4],
            ctxs[5]
        ]

        let colorSpace = parseInt(document.getElementById("colorSpace").value);

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

        console.log("After K-means Algorithm: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        ImageProcessing.Erosion(ctxs[4], ctxs[6], numOfErosion);
        ImageProcessing.Dilation(ctxs[6], ctxs[6], numOfDilation);

        console.log("After Denoising Clusters: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        ImageProcessing.Dilation(ctxs[6], ctxs[7], numOfDilation);
        ImageProcessing.Erosion(ctxs[7], ctxs[7], numOfErosion);

        console.log("After Morphologically Closing: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        HorizontalSeparation(ctxs[7], ctxs[9], ctxs[10]);

        ImageProcessing.Erosion(ctxs[9], ctxs[9], 2);
        ImageProcessing.Dilation(ctxs[9], ctxs[9], 2);

        ImageProcessing.Erosion(ctxs[10], ctxs[10], 2);
        ImageProcessing.Dilation(ctxs[10], ctxs[10], 2);

        InvertCanvasBW(ctxs[7], ctxs[8]);

        ApplyMask(ctxs[0], ctxs[8], ctxs[11]);
        ApplyMask(ctxs[0], ctxs[9], ctxs[12]);
        ApplyMask(ctxs[0], ctxs[10], ctxs[13]);

        console.log("After Separating Objects: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        ctxs[2].drawImage(image, 0, 0, size[0], size[1]);
        BoundingBox(ctxs[9], ctxs[2], 1);
        BoundingBox(ctxs[10], ctxs[2], 0);

        console.log("Showing Bounding Box: " + (Date.now() - currentTime) + " miliseconds")
        currentTime = Date.now();

        console.log("Total time: " + (Date.now() - startTime) + " miliseconds")
    }
}

function HorizontalSeparation(source, ctx1, ctx2)
{
    let width = source.canvas.clientWidth;
    let height = source.canvas.clientHeight;
    let row = width * 4;

    let imageData = source.getImageData(0, 0, width, height);

    let verticalCount = new Array(width).fill(0);

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

    for(let i = 0; i < verticalCount.length; i++)
    {
        if(verticalCount[i] != 0)
        {
            start = i;
            break;
        }
    }

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

    for(let i = start; i <= end; i++)
    {
        total += verticalCount[i];
        count++;

        if(i > (start + 10))
        {
            if((total / count) / verticalCount[i+1] < 0.5)
            {
                index = i;
                break;
            }
        }
    }

    ctx1.putImageData(imageData, 0, 0)

    ctx1.beginPath();
    ctx1.lineWidth = "1";
    ctx1.strokeStyle = "black";
    ctx1.rect(index, 0, (width - index), height);
    ctx1.fill();
    ctx1.stroke();

    ctx2.putImageData(imageData, 0, 0)

    ctx2.beginPath();
    ctx2.lineWidth = "1";
    ctx2.strokeStyle = "black";
    ctx2.rect(0, 0, index, height);
    ctx2.fill();
    ctx2.stroke();
}

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

function GetBBCoor(source)
{
    let x1, x2, y1, y2;

    let width = source.canvas.clientWidth;
    let height = source.canvas.clientHeight;
    let row = width * 4;

    let maskData = source.getImageData(0, 0, width, height);

    let verticalCount = new Array(width).fill(0);
    let horizontalCount = new Array(height).fill(0);

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

main();     