var imgHeight;
var imgWidth;

//more than 0
const magnitude = 1;

//between 0 - 255
const threshold = 120;

//Test Images and scale based on display
//const imgsrc = "../TestImages/test.jpeg"; const scale = 1.7;
//const imgsrc = "../TestImages/test2.png"; const scale = 1.7;
//const imgsrc = "../TestImages/test3.jpg"; const scale = 2;
//const imgsrc = "../TestImages/test4.jpg"; const scale = 3.5;
//const imgsrc = "../TestImages/test5.jpg"; const scale = 1.7;
const imgsrc = "../TestImages/test6.jpg"; const scale = 5;
//const imgsrc = "../TestImages/test7.jpg"; const scale = 4.8;

const numOfCanvases = 6;
const iteration = magnitude * 4;

const hitMarker = [ 255, 255, 255, 
                    255, 255, 255, 
                    255, 255, 255];

function main()
{
    var canvId = "#canv";
    var canvases = new Array(numOfCanvases);
    var ctxs = new Array(numOfCanvases);

    for(let i = 0; i < numOfCanvases; i++)
    {
        canvases[i] = document.querySelector(canvId + (i + 1))
    }
    
    var img = new Image();
    img.src = imgsrc;

    img.onload = function()
    {
        imgHeight = Math.round(img.height / scale);
        imgWidth = Math.round(img.width / scale);

        canvases.forEach(canvas =>{
            canvas.height = imgHeight;
            canvas.width = imgWidth;
        })

        for(let i = 0; i < canvases.length; i++)
        {
            ctxs[i] = canvases[i].getContext('2d');
        }

        ctxs[0].drawImage(img, 0, 0, imgWidth, imgHeight);

        GetBlackandWhite(ctxs[0], ctxs[1]);
        
        Erosion(ctxs[1], ctxs[2], iteration / 4)
        Dilation(ctxs[2], ctxs[3], iteration / 2)
        Erosion(ctxs[3], ctxs[4], iteration / 4)

        ctxs[5].putImageData(ctxs[4].getImageData(0, 0, imgWidth, imgHeight), 0, 0);

        document.getElementById("label1").innerHTML = "Initial Erosion " + (iteration / 4) + " times"
        document.getElementById("label2").innerHTML = "Dilation " + (iteration / 2) + " times"
        document.getElementById("label3").innerHTML = "Final Erosion " + (iteration / 4) + " times"
    }
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