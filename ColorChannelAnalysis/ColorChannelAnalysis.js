import testImages from "../TestImages/TestImages.js";

var imgHeight;
var imgWidth;
var canvs;
var ctxs;

function main()
{
    var mySelect = document.getElementById("testImage");

    for (let i = 0; i < testImages.images.length; i++)
    {
        let option = document.createElement("option");
        option.value = i;
        option.text = testImages.images[i].name;
        mySelect.add(option);
    }

    var btn = document.getElementById("applybtn");
    btn.addEventListener('click', Apply);

    var range = document.getElementById("histrogramThreshold");

    range.addEventListener("input", function(){
        document.getElementById("ThresholdLabel").innerHTML = "Histrogram Threshold (" + document.getElementById("histrogramThreshold").value + "%):";
    });

    canvs = [
        document.querySelector('#canv1'),
        document.querySelector('#canv2'),
        document.querySelector('#canv3'),
        document.querySelector('#canv4'),
    ];

    for(let i = 0; i < canvs.length; i++)
    {
        canvs[i].addEventListener('click', labelPixel);
    }

    ctxs = new Array(canvs.length);

    Apply();
}

function Apply()
{
    let testImage_Select = document.getElementById("testImage").value;
    let colorSpace_Select = document.getElementById("colorSpace").value;
    let threshold_Select = document.getElementById("histrogramThreshold").value;

    let img = new Image();
    img.src = testImages.images[testImage_Select].source;

    img.onload = function()
    {
        imgHeight = img.height / testImages.images[testImage_Select].scale;
        imgWidth = img.width / testImages.images[testImage_Select].scale;

        for(let i = 0; i < canvs.length; i++)
        {
            canvs[i].height = imgHeight;
            canvs[i].width = imgWidth;
            ctxs[i] = canvs[i].getContext('2d'); 
        }

        ctxs[0].drawImage(img, 0, 0, imgWidth, imgHeight);

        ProcessImage(ctxs, colorSpace_Select, threshold_Select);
    }
}

function labelPixel(event) {
    let mouseY;
    let mouseX;

    let canv = event.target;
    let ctx = canv.getContext('2d'); 
    let myCanvasBB = canv.getBoundingClientRect();

    mouseX = event.clientX - myCanvasBB.left;
    mouseY = event.clientY - myCanvasBB.top;

    var imgd = ctx.getImageData(mouseX, mouseY, 1, 1);
    var pixel = imgd.data;
    
    document.getElementById('coordinates').innerHTML = 
        " X: " + mouseX + 
        "<br/> Y: " + mouseY + 
        "<br/> Threshold: " + (Math.round((mouseX / imgWidth ) * 100)) + "%";


    document.getElementById('rgb').innerHTML = 
    "R: " + imgd.data[0] + 
    "<br/> G: " + pixel[1] + 
    "<br/> B: " + pixel[2] +
    "<br/> A: " + pixel[3];

    pixel = RBGtoCMYK(imgd.data[0], imgd.data[1], imgd.data[2]);

    document.getElementById('cmyk').innerHTML = 
    "C: " + Math.round(pixel[0] * 100) + "%" +
    "<br/> M: " + Math.round(pixel[1] * 100) + "%" +
    "<br/> Y: " + Math.round(pixel[2] * 100) + "%" +
    "<br/> K: " + Math.round(pixel[3] * 100) + "%";

    pixel = RBGtoHSV(imgd.data[0], imgd.data[1], imgd.data[2]);

    document.getElementById('hsv').innerHTML = 
    "H: " + Math.round(pixel[0]) + "&deg" + 
    "<br/> S: " + Math.round(pixel[1] * 100) + "%" + 
    "<br/> V: " + Math.round(pixel[2] * 100) + "%";
}

function ProcessImage(contexts, cs, t)
{
    let imageData = contexts[0].getImageData(0, 0, imgWidth, imgHeight);
    let pixels = imageData.data;

    t /= 100;

    switch(cs)
    {
        case "gray":
            pixels = Grayscale(pixels);
            break;
        case "red":
            pixels = RedChannel(pixels);
            break;
        case "green":
            pixels = GreenChannel(pixels);
            break;
        case "blue":
            pixels = BlueChannel(pixels);
            break;
        case "cyan":
            pixels = CyanChannel(pixels);
            break;
        case "magenta":
            pixels = MagentaChannel(pixels);
            break;
        case "yellow":
            pixels = YellowChannel(pixels);
            break;
        case "key":
            pixels = KeyChannel(pixels);
            break;
        case "hue":
            pixels = HueChannel(pixels);
            break;
        case "saturation":
            pixels = SaturationChannel(pixels);
            break;
        case "value":
            pixels = ValueChannel(pixels);
            break;
    }

    contexts[1].putImageData(imageData, 0, 0);

    Histogram(contexts[2], pixels, t);

    pixels = Grayscalesplit_2(pixels, t);

    contexts[3].putImageData(imageData, 0, 0);
}

function Grayscale(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        let avg = (pix[i] + pix[i+1] + pix[i+2]) / 3;
         
        pix[i  ] = avg;
        pix[i+1] = avg;
        pix[i+2] = avg;
    }

    return pix;
}

function Grayscalesplit_2(pix, threshold)
{
    threshold = 255 * threshold;

    for(var i = 0; i <= pix.length; i += 4)
    {
        if(pix[i] < threshold)
        {
            pix[i  ] = 0;
            pix[i+1] = 0;
            pix[i+2] = 0;         
        }
        else  
        {
            pix[i  ] = 255;
            pix[i+1] = 255;
            pix[i+2] = 255;
        }
    }

    return pix;
}

function RedChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        pix[i + 1] = pix[i];
        pix[i + 2] = pix[i]; 
    }

    return pix;
}

function GreenChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        pix[i    ] = pix[i + 1];
        pix[i + 2] = pix[i + 1]; 
    }

    return pix;
}

function BlueChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        pix[i    ] = pix[i + 2];
        pix[i + 1] = pix[i + 2]; 
    }

    return pix;
}

function CyanChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        let n_pixel = RBGtoCMYK(pix[i], pix[i+1], pix[i+2]);

        let cyan = 255 * n_pixel[0];
        
        pix[i    ] = cyan;
        pix[i + 1] = cyan;
        pix[i + 2] = cyan;
    }

    return pix;
}

function MagentaChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        let n_pixel = RBGtoCMYK(pix[i], pix[i+1], pix[i+2]);

        let magenta = 255 * n_pixel[1];

        pix[i    ] = magenta;
        pix[i + 1] = magenta;
        pix[i + 2] = magenta;
    }

    return pix;
}

function YellowChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        let n_pixel = RBGtoCMYK(pix[i], pix[i+1], pix[i+2]);

        let yellow = 255 * n_pixel[2];
        
        pix[i    ] = yellow;
        pix[i + 1] = yellow;
        pix[i + 2] = yellow;
    }

    return pix;
}

function KeyChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        let n_pixel = RBGtoCMYK(pix[i], pix[i+1], pix[i+2]);

        let key = 255 * n_pixel[3];
        
        pix[i    ] = key ;
        pix[i + 1] = key ;
        pix[i + 2] = key ;
    }

    return pix;
}

function HueChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        let n_pixel = RBGtoHSV(pix[i], pix[i+1], pix[i+2]);

        let hue = 255 * (n_pixel[0] / 360);
        
        pix[i    ] = hue ;
        pix[i + 1] = hue ;
        pix[i + 2] = hue ;
    }

    return pix;
}

function SaturationChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        let n_pixel = RBGtoHSV(pix[i], pix[i+1], pix[i+2]);

        let saturation = 255 * n_pixel[1];
        
        pix[i    ] = saturation ;
        pix[i + 1] = saturation ;
        pix[i + 2] = saturation ;
    }

    return pix;
}

function ValueChannel(pix)
{
    for(var i = 0; i <= pix.length; i += 4)
    {
        let n_pixel = RBGtoHSV(pix[i], pix[i+1], pix[i+2]);

        let value = 255 * n_pixel[2];
        
        pix[i    ] = value ;
        pix[i + 1] = value ;
        pix[i + 2] = value ;
    }

    return pix;
}

function RBGtoCMYK(red, green, blue)
{
    let cyan, magenta, yellow, key;

    let red_p = red/255;
    let green_p = green/255;
    let blue_p = blue/255;

    key = 1 - Math.max(red_p, green_p, blue_p);
    cyan = (1 - red_p - key) / (1 - key)
    magenta = (1 - green_p - key) / (1 - key);
    yellow = (1 - blue_p - key) / (1 - key);

    return [cyan, magenta, yellow, key];
}

function RBGtoHSV(red, green, blue)
{
    let hue, saturation, value;

    let red_p = red/255;
    let green_p = green/255;
    let blue_p = blue/255;

    let colorMax = Math.max(red_p, green_p, blue_p);
    let colorMin= Math.min(red_p, green_p, blue_p);
    let colorDelta = colorMax - colorMin;

    value = colorMax;

    if(colorMax == 0)
    {
        saturation = 0;
    }
    else
    {
        saturation = colorDelta / colorMax;
    }

    if(colorDelta == 0)
    {
        hue = 0;
    }
    else if(colorMax == red_p)
    {
        hue = 60 * (((green_p - blue_p) / colorDelta) % 6);
    }
    else if(colorMax == green_p)
    {
        hue = 60 * (((blue_p - red_p) / colorDelta) + 2);
    }
    else
    {
        hue = 60 * (((red_p - green_p) / colorDelta) + 4);
    }

    if(hue < 0)
    {
        hue += 360
    }

    return [hue, saturation, value];
}

function Histogram(ctx, pix, threshold)
{
    let count = new Array(256).fill(0);

    for(let x = 0; x <= pix.length; x += 4)
    {
        count[pix[x]] += 1;
    }
    
    let value = 0;

    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';

    let xSpacing = imgWidth / 255;
    let barHeight = 0.05;

    count.forEach(element => {
        let x = xSpacing * value;
        let height = count[value] * barHeight;

        ctx.rect(x, imgHeight - height, xSpacing, height);
        ctx.fill();

        value++;
    });
    ctx.fillStyle = 'red';
    ctx.fillRect(xSpacing * (Math.round(255 * threshold)), 0, xSpacing, imgHeight);
}

main();