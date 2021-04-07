export default class Utility
{
    static Clamp(num, min, max)
    {
        return Math.max(Math.min(num, max), min);
    }

    static EuclideanDistance3(q1, q2, q3, p1, p2, p3)
    {
        return Math.sqrt(Math.pow((q1 - p1), 2) + Math.pow((q2 - p2), 2) + Math.pow((q3 - p3), 2));
    }

    static EuclideanDistance4(q1, q2, q3, q4, p1, p2, p3, p4)
    {
        return Math.sqrt(Math.pow((q1 - p1), 2) + Math.pow((q2 - p2), 2) + Math.pow((q3 - p3), 2) + Math.pow((q4 - p4), 2));
    }
}