import TestImages from "../TestImages/TestImages.js";

var imgHeight;
var imgWidth;
var canvs;
var ctxs;

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

    canvs = [
        document.querySelector('#canv0'),
        document.querySelector('#canv1'),
        document.querySelector('#canv2'),
        document.querySelector('#canv3'),
        document.querySelector('#canv4'),
        document.querySelector('#canv5'),
        document.querySelector('#canv6'),
        document.querySelector('#canv7'),
    ];

    ctxs = new Array(canvs.length);

    Apply();
}

function Apply()
{
    let img = new Image();
    img.src = TestImages.images[parseInt(document.getElementById("testImage").value)].source;

    //run function when the images is done loading
    img.onload = function(){

        let dim = GetImageScale(img.width, img.height);

        imgWidth = dim[0];
        imgHeight = dim[1];

        //apply the test image's height and width to the canvas
        //get the context of the canvas
        for(let i = 0; i < canvs.length; i++)
        {
            canvs[i].height = imgHeight;
            canvs[i].width = imgWidth;
            ctxs[i] = canvs[i].getContext('2d');
        }

        //draws the original image to canvas
        ctxs[0].drawImage(img, 0, 0, imgWidth, imgHeight);

        //how many color separation
        let clusters = parseInt(document.getElementById("cluster").value);

        //how much would the model learn
        let iteration = parseInt(document.getElementById("iteration").value);

        switch(parseInt(document.getElementById("colorSpace").value))
        {
            case 0:
                ProcessImageRGB(clusters, iteration, ctxs);
                break;
            case 1:
                ProcessImageCMYK(clusters, iteration, ctxs);
                break;
            case 2:
                ProcessImageHSV(clusters, iteration, ctxs);
                break           
        }
    }
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

function ProcessImageRGB(clusters, iteration, ctxs)
{
    //read the pixels of the first canvas
    var imageData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);
    var pix = imageData.data;

    //Declare the clusters
    var centers = new Array(clusters);

    for (let i = 0; i < centers.length; i++) {
        centers[i] = new Array(3);
        centers[i].fill(0);
    }

    //Declare the variable for the copy of the image pixel data
    var pixels = new Array(imgHeight * imgWidth);

    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = new Array(3).fill(0);
    }

    //Declare the tracker for the pixels closest cluster
    var assignments = new Array(imgHeight * imgWidth).fill(0);

    //sets up a cascading grayscale clusters
    let c = Math.round(255 / clusters);
    let color = 255;

    //Initialize each gray color to each cluster
    for(let i = 0; i < centers.length; i++)
    {
        centers[i] = [color, color, color];
        color -= c;
    }

    //Initialize the image's pixel data
    for (let i = 0; i < pixels.length; i++) {
        pixels[i][0] = imageData.data[(i*4)  ];
        pixels[i][1] = imageData.data[(i*4)+1];
        pixels[i][2] = imageData.data[(i*4)+2];
    }

    //start of the k-means Algorithm
    var x = 0;

    while(x < iteration)
    {
        //For each pixel, get the closest cluster
        for (let i = 0; i < pixels.length; i++) {
            let d = 500;

            //for each cluster, get the euclidean distance the assign if less than the prevoius cluster
            for(let j = 0; j < centers.length; j++)
            {
                let d2 = EuclideanDistance3(
                    pixels[i][0], pixels[i][1], pixels[i][2],
                    centers[j][0], centers[j][1], centers[j][2]
                );

                if(d > d2)
                {
                    d = d2;
                    assignments[i] = j;
                }
            }
        }

        
        //for each cluster, get the mean value of all the pixels assigned to the cluster
        for(let i = 0; i < centers.length; i++)
        {
            let count = 0;
            let r = 0;
            let g = 0;
            let b = 0;
            
            for (let j = 0; j < assignments.length; j++) {
                if(assignments[j] == i)
                {
                    r += pixels[j][0];
                    g += pixels[j][1];
                    b += pixels[j][2];
                    count++;
                }
            }

            if(count == 0)
            {
                count++;
                console.log("NO COUNT");
            }

            r /= count;
            g /= count;
            b /= count;

            centers[i][0] = Math.round(r);
            centers[i][1] = Math.round(g);
            centers[i][2] = Math.round(b);
        }

        console.log(centers)
        x++;
    }
    
    //console.log(centers[0]);
    var index = 0;
    
    //Apply the cluster value based on the final assignment
    for (let i = 0; i < pix.length; i += 4) {
        pix[i  ] = centers[assignments[index]][0];
        pix[i+1] = centers[assignments[index]][1];
        pix[i+2] = centers[assignments[index]][2];
        index++;
    }

    //draw the color separated image to canvas 2
    ctxs[1].putImageData(imageData, 0, 0);

    //Display each cluser on thier own canvas, separated in black and white
    showClusters(clusters, ctxs, centers);
}

function ProcessImageCMYK(clusters, iteration, ctxs)
{
    //read the pixels of the first canvas
    var imageData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);
    var pix = imageData.data;

    //Declare the clusters
    var centers = new Array(clusters);

    for (let i = 0; i < centers.length; i++) {
        centers[i] = new Array(4);
        centers[i].fill(0);
    }

    //Declare the variable for the copy of the image pixel data
    var pixels = new Array(imgHeight * imgWidth);

    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = new Array(4).fill(0);
    }

    //Declare the tracker for the pixels closest cluster
    var assignments = new Array(imgHeight * imgWidth).fill(0);

    //sets up a cascading grayscale clusters
    let c = Math.round(100 / clusters) / 100;
    let color = 1;

    //Initialize each gray color to each cluster
    for(let i = 0; i < centers.length; i++)
    {
        centers[i] = [color, color, color];
        color -= c;
    }

    //Initialize the image's pixel data
    for (let i = 0; i < pixels.length; i++) {

        let cmyk = RBGtoCMYK(imageData.data[(i*4)], imageData.data[(i*4)+1], imageData.data[(i*4)+2])

        pixels[i][0] = cmyk[0];
        pixels[i][1] = cmyk[1];
        pixels[i][2] = cmyk[2];
        pixels[i][3] = cmyk[3];
    }

    //start of the k-means Algorithm
    var x = 0;

    while(x < iteration)
    {
        //For each pixel, get the closest cluster
        for (let i = 0; i < pixels.length; i++) {
            let d = 500;

            //for each cluster, get the euclidean distance the assign if less than the prevoius cluster
            for(let j = 0; j < centers.length; j++)
            {
                let d2 = EuclideanDistance4(
                    pixels[i][0], pixels[i][1], pixels[i][2], pixels[i][3],
                    centers[j][0], centers[j][1], centers[j][2], centers[j][3]
                );

                if(d > d2)
                {
                    d = d2;
                    assignments[i] = j;
                }
            }
        }

        //for each cluster, get the mean value of all the pixels assigned to the cluster
        for(let i = 0; i < centers.length; i++)
        {
            let count = 0;
            let c = 0;
            let m = 0;
            let y = 0;
            let k = 0;
            
            for (let j = 0; j < assignments.length; j++) {
                if(assignments[j] == i)
                {
                    c += pixels[j][0];
                    m += pixels[j][1];
                    y += pixels[j][2];
                    k += pixels[j][3];
                    count++;
                }
            }

            if(count == 0)
            {
                count++;
            }

            c /= count;
            m /= count;
            y /= count;
            k /= count;

            centers[i][0] = Math.round(c * 100) / 100;
            centers[i][1] = Math.round(m * 100) / 100;
            centers[i][2] = Math.round(y * 100) / 100;
            centers[i][3] = Math.round(k * 100) / 100;
        }

        x++;
    }

    for(let i = 0; i < centers.length; i++)
    {
        let cmyk = CMYKtoRBG(centers[i][0], centers[i][1], centers[i][2], centers[i][3])
        centers[i][0] = Math.round(cmyk[0]);
        centers[i][1] = Math.round(cmyk[1]);
        centers[i][2] = Math.round(cmyk[2]);
        centers[i][3] = 255;
    }

    var index = 0;



    //Apply the cluster value based on the final assignment
    for (let i = 0; i < pix.length; i += 4) {
        pix[i  ] = centers[assignments[index]][0];
        pix[i+1] = centers[assignments[index]][1];
        pix[i+2] = centers[assignments[index]][2];
        index++;
    }

    //draw the color separated image to canvas 2
    ctxs[1].putImageData(imageData, 0, 0);

    //Display each cluser on thier own canvas, separated in black and white
    showClusters(clusters, ctxs, centers);
}

function ProcessImageHSV(clusters, iteration, ctxs)
{
    //read the pixels of the first canvas
    var imageData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);
    var pix = imageData.data;

    //Declare the clusters
    var centers = new Array(clusters);

    for (let i = 0; i < centers.length; i++) {
        centers[i] = new Array(3);
        centers[i].fill(0);
    }

    //Declare the variable for the copy of the image pixel data
    var pixels = new Array(imgHeight * imgWidth);

    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = new Array(3).fill(0);
    }

    //Declare the tracker for the pixels closest cluster
    var assignments = new Array(imgHeight * imgWidth).fill(0);

    //sets up a cascading grayscale clusters
    let h = Math.round(360 / clusters);
    let hue= 360;

    let sv = Math.round(100 / clusters) / 100;
    let satAndVal= 1;

    //Initialize each gray color to each cluster
    for(let i = 0; i < centers.length; i++)
    {
        centers[i] = [hue, satAndVal, satAndVal];
        hue -= h;
        satAndVal -= sv;
    }

    //Initialize the image's pixel data
    for (let i = 0; i < pixels.length; i++) {

        let hsv = RBGtoHSV(imageData.data[(i*4)], imageData.data[(i*4)+1], imageData.data[(i*4)+2])

        if(hsv[0] < 0)
        {
            hsv[0] *= -1;
        }

        pixels[i][0] = Math.round(hsv[0]);
        pixels[i][1] = Math.round(hsv[1] * 100) / 100;
        pixels[i][2] = Math.round(hsv[2] * 100) / 100
    }

    //start of the k-means Algorithm
    var x = 0;

    while(x < iteration)
    {
        //For each pixel, get the closest cluster
        for (let i = 0; i < pixels.length; i++) {
            let d = 500;

            //for each cluster, get the euclidean distance the assign if less than the prevoius cluster
            for(let j = 0; j < centers.length; j++)
            {
                let d2 = EuclideanDistance3(
                    pixels[i][0], pixels[i][1], pixels[i][2],
                    centers[j][0], centers[j][1], centers[j][2]
                );

                if(d > d2)
                {
                    d = d2;
                    assignments[i] = j;
                }
            }
        }

        //for each cluster, get the mean value of all the pixels assigned to the cluster
        for(let i = 0; i < centers.length; i++)
        {
            let count = 0;
            let h = 0;
            let s = 0;
            let v = 0;
            
            for (let j = 0; j < assignments.length; j++) {
                if(assignments[j] == i)
                {
                    h += pixels[j][0];
                    s += pixels[j][1];
                    v += pixels[j][2];
                    count++;
                }
            }

            if(count == 0)
            {
                count++;
            }

            h /= count;
            s /= count;
            v /= count;

            centers[i][0] = Math.round(h);
            centers[i][1] = Math.round(s * 100) / 100;
            centers[i][2] = Math.round(v* 100) / 100;
        }

        x++;
    }

    var index = 0;

    //
    for(let i = 0; i < centers.length; i++)
    {
        let hsv = HSVtoRGB(centers[i][0], centers[i][1], centers[i][2]);
        centers[i][0] = Math.round(hsv[0]);
        centers[i][1] = Math.round(hsv[1]);
        centers[i][2] = Math.round(hsv[2]);
    }

    //Apply the cluster value based on the final assignment
    for (let i = 0; i < pix.length; i += 4) {
        pix[i  ] = centers[assignments[index]][0];
        pix[i+1] = centers[assignments[index]][1];
        pix[i+2] = centers[assignments[index]][2];
        index++;
    }

    //draw the color separated image to canvas 2
    ctxs[1].putImageData(imageData, 0, 0);

    //Display each cluser on thier own canvas, separated in black and white
    showClusters(clusters, ctxs, centers);
}

function showClusters(numOfClusters, ctxs, centers)
{
    for(let i = 0; i < numOfClusters; i++)
    {
        let imageData = ctxs[1].getImageData(0, 0, imgWidth, imgHeight);
        let pixels = imageData.data;

        for(let j = 0; j < pixels.length; j += 4)
        {
            if( pixels[j  ] == centers[i][0] && 
                pixels[j+1] == centers[i][1] && 
                pixels[j+2] == centers[i][2])
            {
                pixels[j  ] = 255;
                pixels[j+1] = 255;
                pixels[j+2] = 255;
            }
            else
            {
                pixels[j  ] = 0;
                pixels[j+1] = 0;
                pixels[j+2] = 0;
            }
        }

        ctxs[i + 2].putImageData(imageData, 0, 0);
    }
}

function EuclideanDistance3(q1, q2, q3, p1, p2, p3)
{
    return Math.sqrt(Math.pow((q1 - p1), 2) + Math.pow((q2 - p2), 2) + Math.pow((q3 - p3), 2));
}

function EuclideanDistance4(q1, q2, q3, q4, p1, p2, p3, p4)
{
    return Math.sqrt(Math.pow((q1 - p1), 2) + Math.pow((q2 - p2), 2) + Math.pow((q3 - p3), 2) + Math.pow((q4 - p4), 2));
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

function CMYKtoRBG(cyan, magenta, yellow, key)
{
    let red = 255 * (1 - cyan) * (1 - key);
    let green = 255 * (1 - magenta) * (1 - key);
    let blue = 255 * (1 - yellow) * (1 - key);

    return [red, green, blue];
}

function HSVtoRGB(hue, saturation, value)
{
    if(hue < 0)
    {
        hue += 360;
    }
    else if(hue > 360)
    {
        hue -= 360;
    }

    let c = value * saturation;
    let x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
    let m = value - c;

    let rp;
    let gp;
    let bp;

    if(hue < 60)
    {
        rp = c;
        gp = x;
        bp = 0;
    }
    else if(hue < 120)
    {
        rp = x;
        gp = c;
        bp = 0;
    }
    else if(hue < 180)
    {
        rp = 0;
        gp = c;
        bp = x;
    }
    else if(hue < 240)
    {
        rp = 0;
        gp = x;
        bp = c;
    }
    else if(hue < 300)
    {
        rp = x;
        gp = 0;
        bp = c;
    }
    else
    {
        rp = c;
        gp = 0;
        bp = x;
    }

    let red = (rp + m) * 255;
    let green = (gp + m) * 255;
    let blue = (bp + m) * 255;

    return [red, green, blue];
}

main();