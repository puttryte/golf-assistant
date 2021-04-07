import testImages from "../TestImages/TestImages.js";

// global variables 
var imgHeight;
var imgWidth;
var canvs;
var ctxs;
var imageBase = 0;
var patchSize = 0;
var magnitude = 0;

//for erosion/dilation a 3x3 white hit box
const hitMarker = [ 255, 255, 255, 
    255, 255, 255, 
    255, 255, 255];

//main function
function main()
{
    //sets up select DOM object
    var mySelect = document.getElementById("testImage");

    for (let i = 0; i < testImages.images.length; i++)
    {
        let option = document.createElement("option");
        option.value = i;
        option.text = testImages.images[i].name;
        mySelect.add(option);
    }

    mySelect.value = 6;

    //Add listener event to buttons
    document.getElementById("applybtn").addEventListener('click', Apply);
    document.getElementById("processbtn").addEventListener('click', ProcessImage);

    canvs = [
        document.querySelector('#canv0'),
        document.querySelector('#canv1'),
        document.querySelector('#canv2'),
        document.querySelector('#canv3'),
        document.querySelector('#canv4'),
        document.querySelector('#canv5'),
    ];

    //add lister event to the original image canvas
    canvs[0].addEventListener("click", SelectPatch);

    ctxs = new Array(canvs.length);

    //do a initial apply fuction
    Apply();
}

//function is triggered when the apply button is clicked
function Apply()
{
    //gets the initial value on the input DOM objects
    imageBase = parseInt(document.getElementById("imageSize").value);
    patchSize = parseInt(document.getElementById("patchSize").value);
    magnitude = parseInt(document.getElementById("magnitude").value);
    let testImage_Select = parseInt(document.getElementById("testImage").value);

    let img = new Image();
    img.src = testImages.images[testImage_Select].source;

    //loads selected image
    img.onload = function()
    {
        //scales the canvases to the images size input
        let dim = GetImageScale(img.width, img.height);

        imgWidth = dim[0];
        imgHeight = dim[1];

        //change the canvas sizes
        for(let i = 0; i < canvs.length; i++)
        {
            canvs[i].height = imgHeight;
            canvs[i].width = imgWidth;
            ctxs[i] = canvs[i].getContext('2d'); 
        }

        canvs[2].height = imageBase;
        canvs[2].width = imageBase;
        ctxs[2] = canvs[2].getContext('2d');

        //show the selected image to the first canvas
        ctxs[0].drawImage(img, 0, 0, imgWidth, imgHeight);
    }
}

//function applies the mask to the selected image.
//mask = canvas 2d context of the mask
//canvas = canvas 2d context of the canvas of the out
function ApplyMask(mask, canvas)
{
    //get the pixels of the selected image
    let imageData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);
    let image_Pixels = imageData.data;

    //get the pixels of the mask
    let maskData = mask.getImageData(0, 0, imgWidth, imgHeight);
    let mask_Pixels = maskData.data;

    //if mask's pixel is black, turn the images' pixel black
    for(let i = 0; i < image_Pixels.length; i += 4)
    {
        let sum = mask_Pixels[i] + mask_Pixels[i + 1] + mask_Pixels[i + 2];
        if(sum == 0)
        {
            image_Pixels[i] = 0;
            image_Pixels[i + 1] = 0;
            image_Pixels[i + 2] = 0;
        }
    }

    //display the output images
    canvas.putImageData(imageData, 0, 0);
}

//
function ErodeDilate(source, canvas, iteration)
{
    iteration *= 4;

    Erosion(source, canvas, iteration / 4);
    Dilation(canvas, canvas, iteration / 2);
    Erosion(canvas, canvas, iteration / 4);
}

function Erosion(source, canv, iteration)
{
    let newImage = source.getImageData(0, 0, imgWidth, imgHeight);
    let pixels = newImage.data;
    let rowCount = imgWidth * 4;

    for(let i = 0; i < iteration; i++)
    {
        let assignment = new Array(pixels.length).fill(0);

        for(let i = 0; i < pixels.length; i += 4)
        {
            //make outermost pixels black
            if( (i < rowCount) || //top horizontal line
                (i % rowCount == 0) || //left vertical line 
                ((i % rowCount) == (rowCount - 4)) || //right vertical line
                (i > pixels.length - rowCount - 1)) // bottom horizontal line
            {
                pixels[i] = 0;
                pixels[i + 1] = 0;
                pixels[i + 2] = 0;
            }
            else
            {
                //see if the hitmarker fits the pixel region
                //if so, set to white
                if(isHit(pixels, i, true))
                {
                    assignment[i] = 255;
                    assignment[i+1] = 255;
                    assignment[i+2] = 255;
                }
            }
        }

        //record the the hit pixel to the image data
        for(let i = 0; i < assignment.length; i += 4)
        {
            pixels[i] = assignment[i];
            pixels[i+1] = assignment[i+1];
            pixels[i+2] = assignment[i+2];
        }
    }

    //show in canvas
    canv.putImageData(newImage, 0, 0);
}

function Dilation(source, canv, iteration)
{
    {
        let newImage = source.getImageData(0, 0, imgWidth, imgHeight);
        let pixels = newImage.data;
        let rowCount = imgWidth * 4;
    
        for(let i = 0; i < iteration; i++)
        {
            let assignment = new Array(pixels.length).fill(0);
    
            for(let i = 0; i < pixels.length; i += 4)
            {
                //make outermost pixels black
                if( (i < rowCount) || //top horizontal line
                    (i % rowCount == 0) || //left vertical line 
                    ((i % rowCount) == (rowCount - 4)) || //right vertical line
                    (i > pixels.length - rowCount - 1)) // bottom horizontal line
                {
                    pixels[i] = 0;
                    pixels[i + 1] = 0;
                    pixels[i + 2] = 0;
                }
                else
                {
                    //see if the hitmarker fits the pixel region
                    //if so, set to white
                    if(isHit(pixels, i, false))
                    {
                        assignment[i] = 255;
                        assignment[i+1] = 255;
                        assignment[i+2] = 255;
                    }
                }
            }
    
            //record the the hit pixel to the image data
            for(let i = 0; i < assignment.length; i += 4)
            {
                pixels[i] = assignment[i];
                pixels[i+1] = assignment[i+1];
                pixels[i+2] = assignment[i+2];
            }
        }
    
        //show in canvas
        canv.putImageData(newImage, 0, 0);
    }
}

function GaussianDist(arr, mean, std)
{
    for(let i = 0; i < arr.length; i++)
    {
        arr[i] = Math.pow((1 / (std * Math.pow((2 * Math.PI), 0.5))), ((-1 * Math.pow((arr[i] - mean), 2)) / (2 * Math.pow(std, 2))));

        if(isNaN(arr[i]))
        {
            arr[i] = 0;
        }
    }

    return arr;
}

function GetImageScale(width, height)
{
    let scale;

    if(width > height)
    {
        scale = height / imageBase;
    }
    else
    {
        scale = width / imageBase;
    }

    return [Math.round(width / scale), Math.round(height / scale)]
}

function GetMean(arr)
{
    let total = 0.0;

    for(let i = 0; i < arr.length; i++)
    {
        total += arr[i];
    }

    return total / arr.length;
}

function GetStandardDev(arr, mean)
{
    let total = 0.0;
    for(let i = 0; i < arr.length; i++)
    {
        total += Math.pow(arr[i] - mean, 2);
    }

    total /= (arr.length - 1);

    return Math.sqrt(total);
}

function isHit(pixels, index, indicator)
{
    let row = imgWidth * 4;

    if(indicator)
    {
        if( pixels[index - row - 4] == hitMarker[0] &&
            pixels[index - row ]    == hitMarker[1] &&
            pixels[index - row + 4] == hitMarker[2] &&
            pixels[index - 4]       == hitMarker[3] &&
            pixels[index ]          == hitMarker[4] &&
            pixels[index + 4]       == hitMarker[5] &&
            pixels[index + row - 4] == hitMarker[6] &&
            pixels[index + row ]    == hitMarker[7] &&
            pixels[index + row + 4] == hitMarker[8])
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        if( pixels[index - row - 4] == hitMarker[0] ||
            pixels[index - row ]    == hitMarker[1] ||
            pixels[index - row + 4] == hitMarker[2] ||
            pixels[index - 4]       == hitMarker[3] ||
            pixels[index ]          == hitMarker[4] ||
            pixels[index + 4]       == hitMarker[5] ||
            pixels[index + row - 4] == hitMarker[6] ||
            pixels[index + row ]    == hitMarker[7] ||
            pixels[index + row + 4] == hitMarker[8])
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}

function IsolateChannel(pixels, container, channel)
{
    for(let i = 0; i < pixels.length; i += 4)
    {
        container[i / 4] = pixels[i + channel];
    }

    return container;
}

function ProcessImage()
{
    let imgData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);

    RGBChromatized(imgData.data);

    ctxs[1].putImageData(imgData, 0, 0);

    imgData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);
    let patchData = ctxs[2].getImageData(0, 0, imageBase, imageBase);

    let f_pixels_image = new Float32Array(imgData.data.length);
    let f_pixels_patch = new Float32Array(patchData.data.length);

    f_pixels_image = RGBChromatizedNormal(imgData.data, f_pixels_image);
    f_pixels_patch = RGBChromatizedNormal(patchData.data, f_pixels_patch);

    let f_pixels_image_red = new Float32Array(f_pixels_image.length/4);
    let f_pixels_image_green = new Float32Array(f_pixels_image.length/4);
    let final_mask = new Float32Array(f_pixels_image.length/4);

    let f_pixels_patch_red = new Float32Array(f_pixels_patch.length/4);
    let f_pixels_patch_green = new Float32Array(f_pixels_patch.length/4);

    f_pixels_image_red = IsolateChannel(f_pixels_image, f_pixels_image_red, 0);
    f_pixels_image_green = IsolateChannel(f_pixels_image, f_pixels_image_green, 1);
    f_pixels_patch_red = IsolateChannel(f_pixels_patch, f_pixels_patch_red, 0);
    f_pixels_patch_green = IsolateChannel(f_pixels_patch, f_pixels_patch_green, 1);

    let patch_red_mean = GetMean(f_pixels_patch_red);
    let patch_green_mean = GetMean(f_pixels_patch_green);

    let patch_red_std = GetStandardDev(f_pixels_patch_red, patch_red_mean);
    let patch_green_std = GetStandardDev(f_pixels_patch_green, patch_green_mean);

    f_pixels_image_red = GaussianDist(f_pixels_image_red, patch_red_mean, patch_red_std);
    f_pixels_image_green = GaussianDist(f_pixels_image_green, patch_green_mean, patch_green_std);


    for(let i = 0; i < final_mask.length; i++)
    {
        final_mask[i] = 1.0 * f_pixels_image_red[i] * f_pixels_image_green[i];
    }

    let final_mask_mean = GetMean(final_mask);
    
    final_mask_mean *= parseInt(document.getElementById("finalMaskMagnitude").value);

    imgData = ctxs[3].getImageData(0, 0, imgWidth, imgHeight);

    for(let i = 0; i < imgData.data.length; i +=4)
    {
        let color = 0;

        if(final_mask[i / 4] > final_mask_mean)
        {
            color = 255;
        }

        imgData.data[i] = color;
        imgData.data[i + 1] = color;
        imgData.data[i + 2] = color;
        imgData.data[i + 3] = 255;
    }

    ctxs[3].putImageData(imgData, 0, 0);

    ErodeDilate(ctxs[3], ctxs[5], magnitude);

    if(document.getElementById("processMask").checked)
    {
        ApplyMask(ctxs[5], ctxs[4])
    }
    else
    {
        ApplyMask(ctxs[3], ctxs[4])
    }
}

function RGBChromatized(pixels)
{
    for(let i = 0; i < pixels.length; i += 4)
    {
        let sum = pixels[i] + pixels[i + 1] + pixels[i + 2];

        pixels[i] = (pixels[i] / sum) * 255 ;
        pixels[i + 1] = (pixels[i + 1] / sum) * 255;
        pixels[i + 2] = (pixels[i + 2] / sum) * 255;
    }

    return pixels;
}

function RGBChromatizedNormal(pixels, container)
{
    for(let i = 0; i < pixels.length; i += 4)
    {
        let sum = pixels[i] + pixels[i + 1] + pixels[i + 2];

        container[i] = pixels[i] / sum;
        container[i + 1] = (pixels[i + 1] / sum);
        container[i + 2] = (pixels[i + 2] / sum);
    }

    return container;
}

function SelectPatch(event)
{
    let mouseY;
    let mouseX;

    let canv = document.querySelector("canvas");
    let canvasBB = canv.getBoundingClientRect();

    let halfPatchSize = patchSize / 2;
    let scalePatch = imageBase * (imageBase / patchSize);

    mouseX = Math.round(event.clientX - canvasBB.left) - halfPatchSize;
    mouseY = Math.round(event.clientY - canvasBB.top) - halfPatchSize;

    if(mouseX < 0)
    {
        mouseX = 0;
    }
    else if((mouseX + patchSize) > imgWidth)
    {
        mouseX = imgWidth - patchSize
    }

    if(mouseY < 0)
    {
        mouseY = 0;
    
    }
    else if((mouseY + patchSize) > imgHeight)
    {
        mouseY = imgHeight - patchSize
    }

    let d = ctxs[0].getImageData(mouseX, mouseY, patchSize, patchSize);

    ctxs[2].putImageData(d, 0, 0);
    ctxs[2].drawImage(canvs[2], 0, 0, scalePatch, scalePatch);
}

main();