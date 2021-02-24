var imgHeight;
var imgWidth;

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
    var canv5 = document.querySelector('#canv5');
    var canv6 = document.querySelector('#canv6');
    var canv7 = document.querySelector('#canv7');
    var canv8 = document.querySelector('#canv8');

    var img = new Image();
    img.src = imgsrc;

    img.onload = function(){
        imgHeight = Math.round(img.height / scale);
        imgWidth = Math.round(img.width / scale);

        canv1.height = imgHeight;
        canv1.width = imgWidth;
        canv2.height = imgHeight;
        canv2.width = imgWidth;
        canv3.height = imgHeight;
        canv3.width = imgWidth;
        canv4.height = imgHeight;
        canv4.width = imgWidth;
        canv5.height = imgHeight;
        canv5.width = imgWidth;
        canv6.height = imgHeight;
        canv6.width = imgWidth;
        canv7.height = imgHeight;
        canv7.width = imgWidth;
        canv8.height = imgHeight;
        canv8.width = imgWidth;

        let ctx1 = canv1.getContext('2d');
        let ctx2 = canv2.getContext('2d');
        let ctx3 = canv3.getContext('2d');
        let ctx4 = canv4.getContext('2d');
        let ctx5 = canv5.getContext('2d');
        let ctx6 = canv6.getContext('2d');
        let ctx7 = canv7.getContext('2d');
        let ctx8 = canv8.getContext('2d');

        ctx1.drawImage(img, 0, 0, imgWidth, imgHeight);

        ProcessImage(ctx1, ctx2, ctx3, ctx4, ctx5, ctx6, ctx7, ctx8);
    }
}

function ProcessImage(ctx1, ctx2, ctx3, ctx4, ctx5, ctx6, ctx7, ctx8)
{
    var imageData = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    var pix = imageData.data;

    var clusters = 6;
    var iteration = 50;
    var centers = new Array(clusters);

    
    for (let i = 0; i < centers.length; i++) {
        centers[i] = new Array(3);
        centers[i].fill(0);
    }

    var pixels = new Array(imgHeight * imgWidth);

    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = new Array(3).fill(0);
    }

    var assignments = new Array(imgHeight * imgWidth).fill(0);

    let c = Math.round(255 / clusters);
    let color = 255;

    for(let i = 0; i < centers.length; i++)
    {
        centers[i] = [color, color, color];
        color -= c;
    }

    for (let i = 0; i < pixels.length; i++) {
        pixels[i][0] = imageData.data[(i*4)  ];
        pixels[i][1] = imageData.data[(i*4)+1];
        pixels[i][2] = imageData.data[(i*4)+2];
    }

    var x = 0;

    while(x < iteration)
    {
        for (let i = 0; i < pixels.length; i++) {
            let d = 500;

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
                console.log("TEST");
                count++;
            }

            r /= count;
            g /= count;
            b /= count;

            centers[i][0] = Math.round(r);
            centers[i][1] = Math.round(g);
            centers[i][2] = Math.round(b);
        }


        x++;
    }

    for(let i = 0; i < centers.length; i++)
    {
        console.log(
            "R: " + centers[i][0] + 
            "\tG:" + centers[i][1] + 
            "\tB:" + centers[i][2]  );
    }



    var index = 0;
    for (let i = 0; i < pix.length; i += 4) {
        pix[i  ] = centers[assignments[index]][0];
        pix[i+1] = centers[assignments[index]][1];
        pix[i+2] = centers[assignments[index]][2];
        index++;
    }

    ctx2.putImageData(imageData, 0, 0);

    for(let i = 0; i < pix.length; i += 4)
    {
        if( pix[i  ] == centers[0][0] && 
            pix[i+1] == centers[0][1] && 
            pix[i+2] == centers[0][2])
        {
            pix[i  ] = 255;
            pix[i+1] = 255;
            pix[i+2] = 255;
        }
        else
        {
            pix[i  ] = 0;
            pix[i+1] = 0;
            pix[i+2] = 0;
        }
    }
    
    ctx3.putImageData(imageData, 0, 0);

    if(clusters >= 2)
    {
        imageData = ctx2.getImageData(0, 0, imgWidth, imgHeight);
        pix = imageData.data;

        for(let i = 0; i < pix.length; i += 4)
        {
            if( pix[i  ] == centers[1][0] && 
                pix[i+1] == centers[1][1] && 
                pix[i+2] == centers[1][2])
            {
                pix[i  ] = 255;
                pix[i+1] = 255;
                pix[i+2] = 255;
            }
            else
            {
                pix[i  ] = 0;
                pix[i+1] = 0;
                pix[i+2] = 0;
            }
        }
    }
    
    ctx4.putImageData(imageData, 0, 0);

    if(clusters >= 3)
    {
        imageData = ctx2.getImageData(0, 0, imgWidth, imgHeight);
        pix = imageData.data;

        for(let i = 0; i < pix.length; i += 4)
        {
            if( pix[i  ] == centers[2][0] && 
                pix[i+1] == centers[2][1] && 
                pix[i+2] == centers[2][2])
            {
                pix[i  ] = 255;
                pix[i+1] = 255;
                pix[i+2] = 255;
            }
            else
            {
                pix[i  ] = 0;
                pix[i+1] = 0;
                pix[i+2] = 0;
            }
        }
        
        ctx5.putImageData(imageData, 0, 0);
    }

    if(clusters >= 4)
    {
        imageData = ctx2.getImageData(0, 0, imgWidth, imgHeight);
        pix = imageData.data;

        for(let i = 0; i < pix.length; i += 4)
        {
            if( pix[i  ] == centers[3][0] && 
                pix[i+1] == centers[3][1] && 
                pix[i+2] == centers[3][2])
            {
                pix[i  ] = 255;
                pix[i+1] = 255;
                pix[i+2] = 255;
            }
            else
            {
                pix[i  ] = 0;
                pix[i+1] = 0;
                pix[i+2] = 0;
            }
        }
        
        ctx6.putImageData(imageData, 0, 0);
    }

    if(clusters >= 5)
    {
        imageData = ctx2.getImageData(0, 0, imgWidth, imgHeight);
        pix = imageData.data;

        for(let i = 0; i < pix.length; i += 4)
        {
            if( pix[i  ] == centers[4][0] && 
                pix[i+1] == centers[4][1] && 
                pix[i+2] == centers[4][2])
            {
                pix[i  ] = 255;
                pix[i+1] = 255;
                pix[i+2] = 255;
            }
            else
            {
                pix[i  ] = 0;
                pix[i+1] = 0;
                pix[i+2] = 0;
            }
        }
        
        ctx7.putImageData(imageData, 0, 0);
    }

    if(clusters >= 6)
    {
        imageData = ctx2.getImageData(0, 0, imgWidth, imgHeight);
        pix = imageData.data;

        for(let i = 0; i < pix.length; i += 4)
        {
            if( pix[i  ] == centers[5][0] && 
                pix[i+1] == centers[5][1] && 
                pix[i+2] == centers[5][2])
            {
                pix[i  ] = 255;
                pix[i+1] = 255;
                pix[i+2] = 255;
            }
            else
            {
                pix[i  ] = 0;
                pix[i+1] = 0;
                pix[i+2] = 0;
            }
        }
        
        ctx8.putImageData(imageData, 0, 0);
    }
}

function EuclideanDistance3(q1, q2, q3, p1, p2, p3)
{
    return Math.sqrt(Math.pow((q1 - p1), 2) + Math.pow((q2 - p2), 2) + Math.pow((q3 - p3), 2));
}


main();