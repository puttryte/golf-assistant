import Utility from "./Utility.js";

export default class ImageProcessing
{
    static hitMarker = [ 255, 255, 255, 
        255, 255, 255, 
        255, 255, 255];

    static GetImageScale(width, height, base)
    {
        if(width > height)
        {
            return [Math.round((width * base) / height), base]
        }
        else
        {
            return [base, Math.round((height * base) / width)]
        }
    }

    static NormalizeImageBrightness(source, canvas, normal)
    {
        let imageData = source.getImageData(0, 0, source.canvas.clientWidth, source.canvas.clientHeight);

        let average = 0;
        let count = 0;

        for(let i = 0; i < imageData.data.length; i += 4)
        {
            average += (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]);
            count += 3;
        }

        average = Math.round(average/count);

        let diff = normal - average;

        for(let i = 0; i < imageData.data.length; i += 4)
        {
            let r = Utility.Clamp((imageData.data[i    ] + diff), 0, 255);
            let g = Utility.Clamp((imageData.data[i + 1] + diff), 0, 255);
            let b = Utility.Clamp((imageData.data[i + 2] + diff), 0, 255);

            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
        }

        canvas.putImageData(imageData, 0, 0);
    }

    static Erosion(source, canv, iteration)
    {
        let newImage = source.getImageData(0, 0, source.canvas.clientWidth, source.canvas.clientHeight);
        let pixels = newImage.data;
        let rowCount = source.canvas.clientWidth * 4;

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
                    if(this.isHit(pixels, i, rowCount, true))
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

    static Dilation(source, canv, iteration)
    {
        let newImage = source.getImageData(0, 0, source.canvas.clientWidth, source.canvas.clientHeight);
        let pixels = newImage.data;
        let rowCount = source.canvas.clientWidth * 4;
    
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
                    if(this.isHit(pixels, i, rowCount, false))
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

    static isHit(pixels, index, row, indicator)
    {
        if(indicator)
        {
            if( pixels[index - row - 4] == this.hitMarker[0] &&
                pixels[index - row ]    == this.hitMarker[1] &&
                pixels[index - row + 4] == this.hitMarker[2] &&
                pixels[index - 4]       == this.hitMarker[3] &&
                pixels[index ]          == this.hitMarker[4] &&
                pixels[index + 4]       == this.hitMarker[5] &&
                pixels[index + row - 4] == this.hitMarker[6] &&
                pixels[index + row ]    == this.hitMarker[7] &&
                pixels[index + row + 4] == this.hitMarker[8])
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
            if( pixels[index - row - 4] == this.hitMarker[0] ||
                pixels[index - row ]    == this.hitMarker[1] ||
                pixels[index - row + 4] == this.hitMarker[2] ||
                pixels[index - 4]       == this.hitMarker[3] ||
                pixels[index ]          == this.hitMarker[4] ||
                pixels[index + 4]       == this.hitMarker[5] ||
                pixels[index + row - 4] == this.hitMarker[6] ||
                pixels[index + row ]    == this.hitMarker[7] ||
                pixels[index + row + 4] == this.hitMarker[8])
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