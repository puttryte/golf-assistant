export default class Utility
{
    // Returns input if the input is between the min and max 
    // else it would retrun min if input is less than the min
    // or it would return max if input is more than the min
    //Parameter: num    : number    : input value
    //           min    : number    : Minimum value 
    //           max    : number    : Maximum value
    //Return:    number 
    static Clamp(num, min, max)
    {
        return Math.max(Math.min(num, max), min);
    }

    //Get the Eclidean Distance using 3 XY coordinates
    //Parameter: length : Number    : length of both arrays
    //           p      : int Array : array of pixel information ie RBG = [0, 0, 0] = black
    //           q      : int Array : array of pixel information 
    static EuclideanDistance(length, p, q)
    {
        let a = 0;

        for(let i = 0; i < length; i++)
        {
            a += Math.pow((q[i] - p[i]), 2);
        }

        return Math.sqrt(a);
    }
}