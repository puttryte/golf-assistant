import Utility from "./Utility.js";
import Color from "./Color.js";

export default class KMeans
{
    static ProcessImageRGB(ctxs, numOfCluster, maxIteration)
    {
        let imgWidth = ctxs[0].canvas.clientWidth;
        let imgHeight = ctxs[0].canvas.clientHeight;

        let imgData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);
        
        let cluster = new Array(numOfCluster);
        let clusterCount = new Array(numOfCluster).fill(0);
        let pixels = new Array(imgWidth * imgHeight);
        let assignment = new Array(imgWidth * imgHeight).fill(0);

        for (let i = 0; i < cluster.length; i++) {
            cluster[i] = new Array(3).fill(0);
        }

        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = new Array(3).fill(0);
        }

        let colorDelta = Math.round(255 / (numOfCluster - 1));
        let color = 0;

        let iteration = 0;

        for(let i = 0; i < cluster.length; i++)
        {
            cluster[i] = [color, color, color];
            color += colorDelta;
        }

        for(let i = 0; i < pixels.length; i++)
        {
            pixels[i][0] = imgData.data[(i*4)];
            pixels[i][1] = imgData.data[(i*4) + 1];
            pixels[i][2] = imgData.data[(i*4) + 2];
        }

        while(iteration < maxIteration)
        {
            for(let i = 0; i < pixels.length; i++)
            {
                let minDistance = Number.MAX_SAFE_INTEGER;

                for(let j = 0; j < cluster.length; j++)
                {
                    let distance = Utility.EuclideanDistance3(
                        pixels[i][0], pixels[i][1], pixels[i][2],
                        cluster[j][0], cluster[j][1], cluster[j][2]
                        );

                    if(minDistance > distance)
                    {
                        minDistance = distance;
                        assignment[i] = j;
                    }
                }   
            }

            for(let i = 0; i < cluster.length; i++)
            {
                let count = 0;
                let r = 0;
                let g = 0;
                let b = 0;

                for(let j = 0; j < assignment.length; j++)
                {
                    if(i == assignment[j])
                    {
                        r += pixels[j][0];
                        g += pixels[j][1];
                        b += pixels[j][2];
                        count++;
                    }
                }

                if(count > 0)
                {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);

                    cluster[i] = [r, g, b];
                }

                if((iteration + 1) == maxIteration)
                {
                    clusterCount[i] = count;
                }
            }

            iteration++;
        }

        for(let i = 0; i < imgData.data.length; i += 4)
        {
            imgData.data[i] = cluster[assignment[i / 4]][0];
            imgData.data[i + 1] = cluster[assignment[i / 4]][1];
            imgData.data[i + 2] = cluster[assignment[i / 4]][2];
        }

        ctxs[1].putImageData(imgData, 0, 0);

        for(let i = 0; i < clusterCount.length; i++)
        {
            for(let j = (i+1); j < clusterCount.length; j++)
            {
                if(clusterCount[i] > clusterCount[j])
                {
                    let temp = clusterCount[i];
                    clusterCount[i] = clusterCount[j];
                    clusterCount[j] = temp;

                    temp = cluster[i];
                    cluster[i] = cluster[j];
                    cluster[j] = temp;
                }
            }
        }

        this.ShowCluster(cluster[0], ctxs[1], ctxs[2])
        this.ShowCluster(cluster[1], ctxs[1], ctxs[3])
    }

    static ProcessImageCMYK(ctxs, numOfCluster, maxIteration)
    {
        let imgWidth = ctxs[0].canvas.clientWidth;
        let imgHeight = ctxs[0].canvas.clientHeight;

        let imgData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);
        
        let cluster = new Array(numOfCluster);
        let clusterCount = new Array(numOfCluster).fill(0);
        let pixels = new Array(imgWidth * imgHeight);
        let assignment = new Array(imgWidth * imgHeight).fill(0);

        for (let i = 0; i < cluster.length; i++) {
            cluster[i] = new Array(4).fill(0);
        }

        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = new Array(4).fill(0);
        }

        let colorDelta = 1 / (numOfCluster);
        let color = 0

        let iteration = 0;

        for(let i = 0; i < cluster.length; i++)
        {
            cluster[i] = [color, color, color, color];
            color += colorDelta;
        }

        for(let i = 0; i < pixels.length; i++)
        {
            let cmyk = Color.RGBtoCMYK(
                imgData.data[(i * 4)],
                imgData.data[(i * 4) + 1],
                imgData.data[(i * 4) + 2]);
            
            pixels[i][0] = cmyk[0];
            pixels[i][1] = cmyk[1];
            pixels[i][2] = cmyk[2];
            pixels[i][3] = cmyk[3];
        }

        while(iteration < maxIteration)
        {
            for(let i = 0; i < pixels.length; i++)
            {
                let minDistance = Number.MAX_SAFE_INTEGER;

                for(let j = 0; j < cluster.length; j++)
                {
                    let distance = Utility.EuclideanDistance4(
                        pixels[i][0], pixels[i][1], pixels[i][2], pixels[i][3],
                        cluster[j][0], cluster[j][1], cluster[j][2], cluster[j][3]
                        );

                    if(minDistance > distance)
                    {
                        minDistance = distance;
                        assignment[i] = j;
                    }
                }   
            }

            for(let i = 0; i < cluster.length; i++)
            {
                let count = 0;
                let c = 0;
                let m = 0;
                let y = 0;
                let k = 0;

                for(let j = 0; j < assignment.length; j++)
                {
                    if(i == assignment[j])
                    {
                        c += pixels[j][0];
                        m += pixels[j][1];
                        y += pixels[j][2];
                        k += pixels[j][3];
                        count++;
                    }
                }

                if(count > 0)
                {
                    c = c / count;
                    m = m / count;
                    y = y / count;
                    k = k / count;

                    cluster[i] = [c, m, y, k];
                }

                if((iteration + 1) == maxIteration)
                {
                    clusterCount[i] = count;
                }
            }

            iteration++;
        }

        for(let i = 0; i < imgData.data.length; i += 4)
        {
            let rgb = Color.CMYKtoRGB(
                cluster[assignment[i / 4]][0],
                cluster[assignment[i / 4]][1],
                cluster[assignment[i / 4]][2],
                cluster[assignment[i / 4]][3]);

            imgData.data[i] = rgb[0];
            imgData.data[i + 1] = rgb[1];
            imgData.data[i + 2] = rgb[2];
        }

        ctxs[1].putImageData(imgData, 0, 0);

        for(let i = 0; i < cluster.length; i++)
        {
            let cmyk = Color.CMYKtoRGB(
                cluster[i][0],
                cluster[i][1],
                cluster[i][2],
                cluster[i][3]);
            
            cluster[i][0] = Math.round(cmyk[0]);
            cluster[i][1] = Math.round(cmyk[1]);
            cluster[i][2] = Math.round(cmyk[2]);
            cluster[i][3] = 255
        }

        for(let i = 0; i < clusterCount.length; i++)
        {
            for(let j = (i+1); j < clusterCount.length; j++)
            {
                if(clusterCount[i] > clusterCount[j])
                {
                    let temp = clusterCount[i];
                    clusterCount[i] = clusterCount[j];
                    clusterCount[j] = temp;

                    temp = cluster[i];
                    cluster[i] = cluster[j];
                    cluster[j] = temp;
                }
            }
        }

        this.ShowCluster(cluster[0], ctxs[1], ctxs[2])
        this.ShowCluster(cluster[1], ctxs[1], ctxs[3])
    }

    static ProcessImageHSV(ctxs, numOfCluster, maxIteration)
    {
        let imgWidth = ctxs[0].canvas.clientWidth;
        let imgHeight = ctxs[0].canvas.clientHeight;

        let imgData = ctxs[0].getImageData(0, 0, imgWidth, imgHeight);
        
        let cluster = new Array(numOfCluster);
        let clusterCount = new Array(numOfCluster).fill(0);
        let pixels = new Array(imgWidth * imgHeight);
        let assignment = new Array(imgWidth * imgHeight).fill(0);

        for (let i = 0; i < cluster.length; i++) {
            cluster[i] = new Array(3).fill(0);
        }

        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = new Array(3).fill(0);
        }

        // let colorDelta = 1 / (numOfCluster);
        // let color = 0

        let iteration = 0;

        // for(let i = 0; i < cluster.length; i++)
        // {
        //     cluster[i] = [color, color, color, color];
        //     color += colorDelta;
        // }

        cluster[0] = [120, 0.5, 0.5];
        cluster[1] = [120, 1, 1];


        for(let i = 0; i < pixels.length; i++)
        {
            let hsv = Color.RGBtoHSV(
                imgData.data[(i * 4)],
                imgData.data[(i * 4) + 1],
                imgData.data[(i * 4) + 2]);
            
            pixels[i][0] = hsv[0];
            pixels[i][1] = hsv[1];
            pixels[i][2] = hsv[2];
        }

        while(iteration < maxIteration)
        {
            for(let i = 0; i < pixels.length; i++)
            {
                let minDistance = Number.MAX_SAFE_INTEGER;

                for(let j = 0; j < cluster.length; j++)
                {
                    let distance = Utility.EuclideanDistance3(
                        pixels[i][0], pixels[i][1], pixels[i][2],
                        cluster[j][0], cluster[j][1], cluster[j][2]
                        );

                    if(minDistance > distance)
                    {
                        minDistance = distance;
                        assignment[i] = j;
                    }
                }   
            }

            for(let i = 0; i < cluster.length; i++)
            {
                let count = 0;
                let h = 0;
                let s = 0;
                let v = 0;

                for(let j = 0; j < assignment.length; j++)
                {
                    if(i == assignment[j])
                    {
                        h += pixels[j][0];
                        s += pixels[j][1];
                        v += pixels[j][2];
                        count++;
                    }
                }

                if(count > 0)
                {
                    h = Math.round(h / count);
                    s = s / count;
                    v = v / count;

                    cluster[i] = [h, s, v];
                }

                if((iteration + 1) == maxIteration)
                {
                    clusterCount[i] = count;
                }
            }

            iteration++;
        }

        for(let i = 0; i < imgData.data.length; i += 4)
        {
            let rgb = Color.HSVtoRGB(
                cluster[assignment[i / 4]][0],
                cluster[assignment[i / 4]][1],
                cluster[assignment[i / 4]][2]);

            imgData.data[i] = rgb[0];
            imgData.data[i + 1] = rgb[1];
            imgData.data[i + 2] = rgb[2];
        }

        ctxs[1].putImageData(imgData, 0, 0);

        for(let i = 0; i < cluster.length; i++)
        {
            let hsv = Color.HSVtoRGB(
                cluster[i][0],
                cluster[i][1],
                cluster[i][2]);
            
            cluster[i][0] = Math.round(hsv[0]);
            cluster[i][1] = Math.round(hsv[1]);
            cluster[i][2] = Math.round(hsv[2]);
            cluster[i][3] = 255
        }

        for(let i = 0; i < clusterCount.length; i++)
        {
            for(let j = (i+1); j < clusterCount.length; j++)
            {
                if(clusterCount[i] > clusterCount[j])
                {
                    let temp = clusterCount[i];
                    clusterCount[i] = clusterCount[j];
                    clusterCount[j] = temp;

                    temp = cluster[i];
                    cluster[i] = cluster[j];
                    cluster[j] = temp;
                }
            }
        }

        this.ShowCluster(cluster[0], ctxs[1], ctxs[2])
        this.ShowCluster(cluster[1], ctxs[1], ctxs[3])
    }

    static ShowCluster(color, source, ctx)
    {
        let imgData = source.getImageData(0, 0, source.canvas.clientWidth, source.canvas.clientHeight);

        for(let i = 0; i < imgData.data.length; i += 4)
        {
            if( imgData.data[i    ] == color[0] &&
                imgData.data[i + 1] == color[1] &&
                imgData.data[i + 2] == color[2])
            {
                imgData.data[i] = 255;
                imgData.data[i + 1] = 255;
                imgData.data[i + 2] = 255;
            }
            else
            {
                imgData.data[i] = 0;
                imgData.data[i + 1] = 0;
                imgData.data[i + 2] = 0;
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }
}