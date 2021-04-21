import Utility from "./Utility.js";
import Color from "./Color.js";
import MyImageData from "./MyImageData.js";
import ImageProcessing from "./ImageProcessing.js";

export default class KMeans
{
    static ProcessImage(source, colorSpace, numOfCluster, maxIteration)
    {
        let output = new Array(numOfCluster + 1);
        let cluster = new Array(numOfCluster);
        let clusterCount = new Array(numOfCluster);
        let assignment = new Array(source.height);
        let colorDelta = 0;
        let color = 0;
        let iteration = 0;

        for(let i = 0; i < output.length; i++)
        {
            output[i] = new MyImageData(source.width, source.height);

            if(i == 0)
            {
                ImageProcessing.CopyImageData(source.data, output[i].data);
            }
        }

        if(colorSpace == 0)
        {
            colorDelta = Math.round(255 / (numOfCluster - 1));
        }
        else
        {
            colorDelta = 1 / numOfCluster;
        }

        for(let i = 0; i < cluster.length; i++)
        {
            cluster[i] = [color, color, color];

            if(colorSpace == 1)
            {
                cluster[i].push(color);
            }
            else
            {
                cluster[i][0] = 120
            }

            color += colorDelta;
        }

        for(let i = 0; i < assignment.length; i++)
        {
            assignment[i] = new Array(source.width).fill(0);
        }

        if(colorSpace > 0)
        {
            for(let i = 0; i < output[0].data.length; i++)
            {
                for(let j = 0; j < output[0].data[i].length; j++)
                {
                    let a = output[0].data[i][j][3];

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

                    output[0].data[i][j].push(a);
                }
            }
        }

        while(iteration < maxIteration)
        {
            for (let i = 0; i < output[0].data.length; i++)
            {
                for(let j = 0; j < output[0].data[i].length; j++)
                {
                    let minDistance = Number.MAX_SAFE_INTEGER;

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

            for(let i = 0; i < cluster.length; i++)
            {
                let clusterInfo = new Array(cluster[0].length + 1).fill(0);

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

                if(clusterInfo[0] > 0)
                {
                    clusterInfo[1] /= clusterInfo[0];
                    clusterInfo[2] /= clusterInfo[0];
                    clusterInfo[3] /= clusterInfo[0];

                    if(colorSpace != 1)
                    {
                        clusterInfo[1] = Math.round(clusterInfo[1]);
                        if(colorSpace == 0)
                        {
                            clusterInfo[2] = Math.round(clusterInfo[2]);
                            clusterInfo[3] = Math.round(clusterInfo[3]);
                        }
                    }

                    cluster[i] = [clusterInfo[1], clusterInfo[2], clusterInfo[3]]

                    if(colorSpace == 1)
                    {
                        clusterInfo[4] /= clusterInfo[0];
                        cluster[i].push(clusterInfo[4]);
                    }
                }

                if((iteration + 1) == maxIteration)
                {
                    clusterCount[i] = clusterInfo[0];
                }
            }

            iteration++;
        }

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