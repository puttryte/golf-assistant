export default class MyImageData
{
    //Parameter: width          : Number            : row number
    //           height         : Number            : column number
    //           uint8_array    : Uint8ClampedArray : image information using RGBA color space
    constructor(width, height, uint8_array)
    {
        let counter = 0;
        let empty = false;

        //check if Uint8ClampedArray image data is provided,
        //if not, return the object with a black image / "empty" image
        if( (arguments.length == 2) &&
            (typeof(arguments[0]) === 'number') && 
            (typeof(arguments[1]) === 'number'))
        {
            empty = true;
        }

        this.width = width;
        this.height = height;
        this.data = new Array(this.height);

        for(let i = 0; i < this.height; i++)
        {
            this.data[i] = new Array(this.width);

            for(let j = 0; j < this.width; j++)
            {
                if(empty)
                {
                    this.data[i][j] = [0, 0, 0, 255];
                }
                else
                {
                    this.data[i][j] = [
                        uint8_array[counter++],
                        uint8_array[counter++],
                        uint8_array[counter++],
                        uint8_array[counter++]
                    ];
                }
            }
        }
    }
    
    //Return a Uint8Array of the image data of the object.
    getUint8Array()
    {
        let arr = new Uint8Array(this.width * this.height * 4);

        let counter = 0;

        for(let i = 0; i < this.height; i++)
        {
            for(let j = 0; j < this.width; j++)
            {
                arr[counter++] = this.data[i][j][0];
                arr[counter++] = this.data[i][j][1];
                arr[counter++] = this.data[i][j][2];
                arr[counter++] = this.data[i][j][3];
            }
        }

        return arr;
    }
}