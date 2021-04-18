export default class Segment
{
    constructor(imageData, a, b, c, d)
    {
        this.data = imageData.data;
        this.width = imageData.width;
        this.height = imageData.height;

        this.xMin = a;
        this.xMax = c;

        this.yMin = b;
        this.yMax = d;
    }
}