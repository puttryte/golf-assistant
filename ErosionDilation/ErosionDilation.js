import TestImages from "../TestImages/TestImages.js";

var imgHeight;
var imgWidth;
var canvs;
var ctxs;
var magnitude = 0;
var ini_erosion = 0;
var mid_dilation = 0;
var fin_erosion = 0;
var threshold = 0;

const hitMarker = [ 255, 255, 255, 
                    255, 255, 255, 
                    255, 255, 255];

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
    document.getElementById("processbtn").addEventListener('click', ProcessImage);

    canvs = [
        document.querySelector('#canv0'),
        document.querySelector('#canv1'),
        document.querySelector('#canv2'),
        document.querySelector('#canv3'),
        document.querySelector('#canv4'),
        document.querySelector('#canv5'),
    ];

    ctxs = new Array(canvs.length);

    Apply();
}

function Apply()
{
    let testImage_select = parseInt(document.getElementById("testImage").value);
    magnitude = parseInt(document.getElementById("magnitude").value);
    ini_erosion = parseInt(document.getElementById("initial_Erosion").value);
    mid_dilation = parseInt(document.getElementById("mid_Dilation").value);
    fin_erosion = parseInt(document.getElementById("final_Erosion").value);
    threshold = parseInt(document.getElementById("threshold").value);

    let img = new Image();
    img.src = TestImages.images[testImage_select].source;

    img.onload = function()
    {
        let dim = GetImageScale(img.width, img.height);

        imgWidth = dim[0];
        imgHeight = dim[1];

        for(let i = 0; i < canvs.length; i++)
        {
            canvs[i].height = imgHeight;
            canvs[i].width = imgWidth;
            ctxs[i] = canvs[i].getContext('2d'); 
        }

        ctxs[0].drawImage(img, 0, 0, imgWidth, imgHeight);

        GetBlackandWhite(ctxs[0], ctxs[1]);
    }
}

function ProcessImage()
{
    if(document.getElementById("custom").checked)
    {
        Erosion(ctxs[1], ctxs[3], ini_erosion)
        Dilation(ctxs[3], ctxs[4], mid_dilation)
        Erosion(ctxs[4], ctxs[5], fin_erosion)

        document.getElementById("label1").innerHTML = "Initial Erosion " + (ini_erosion) + " times";
        document.getElementById("label2").innerHTML = "Dilation " + (mid_dilation) + " times";
        document.getElementById("label3").innerHTML = "Final Erosion " + (fin_erosion) + " times";
    }
    else 
    {
        Erosion(ctxs[1], ctxs[3], magnitude)
        Dilation(ctxs[3], ctxs[4], magnitude * 2)
        Erosion(ctxs[4], ctxs[5], magnitude)

        document.getElementById("label1").innerHTML = "Initial Erosion " + (magnitude) + " times";
        document.getElementById("label2").innerHTML = "Dilation " + (magnitude * 2) + " times";
        document.getElementById("label3").innerHTML = "Final Erosion " + (magnitude) + " times";
    }
    
    ctxs[2].putImageData(ctxs[5].getImageData(0, 0, imgWidth, imgHeight), 0, 0);
}

function GetBlackandWhite(source, canv)
{
    let newImage = canv.getImageData(0, 0, imgWidth, imgHeight);
    let pixels = source.getImageData(0, 0, imgWidth, imgHeight).data;
    
    for(let i = 0; i < pixels.length; i += 4)
    {
        let avg = Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3); 

        if(avg < threshold)
        {
            newImage.data[i]     = 0;
            newImage.data[i + 1] = 0;
            newImage.data[i + 2] = 0;
        }
        else
        {
            newImage.data[i]     = 255;
            newImage.data[i + 1] = 255;
            newImage.data[i + 2] = 255;
        }

        newImage.data[i + 3] = 255;
    }

    canv.putImageData(newImage, 0, 0);
}

function GetImageScale(width, height)
{
    let scale;

    if(width > height)
    {
        scale = height / 300;
    }
    else
    {
        scale = width / 300;
    }

    return [Math.round(width / scale), Math.round(height / scale)]
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

main();