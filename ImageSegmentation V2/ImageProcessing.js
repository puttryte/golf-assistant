import Utility from "./Utility.js";

export default class ImageProcessing
{
    //being used for Erosion and Dilation
    //3 x 3 hit square
    static hitMarker = [255, 255, 255, 255, 255, 255, 255, 255, 255];

    static CopyImageData(source, out)
    {
        for(let i = 0; i < source.length; i++)
        {
            for(let j = 0; j < source[i].length; j++)
            {
                for(let k = 0; k < source[i][j].length; k++)
                {
                    out[i][j][k] = source[i][j][k];
                }
            }
        }
    }

    //Scale the input dimension with base as the minimum value while keeping the dimension ratio
    //Parameter: width  : int   
    //           height : int
    //           base   : int
    //Return:    int Array  : length of 2
    static GetImageScale(width, height, base)
    {
        return width > height
            ? [Math.round((width * base)) / height, base]
            : [base, Math.round((height * base) / width)];
    }
    
    //Equals the average of all the pixels to the number given
    //Parameter: source : CanvasRenderingContext2D  : input canvas
    //           canvas : CanvasRenderingContext2D  : output canvas
    //           normal : int                       : average to equal to
    static NormalizeImageBrightness(imageData, normal)
    {
        let average = 0;
        let diff = 0;

        for(let i = 0; i < imageData.height; i++)
        {
            for(let j = 0; j < imageData.width; j++)
            {
                average += imageData.data[i][j][0] + imageData.data[i][j][1] + imageData.data[i][j][2]; 
            }
        }

        average /= (imageData.width * imageData.height * 3)
        diff = Math.floor(normal - average);

        for(let i = 0; i < imageData.height; i++)
        {
            for(let j = 0; j < imageData.width; j++)
            {
                for(let k = 0; k < 3; k++)
                {
                    imageData.data[i][j][k] = Utility.Clamp(imageData.data[i][j][k] + diff, 0, 255);
                }
            }
        }
    }

    //Erode the image using the hitMarker variable.
    //Parameter: source     : CanvasRenderingContext2D  : input
    //           canv       : CanvasRenderingContext2D  : output
    //           iteration  : int                       : number of time to erode the image
    static Erosion(source, maxIteration)
    {
        let iteration = 0;

        while(iteration < maxIteration)
        {
            let assignment = new Array(source.height);

            for(let i = 0; i < assignment.length; i++)
            {
                assignment[i] = new Array(source.width).fill(0);
            }

            for(let i = 0; i < source.data.length; i++)
            {
                for(let j = 0; j < source.data[i].length; j++)
                {
                    if((i == 0) || (j == 0) || (i == (source.height - 1)) || (j == (source.width - 1)))
                    {
                        source.data[i][j] = [0, 0, 0, source.data[i][j][3]];
                    }
                    else if(this.isHit(source, i, j, true))
                    {
                        assignment[i][j] = 255;
                    }
                }
            }

            for(let i = 0; i < source.data.length; i++)
            {
                for(let j = 0; j < source.data[i].length; j++)
                {
                    let color = assignment[i][j];
                    source.data[i][j] = [color, color, color, source.data[i][j][3]];
                }
            }

            iteration++;
        }
    }

    //Dilate the image using the hitMarket variable
    //Parameter: source     : CanvasRenderingContext2D  : input
    //           canv       : CanvasRenderingContext2D  : output
    //           iteration  : int                       : number of time to dilate the image
    static Dilation(source, maxIteration)
    {
        let iteration = 0;

        while(iteration < maxIteration)
        {
            let assignment = new Array(source.height);

            for(let i = 0; i < assignment.length; i++)
            {
                assignment[i] = new Array(source.width).fill(0);
            }

            for(let i = 0; i < source.data.length; i++)
            {
                for(let j = 0; j < source.data[i].length; j++)
                {
                    if((i == 0) || (j == 0) || (i == (source.height - 1)) || (j == (source.width - 1)))
                    {
                        source.data[i][j] = [0, 0, 0, source.data[i][j][3]];
                    }
                    else if(this.isHit(source, i, j, false))
                    {
                        assignment[i][j] = 255;
                    }
                }
            }

            for(let i = 0; i < source.data.length; i++)
            {
                for(let j = 0; j < source.data[i].length; j++)
                {
                    let color = assignment[i][j];
                    source.data[i][j] = [color, color, color, source.data[i][j][3]];
                }
            }

            iteration++;
        }
    }

    //Check if the pixel index and its adjacent pixels fit the hitMarker vaeriale.
    //Parameter: pixels     : Uint8Array    : list of pixels information (1D array)
    //           index      : int           : position of the pixel in the array
    //           row        : int           : count of pixels per row
    //           indicator  : boolean       : true for erosion, false for dilation
    //Return:    boolean
    static isHit(source, y, x, indicator)
    {
        if(indicator)
        {
            //Equal to the hitMaker
            if( source.data[y - 1][x - 1][0] == this.hitMarker[0] &&
                source.data[y - 1][x    ][0] == this.hitMarker[1] &&
                source.data[y - 1][x + 1][0] == this.hitMarker[2] &&

                source.data[y    ][x - 1][0] == this.hitMarker[3] &&
                source.data[y    ][x    ][0] == this.hitMarker[4] &&
                source.data[y    ][x + 1][0] == this.hitMarker[5] &&

                source.data[y + 1][x - 1][0] == this.hitMarker[6] &&
                source.data[y + 1][x    ][0] == this.hitMarker[7] &&
                source.data[y + 1][x + 1][0] == this.hitMarker[8])
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
            //true if only one is equal to hitMarker
            if( source.data[y - 1][x - 1][0] == this.hitMarker[0] ||
                source.data[y - 1][x    ][0] == this.hitMarker[1] ||
                source.data[y - 1][x + 1][0] == this.hitMarker[2] ||

                source.data[y    ][x - 1][0] == this.hitMarker[3] ||
                source.data[y    ][x    ][0] == this.hitMarker[4] ||
                source.data[y    ][x + 1][0] == this.hitMarker[5] ||

                source.data[y + 1][x - 1][0] == this.hitMarker[6] ||
                source.data[y + 1][x    ][0] == this.hitMarker[7] ||
                source.data[y + 1][x + 1][0] == this.hitMarker[8])
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}