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
    //Parameter: q1 : number   : first X value
    //           q2 : number   : second X value
    //           q3 : number   : third X value
    //           p1 : number   : first Y value
    //           p2 : number   : second Y value
    //           p3 : number   : third Y value
    //Return:    number
    static EuclideanDistance3(q1, q2, q3, p1, p2, p3)
    {
        return Math.sqrt(Math.pow((q1 - p1), 2) + Math.pow((q2 - p2), 2) + Math.pow((q3 - p3), 2));
    }
    
    //Get the Eclidean Distance using 4 XY coordinates
    //Parameter: q1 : number   : first X value
    //           q2 : number   : second X value
    //           q3 : number   : third X value
    //           q4 : number   : fourth X value
    //           p1 : number   : first Y value
    //           p2 : number   : second Y value
    //           p3 : number   : third Y value
    //           p4 : number   : fourth Y value
    //Return:    number
    static EuclideanDistance4(q1, q2, q3, q4, p1, p2, p3, p4)
    {
        return Math.sqrt(Math.pow((q1 - p1), 2) + Math.pow((q2 - p2), 2) + Math.pow((q3 - p3), 2) + Math.pow((q4 - p4), 2));
    }
}