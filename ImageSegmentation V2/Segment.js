export default class Segment
{
    //Parameter: imageData  : MyImageData   : from MyImageData.js
    //           xMin       : Number        : x coordinate of the top left bounding box of the segment
    //           yMin       : Number        : y coordinate of the top left bounding box of the segment
    //           xMax       : Number        : x coordinate of the bottom right bounding box of the segment
    //           yMax       : Number        : y coordinate of the bottom right bounding box of the segment
    constructor(imageData, xMin, yMin, xMax, yMax)
    {
        this.data = imageData.data;
        this.width = imageData.width;
        this.height = imageData.height;

        this.xMin = xMin;
        this.xMax = xMax;

        this.yMin = yMin;
        this.yMax = yMax;
    }
}