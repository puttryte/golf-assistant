import MyImageData from "./MyImageData.js";

export default class HoughTransform
{
    static HoughLineTranform(segment)
    {
        let width = segment.width;
        let height = segment.height;

        let angles = []
        let accumulator = [];
        let edges = [];
        let startPixel = -1;
        let maxDistance = Math.round(Math.sqrt((width * width) + (height * height)));

        for(let i = -90; i <= 89; i++)
        {
            angles.push(i);
        }

        for(let i = 0; i < segment.height; i++)
        {
            for(let j = 0; j < segment.width; j++)
            {
                if(segment.data[i][j][0] == 255)
                {
                    startPixel = [i, j];
                    break;
                }
            }
            if(startPixel != -1)
            {
                break;
            }
        }
        
        edges = this.GetEdge(segment, startPixel);

        for(let i = 0; i < edges.length; i++)
        {
            let x = edges[i][1];
            let y = edges[i][0];

            for(let j = 0; j < angles.length; j++)
            {
                let theta = angles[j] * (Math.PI/180);
                let distance = Math.round((x * Math.cos(theta)) + (y * Math.sin(theta)));
                accumulator.push([angles[j], distance, x, y]);
            }
        }
        
        let output = new Array(maxDistance * 2);

        for(let i = 0; i < output.length; i++)
        {
            output[i] = new Array(angles.length).fill(0);
        }

        for(let i = 0; i < accumulator.length; i++)
        {
            let col = accumulator[i][1] + maxDistance;
            let row = accumulator[i][0] + 90;

            output[col][row] += 1;
        }

        return output;
    }

    //#region Hough line transform image output version
    // static HoughLineTranform(segment)
    // {
    //     let width = segment.width;
    //     let height = segment.height;

    //     let angles = []
    //     let accumulator = [];
    //     let edges = [];
    //     let startPixel = -1;
    //     let maxDistance = Math.round(Math.sqrt((width * width) + (height * height)));

    //     for(let i = -90; i <= 89; i++)
    //     {
    //         angles.push(i);
    //     }

    //     for(let i = 0; i < segment.height; i++)
    //     {
    //         for(let j = 0; j < segment.width; j++)
    //         {
    //             if(segment.data[i][j][0] == 255)
    //             {
    //                 startPixel = [i, j];
    //                 break;
    //             }
    //         }
    //         if(startPixel != -1)
    //         {
    //             break;
    //         }
    //     }
        
    //     edges = GetEdge(segment, startPixel);

    //     for(let i = 0; i < edges.length; i++)
    //     {
    //         let x = edges[i][1];
    //         let y = edges[i][0];

    //         for(let j = 0; j < angles.length; j++)
    //         {
    //             let theta = angles[j] * (Math.PI/180);
    //             let distance = Math.round((x * Math.cos(theta)) + (y * Math.sin(theta)));
    //             accumulator.push([angles[j], distance]);
    //         }
    //     }
        
    //     let houghImage = new MyImageData(angles.length, maxDistance * 2);
    //     let max = 0;
        
    //     for(let i = 0; i < accumulator.length; i++)
    //     {
    //         let col = accumulator[i][1] + maxDistance;
    //         let row = accumulator[i][0] + 90;

    //         houghImage.data[col][row][0] += 1;
    //         houghImage.data[col][row][1] += 1;
    //         houghImage.data[col][row][2] += 1;

    //         if(houghImage.data[col][row][0] > max)
    //         {
    //             max = houghImage.data[col][row][0];
    //         }
    //     }

    //     let scale = 255 / max;
    //     let peakthreshold = 255 * (90/ 100);
    //     let peaks = [];

    //     for(let i = 0; i < houghImage.data.length; i++)
    //     {
    //         for(let j = 0; j < houghImage.data[i].length; j++)
    //         {
    //             if(houghImage.data[i][j][0] > 0)
    //             {
    //                 houghImage.data[i][j][0] *= scale;
    //                 houghImage.data[i][j][1] *= scale;
    //                 houghImage.data[i][j][2] *= scale;

    //                 if(houghImage.data[i][j][0] > peakthreshold && Math.abs(j-90) > 80)
    //                 {
    //                     console.log(houghImage.data[i][j][0], i - maxDistance, j - 90)
    //                     houghImage.data[i][j][0] = 255;
    //                     houghImage.data[i][j][1] = 0;
    //                     houghImage.data[i][j][2] = 0;

    //                     peaks.push([i - maxDistance, j - 90]);
    //                 }
    //             }
    //         }
    //     }

    //     return [houghImage, peaks];
    // }
    //#endregion

    static HoughCircleTranform(segment, radius)
    {
        let width = segment.width;
        let height = segment.height;
        let angles = []
        let edges = [];
        let accumulator = new Array(height+ (2 * radius));
        let startPixel = -1;

        for(let i = 0; i < accumulator.length; i++)
        {
            accumulator[i] = new Array(width + (2 * radius)).fill(0);
        }

        for(let i = 0; i <= 359; i++)
        {
            angles.push(i);
        }

        for(let i = 0; i < segment.height; i++)
        {
            for(let j = 0; j < segment.width; j++)
            {
                if(segment.data[i][j][0] == 255)
                {
                    startPixel = [i, j];
                    break;
                }
            }
            if(startPixel != -1)
            {
                break;
            }
        }

        edges = this.GetEdge(segment, startPixel);

        for(let i = 0; i < edges.length; i++)
        {
            let a = edges[i][1] + radius;
            let b = edges[i][0] + radius;

            for(let j = 0; j < angles.length; j++)
            {
                let theta = angles[j] * (Math.PI/180);
                let x = Math.round(a - (radius * Math.cos(theta)));
                let y = Math.round(b - (radius * Math.sin(theta)));
                accumulator[y][x] += 1;

            }
        }

        return accumulator;
    }

    static GetHoughLinePeaks(accumulator, peakThreshold, peakRange)
    {
        let peaks = [];
        let max = 0;
        let threshold = 0;
        let maxDistance = accumulator.length / 2;
        
        for(let i = 0; i < accumulator.length; i++)
        {
            for(let j = 0; j < accumulator[i].length; j++)
            {
                if(accumulator[i][j] > max)
                {
                    max = accumulator[i][j];
                }
            }
        }

        threshold = max * peakThreshold;

        for(let i = 0; i < accumulator.length; i++)
        {
            for(let j = 0; j < accumulator[i].length; j++)
            {
                if(accumulator[i][j] > threshold)
                {
                    peaks.push([i, j]);
                }
            }
        }

        for(let i = 0; i < peaks.length; i++)
        {
            for(let j = i + 1; j < peaks.length; j++)
            {
                let y = Math.abs(peaks[i][0] - peaks[j][0]);
                let x = Math.abs(peaks[i][1] - peaks[j][1]);

                if(x < peakRange && y < peakRange)
                {
                    peaks.splice(j - 1, 1);
                    j--
                }
            }
        }

        for(let i = 0; i < peaks.length; i++)
        {
            peaks[i][0] = peaks[i][0] - maxDistance;
            peaks[i][1] = peaks[i][1] - 90;
        }

        return peaks;
    }

    static GetHoughCirclePeaks(accumulator, peakThreshold, peakRange)
    {
        let peaks = [];
        let max = 0;
        let threshold = 0;
        
        for(let i = 0; i < accumulator.length; i++)
        {
            for(let j = 0; j < accumulator[i].length; j++)
            {
                if(accumulator[i][j] > max)
                {
                    max = accumulator[i][j];
                }
            }
        }

        threshold = max * peakThreshold;

        for(let i = 0; i < accumulator.length; i++)
        {
            for(let j = 0; j < accumulator[i].length; j++)
            {
                if(accumulator[i][j] > threshold)
                {
                    peaks.push([i, j]);
                }
            }
        }

        for(let i = 0; i < peaks.length; i++)
        {
            for(let j = i + 1; j < peaks.length; j++)
            {
                let y = Math.abs(peaks[i][0] - peaks[j][0]);
                let x = Math.abs(peaks[i][1] - peaks[j][1]);

                if(x < peakRange && y < peakRange)
                {
                    peaks.splice(j - 1, 1);
                    j--
                }
            }
        }

        return peaks;
    }

    static ShowHoughLines(source, output, segment, lineDatas)
    {
        let temp_ImageData = source.getImageData(0, 0, source.canvas.width, source.canvas.height);
        output.putImageData(temp_ImageData, 0, 0);

        for(let i = 0; i < lineDatas.length; i++)
        {
            let r = lineDatas[i][0];
            let angle = lineDatas[i][1];
            let lineLength = segment.width;
        
            let x = segment.xMin + (r * Math.cos(angle * (Math.PI / 180)));
            let y = segment.yMin + (r * Math.sin(angle * (Math.PI / 180)));

            if(angle < 0)
            {
                angle += 90;
            }
            else
            {
                angle -= 90;
            }

            let a = x + (lineLength * Math.cos(angle * (Math.PI / 180)))
            let b = y + (lineLength * Math.sin(angle * (Math.PI / 180)))

            output.beginPath();
            output.lineWidth = '2';
            output.strokeStyle = 'red';
            output.moveTo(x, y);
            output.lineTo(a, b);
            output.stroke()
        }
    }

    static ShowHoughCircle(source, output, segment, lineDatas, radius)
    {
        let temp_ImageData = source.getImageData(0, 0, source.canvas.width, source.canvas.height);
        output.putImageData(temp_ImageData, 0, 0);

        for(let i = 0; i < lineDatas.length; i++)
        {
            let x = lineDatas[i][1] + segment.xMin - radius;
            let y = lineDatas[i][0] + segment.yMin - radius;

            output.beginPath();
            output.lineWidth = '2';
            output.strokeStyle = 'red';
            output.arc(x, y, radius, 0, 2 * Math.PI);
            output.stroke()
        }
    }

    static TestAnalysis(houghImageOutput, accum, peaks)
    {
        let newImage = new MyImageData(accum[0].length, accum.length)
        let max = 0;

        for(let i = 0; i < accum.length; i++)
        {
            for(let j = 0; j < accum[i].length; j++)
            {
                if(accum[i][j] > max)
                {
                    max = accum[i][j];
                }
            }
        }

        let scale = 255 / max;

        for(let i = 0; i < accum.length; i++)
        {
            for(let j = 0; j < accum[i].length; j++)
            {
                //console.log(i, j)
                let color = accum[i][j] * scale;
                newImage.data[i][j][0] = color;
                newImage.data[i][j][1] = color;
                newImage.data[i][j][2] = color;
            }
        }

        for(let i = 0; i < peaks.length; i++)
        {
            newImage.data[peaks[i][0] + (accum.length / 2)][peaks[i][1] + 90] = [255, 0, 0, 255];
        }

        houghImageOutput.canvas.width = newImage.width;
        houghImageOutput.canvas.height = newImage.height;
        houghImageOutput = houghImageOutput.canvas.getContext('2d');
        let temp_ImageData = new ImageData(newImage.width, newImage.height);
        temp_ImageData.data.set(newImage.getUint8Array());
        houghImageOutput.putImageData(temp_ImageData, 0, 0);
    }

    static TestAnalysis2(houghImageOutput, accum, peaks)
    {
        let newImage = new MyImageData(accum[0].length, accum.length)
        console.log(newImage)
        let max = 0;

        for(let i = 0; i < accum.length; i++)
        {
            for(let j = 0; j < accum[i].length; j++)
            {
                if(accum[i][j] > max)
                {
                    max = accum[i][j];
                }
            }
        }

        let scale = 255 / max;

        for(let i = 0; i < accum.length; i++)
        {
            for(let j = 0; j < accum[i].length; j++)
            {
                let color = accum[i][j] * scale;
                newImage.data[i][j][0] = color;
                newImage.data[i][j][1] = color;
                newImage.data[i][j][2] = color;
            }
        }

        
        for(let i = 0; i < peaks.length; i++)
        {
            newImage.data[peaks[i][0]][peaks[i][1]] = [255, 0, 0, 255];
        }


        houghImageOutput.canvas.width = newImage.width;
        houghImageOutput.canvas.height = newImage.height;
        houghImageOutput = houghImageOutput.canvas.getContext('2d');
        let temp_ImageData = new ImageData(newImage.width, newImage.height);
        temp_ImageData.data.set(newImage.getUint8Array());
        houghImageOutput.putImageData(temp_ImageData, 0, 0);
    }

    static GetEdge(source, start)
    {
        let output = [];
        let current = [start[0], start[1]];
        let dir = 3;

        do
        {
            output.push([current[0], current[1]]);
            let found = false;

            while(!found)
            {
                let x = current[1];
                let y = current[0];

                if(dir == 0)
                {
                    x -= 1;
                    y -= 1;
                }
                else if(dir == 1)
                {
                    y -= 1;
                }
                else if(dir == 2)
                {
                    x += 1;
                    y -= 1;
                }
                else if(dir == 3)
                {
                    x += 1;
                }
                else if(dir == 4)
                {
                    x += 1;
                    y += 1;
                }
                else if(dir == 5)
                {
                    y += 1;
                }
                else if(dir == 6)
                {
                    x -= 1;
                    y += 1;
                }
                else if(dir == 7)
                {
                    x -= 1;
                }

                if(source.data[y][x][0] == 255)
                {
                    found = true;
                    current = [y, x];
                    dir -= 3;

                    if(dir < 0)
                    {
                        dir += 8;
                    }
                }
                else
                {
                    dir++;

                    if(dir > 7)
                    {
                        dir = 0;
                    }
                }
            }
        }
        while(!(start[0] == current[0] && start[1] == current[1]))

        return output;
    }
}