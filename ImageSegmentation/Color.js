export default class Color
{
    //converts RGB to CMYK
    //Parameter:red     : int
    //          green   : int
    //          blue    : int
    //sorce: https://www.rapidtables.com/convert/color/rgb-to-cmyk.html
    static RGBtoCMYK(red, green, blue)
    {
        let cyan, magenta, yellow, key;

        let red_p = red/255;
        let green_p = green/255;
        let blue_p = blue/255;

        key = 1 - Math.max(red_p, green_p, blue_p);

        if(key == 1)
        {
            cyan = 0;
            magenta = 0;
            yellow = 0;
        }
        else
        {
            cyan = (1 - red_p - key) / (1 - key)
            magenta = (1 - green_p - key) / (1 - key);
            yellow = (1 - blue_p - key) / (1 - key);
        }

        return [cyan, magenta, yellow, key];
    }

    //converts RGB to HSV
    //Parameter:red     : int
    //          green   : int
    //          blue    : int
    //source: https://www.rapidtables.com/convert/color/rgb-to-hsv.html
    static RGBtoHSV(red, green, blue)
    {
        let hue, saturation, value;

        let red_p = red/255;
        let green_p = green/255;
        let blue_p = blue/255;

        let colorMax = Math.max(red_p, green_p, blue_p);
        let colorMin= Math.min(red_p, green_p, blue_p);
        let colorDelta = colorMax - colorMin;

        value = colorMax;

        if(colorMax == 0)
        {
            saturation = 0;
        }
        else
        {
            saturation = colorDelta / colorMax;
        }

        if(colorDelta == 0)
        {
            hue = 0;
        }
        else if(colorMax == red_p)
        {
            hue = 60 * (((green_p - blue_p) / colorDelta) % 6);
        }
        else if(colorMax == green_p)
        {
            hue = 60 * (((blue_p - red_p) / colorDelta) + 2);
        }
        else
        {
            hue = 60 * (((red_p - green_p) / colorDelta) + 4);
        }

        return [hue, saturation, value];
    }

    //converts CMYK to RGB
    //Parameter:vyan    : int
    //          magenta : int
    //          yellow  : int
    //          key     : int
    //source: https://www.rapidtables.com/convert/color/cmyk-to-rgb.html
    static CMYKtoRGB(cyan, magenta, yellow, key)
    {
        let red = 255 * (1 - cyan) * (1 - key);
        let green = 255 * (1 - magenta) * (1 - key);
        let blue = 255 * (1 - yellow) * (1 - key);

        return [red, green, blue];
    }

    //converts HSV to RGB
    //Parameter:hue         : int
    //          saturation  : int
    //          value       : int
    //source: https://www.rapidtables.com/convert/color/hsv-to-rgb.html
    static HSVtoRGB(hue, saturation, value)
    {
        if(hue < 0)
        {
            hue += 360;
        }
        else if(hue > 360)
        {
            hue -= 360;
        }

        let c = value * saturation;
        let x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
        let m = value - c;

        let rp;
        let gp;
        let bp;

        if(hue < 60)
        {
            rp = c;
            gp = x;
            bp = 0;
        }
        else if(hue < 120)
        {
            rp = x;
            gp = c;
            bp = 0;
        }
        else if(hue < 180)
        {
            rp = 0;
            gp = c;
            bp = x;
        }
        else if(hue < 240)
        {
            rp = 0;
            gp = x;
            bp = c;
        }
        else if(hue < 300)
        {
            rp = x;
            gp = 0;
            bp = c;
        }
        else
        {
            rp = c;
            gp = 0;
            bp = x;
        }

        let red = (rp + m) * 255;
        let green = (gp + m) * 255;
        let blue = (bp + m) * 255;

        return [red, green, blue];
    }
}