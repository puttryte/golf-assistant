import Utility from "./Utility.js";
import Color from "./Color.js";
import MyImageData from "./MyImageData.js";
import ImageProcessing from "./ImageProcessing.js";

export default class KMeans
{
    //start the kmeans algorithm
    //Parameter: source         : MyImageData   : from MyImageData.js
    //           colorSpace     : Number        : 0 = RGB, 1 = CMYK, 2 = HSV
    //           numOfCluster   : Number        : how many color to separate
    //           maxIteration   : Number        : how many iteration the algorithm will run
    //Return    Array of MyImageData : MyImageData for the Kmeans image and black and white image for each cluster
    //the cluster output are sorted from least to most white pixels
    static ProcessImage(source, colorSpace, numOfCluster, maxIteration)
    {
        let output = new Array(numOfCluster + 1);
        let cluster = new Array(numOfCluster);
        let clusterCount = new Array(numOfCluster);
        let assignment = new Array(source.height);
        let colorDelta = 0;
        let color = 0;
        let iteration = 0;

        //copy sources to output[0]
        for(let i = 0; i < output.length; i++)
        {
            output[i] = new MyImageData(source.width, source.height);

            if(i == 0)
            {
                ImageProcessing.CopyImageData(source.data, output[i].data);
            }
        }

        //colordelta for RGB
        if(colorSpace == 0)
        {
            colorDelta = Math.round(255 / (numOfCluster - 1));
        }
        //colordelta for CMYK and HSV
        else
        {
            colorDelta = 1 / numOfCluster;
        }

        //set up the cascading initial cluster color
        for(let i = 0; i < cluster.length; i++)
        {
            cluster[i] = [color, color, color];

            //add one more for CMYK
            if(colorSpace == 1)
            {
                cluster[i].push(color);
            }
            //for HSV set hue to 120 == green
            else
            {
                cluster[i][0] = 120
            }

            color += colorDelta;
        }

        //set up assignment variable
        for(let i = 0; i < assignment.length; i++)
        {
            assignment[i] = new Array(source.width).fill(0);
        }

        //if not RGB, convert the output[0] to the colorspace selected
        if(colorSpace > 0)
        {
            for(let i = 0; i < output[0].data.length; i++)
            {
                for(let j = 0; j < output[0].data[i].length; j++)
                {
                    //save alpha
                    let a = output[0].data[i][j][3];

                    //convert 
                    if(colorSpace == 1)
                    {
                        output[0].data[i][j] = Color.RGBtoCMYK(
                            output[0].data[i][j][0],
                            output[0].data[i][j][1],
                            output[0].data[i][j][2]
                        )
                    }
                    else
                    {
                        output[0].data[i][j] = Color.RGBtoHSV(
                            output[0].data[i][j][0],
                            output[0].data[i][j][1],
                            output[0].data[i][j][2]
                        )
                    }

                    //push back alpha
                    output[0].data[i][j].push(a);
                }
            }
        }

        //start of the algorithm
        while(iteration < maxIteration)
        {
            //Get assignment per pixel
            for (let i = 0; i < output[0].data.length; i++)
            {
                for(let j = 0; j < output[0].data[i].length; j++)
                {
                    let minDistance = Number.MAX_SAFE_INTEGER;

                    //assign pixel to the nearest cluster
                    for(let k = 0; k < cluster.length; k++)
                    {
                        let distance = Utility.EuclideanDistance(
                            cluster[k].length,
                            cluster[k],
                            output[0].data[i][j]
                        )

                        if(distance < minDistance)
                        {
                            minDistance = distance;
                            assignment[i][j] = k;
                        }
                    }
                }
            }

            //for each cluster, find the new color
            for(let i = 0; i < cluster.length; i++)
            {
                let clusterInfo = new Array(cluster[0].length + 1).fill(0);

                //add all the pixels assign to the cluster
                for(let j = 0; j < assignment.length; j++)
                {
                    for(let k = 0; k < assignment[i].length; k++)
                    {
                        if(i == assignment[j][k])
                        {
                            clusterInfo[0]++;

                            for(let l = 1; l < clusterInfo.length; l++)
                            {
                                clusterInfo[l] += output[0].data[j][k][l - 1];
                            }
                        }
                    }
                }

                //average out the sum for the color
                if(clusterInfo[0] > 0)
                {
                    clusterInfo[1] /= clusterInfo[0];
                    clusterInfo[2] /= clusterInfo[0];
                    clusterInfo[3] /= clusterInfo[0];

                    //dont round off number for CMYK
                    if(colorSpace != 1)
                    {
                        //only round off hue value for HSV
                        clusterInfo[1] = Math.round(clusterInfo[1]);
                        if(colorSpace == 0)
                        {
                            clusterInfo[2] = Math.round(clusterInfo[2]);
                            clusterInfo[3] = Math.round(clusterInfo[3]);
                        }
                    }

                    //save new color
                    cluster[i] = [clusterInfo[1], clusterInfo[2], clusterInfo[3]]

                    if(colorSpace == 1)
                    {
                        clusterInfo[4] /= clusterInfo[0];
                        cluster[i].push(clusterInfo[4]);
                    }
                }

                //if in the last iteration, save the count for sorting
                if((iteration + 1) == maxIteration)
                {
                    clusterCount[i] = clusterInfo[0];
                }
            }

            iteration++;
        }

        //convert color back to RGB
        if(colorSpace > 0)
        {
            for(let i = 0; i < cluster.length; i++)
            {
                if(colorSpace == 1)
                {
                    cluster[i] = Color.CMYKtoRGB(
                        cluster[i][0],
                        cluster[i][1],
                        cluster[i][2],
                        cluster[i][3]
                    );
                }
                else
                {
                    cluster[i] = Color.HSVtoRGB(
                        cluster[i][0],
                        cluster[i][1],
                        cluster[i][2]
                    );
                }
            }
        }

        //update output[0] to the new color based on assignment
        for(let i = 0; i < output[0].data.length; i++)
        {
            for(let j = 0; j < output[0].data[i].length; j++)
            {
                let alpha = output[0].data[i][j][output[0].data[i][j].length - 1];

                output[0].data[i][j] = [
                    cluster[assignment[i][j]][0],
                    cluster[assignment[i][j]][1],
                    cluster[assignment[i][j]][2],
                    alpha
                ];
            }
        }

        //sort cluster from least to most
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

        //update the rest of output to have a black and white image that represents the cluster
        for(let i = 0; i < cluster.length; i++)
        {
            for(let j = 0; j < output[0].data.length; j++)
            {
                for(let k = 0; k < output[0].data[j].length; k++)
                {
                    if( output[0].data[j][k][0] == cluster[i][0] &&
                        output[0].data[j][k][1] == cluster[i][1] &&
                        output[0].data[j][k][2] == cluster[i][2])
                    {
                        output[i + 1].data[j][k][0] = 255;
                        output[i + 1].data[j][k][1] = 255;
                        output[i + 1].data[j][k][2] = 255;
                    }
                    output[i + 1].data[j][k][3] = output[0].data[j][k][3]
                }
            }
        }

        return output;
    }
}