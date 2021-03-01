var imgHeight;
var imgWidth;

//Test Images and scale based on display
//var imgsrc = "../TestImages/test.jpeg"; var scale = 1.7;
//var imgsrc = "../TestImages/test2.png"; var scale = 1.7;
//var imgsrc = "../TestImages/test3.jpg"; var scale = 2;
//var imgsrc = "../TestImages/test4.jpg"; var scale = 3.5;
//var imgsrc = "../TestImages/test5.jpg"; var scale = 1.7;
//var imgsrc = "../TestImages/test6.jpg"; var scale = 5;
var imgsrc = "../TestImages/test7.jpg"; var scale = 4.8;

function main()
{
    var canv1 = document.querySelector('#canv1');
    var canv2 = document.querySelector('#canv2');
    var canv3 = document.querySelector('#canv3');
    var canv4 = document.querySelector('#canv4');

    var label = document.querySelector('label');

    var mouseY;
    var mouseX;

    document.body.addEventListener('mousedown', click);

    function click(event) {
        let canv = event.target;

        if(canv.id != "")
        {
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
    }
    
    var img = new Image();
    img.src = imgsrc;

    img.onload = function(){
        imgHeight = img.height / scale;
        imgWidth = img.width / scale;

        canv1.height = imgHeight;
        canv1.width = imgWidth;
        canv2.height = imgHeight;
        canv2.width = imgWidth;
        canv3.height = imgHeight;
        canv3.width = imgWidth;
        canv4.height = imgHeight;
        canv4.width = imgWidth;

        let ctx1 = canv1.getContext('2d');
        let ctx2 = canv2.getContext('2d');
        let ctx3 = canv3.getContext('2d');
        let ctx4 = canv4.getContext('2d');

        ctx1.drawImage(img, 0, 0, imgWidth, imgHeight);

        ProcessImage(ctx1, ctx2, ctx3, ctx4);
    }
}

function ProcessImage(ctx1, ctx2, ctx3, ctx4)
{
    var imageData = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    var pix = imageData.data;

    var threshold = 0.35;

    //pix = Grayscale(pix); // normal grayscale
    //pix = Brighten(pix, -30);

    //pix = RedChannel(pix);
    //pix = GreenChannel(pix);
    //pix = BlueChannel(pix);

    //pix = CyanChannel(pix);
    //pix = MagentaChannel(pix);
    //pix = YellowChannel(pix);
    //pix = KeyChannel(pix);
    
    //pix = HueChannel(pix);
    //pix = SaturationChannel(pix);
    pix = ValueChannel(pix);

    ctx2.putImageData(imageData, 0, 0);
    
    Histogram(ctx3, pix, threshold);
 
    pix = Grayscalesplit_2(pix, threshold); 
    ctx4.putImageData(imageData, 0, 0);
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

    return [hue, saturation, value];
}

function Brighten(pix, amount)
{
    for (let i = 0; i < pix.length; i += 4) {
        //let max = Math.max(pix[i], pix[i+1], pix[i+2]);

        // if(max == pix[i])
        // {
        //     pix[i] += amount;
        // }
        // else if(max == pix[i+1])
        // {
        //     pix[i+1] += amount;
        // }
        // else
        // {
        //     pix[i+2] += amount;
        // }

        pix[i  ] += amount;
        pix[i+1] += amount;
        pix[i+2] += amount;
    }
    
    return pix;
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