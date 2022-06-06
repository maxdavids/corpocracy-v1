/**
 * Created by mdavids on 26/04/2016.
 */
class Tweener
{
    constructor()
    {

    }

    public static Linear(from:number, change:number, currentTime:number, endTime:number):number {
        if (currentTime >= endTime) return from + change;

        return change * currentTime / endTime + from;
    }

    public static EaseInQuad(from:number, change:number, currentTime:number, endTime:number):number {
        if (currentTime >= endTime) return from + change;

        return change * (currentTime /= endTime) * currentTime + from;
    }

    public static EaseOutQuad(from:number, change:number, currentTime:number, endTime:number):number {
        if (currentTime >= endTime) return from + change;

        return -change * (currentTime /= endTime) * (currentTime - 2.0) + from;
    }

    public static EaseInOutQuad(from:number, change:number, currentTime:number, endTime:number):number {
        if (currentTime >= endTime) return from + change;

        currentTime /= endTime * 0.5;
        if (currentTime < 1.0) {
            return change * 0.5 * currentTime * currentTime + from;
        }

        return -change * 0.5 * (--currentTime * (currentTime - 2.0) - 1.0) + from;
    }

    /*public static EaseInOutCubic(from:number, change:number, currentTime:number, endTime:number) {
        if (currentTime >= endTime) return from + change;

        currentTime /= endTime * 0.5;
        if (currentTime < 1.0) {
            return change * 0.5 * Math.Pow(currentTime, 3.0) + from;
        }

        return change * 0.5 * (Math.Pow(currentTime - 2.0, 3.0) + 2.0) + from;
    }*/

    public static EaseInCatmullrom(from:number, change:number, currentTime:number, endTime:number):number {
        if (currentTime >= endTime) return from + change;

        currentTime /= endTime;
        currentTime = Tweener.catmullrom(currentTime, 0, 0, 1, 10); // Q, 0, 1, T

        return change * currentTime + from;
    }

    public static EaseOutCatmullrom(from:number, change:number, currentTime:number, endTime:number):number {
        if (currentTime >= endTime) return from + change;

        currentTime /= endTime;
        currentTime = Tweener.catmullrom(currentTime, -10, 0, 1, 1); // Q, 0, 1, T

        return change * currentTime + from;
    }

    public static EaseInOutCatmullrom(from:number, change:number, currentTime:number, endTime:number):number {
        if (currentTime >= endTime) return from + change;

        currentTime /= endTime * 0.5;
        if (currentTime < 1.0) {
            currentTime = Tweener.catmullrom(currentTime, 0, 0, 1, 10); // Q, 0, 1, T
            return change * 0.5 * currentTime + from;

        }

        currentTime = Tweener.catmullrom(currentTime - 1.0, -10, 0, 1, 1); // Q, 0, 1, T
        return change * 0.5 * currentTime + change * 0.5 + from;
    }

    private static catmullrom(t:number, p0:number, p1:number, p2:number, p3:number):number
    {
        return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
    }

}
export default Tweener;
