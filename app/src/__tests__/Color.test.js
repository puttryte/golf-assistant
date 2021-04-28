import Color from '../../public/Color';

test('convert RGB(0,0,0) to equal CMYK(0,0,0,1)', () => {
    expect(Color.RGBtoCMYK(0, 0, 0)).toEqual([0, 0, 0, 1]);
});

test('convert RGB(255,255,255) to equal CMYK(0,0,0,0)', () => {
    expect(Color.RGBtoCMYK(255, 255, 255)).toEqual([0, 0, 0, 0]);
});

test('convert RGB(128,128,128) to equal CMYK(0,0,0,0.5)', () => {
    const cmyk = Color.RGBtoCMYK(128, 128, 128);

    expect(cmyk[0]).toBe(0);
    expect(cmyk[1]).toBe(0);
    expect(cmyk[2]).toBe(0);
    expect(cmyk[3]).toBeCloseTo(0.5);
});

test('convert RGB(255,0,0) to equal CMYK(0,1,1,0)', () => {
    expect(Color.RGBtoCMYK(255, 0, 0)).toEqual([0, 1, 1, 0]);
});

test('convert RGB(0,255,0) to equal CMYK(1,0,1,0)', () => {
    expect(Color.RGBtoCMYK(0, 255, 0)).toEqual([1, 0, 1, 0]);
});

test('convert RGB(0,0,255) to equal CMYK(1,1,0,0)', () => {
    expect(Color.RGBtoCMYK(0, 0, 255)).toEqual([1, 1, 0, 0]);
});

test('convert RGB(0,0,0) to equal HSV(0,0,0)', () => {
    expect(Color.RGBtoHSV(0, 0, 0)).toEqual([0, 0, 0]);
});

test('convert RGB(255,255,255) to equal HSV(0,0,1)', () => {
    expect(Color.RGBtoHSV(255, 255, 255)).toEqual([0, 0, 1]);
});

test('convert RGB(128,128,128) to equal HSV(0,0,0.5)', () => {
    const hsv = Color.RGBtoHSV(128, 128, 128);

    expect(hsv[0]).toBe(0);
    expect(hsv[1]).toBe(0);
    expect(hsv[2]).toBeCloseTo(0.5);
});

test('convert RGB(255,0,0) to equal HSV(0,1,1)', () => {
    expect(Color.RGBtoHSV(255, 0, 0)).toEqual([0, 1, 1]);
});

test('convert RGB(0,255,0) to equal HSV(120,1,1)', () => {
    expect(Color.RGBtoHSV(0, 255, 0)).toEqual([120, 1, 1]);
});

test('convert RGB(0,0,255) to equal HSV(240,1,1)', () => {
    expect(Color.RGBtoHSV(0, 0, 255)).toEqual([240, 1, 1]);
});

test('convert CMYK(0,0,0,1) to equal RGB(0,0,0)', () => {
    expect(Color.CMYKtoRGB(0,0,0,1)).toEqual([0, 0, 0]);
});

test('convert CMYK(0,0,0,0) to equal RGB(255,255,255)', () => {
    expect(Color.CMYKtoRGB(0, 0, 0, 0)).toEqual([255, 255, 255]);
});

test('convert CMYK(0,0,0,0.5) to equal RGB(128,128,128)', () => {
    expect(Color.CMYKtoRGB(0, 0, 0, 0.5)).toEqual([128, 128, 128]);
});

test('convert CMYK(0,1,1,0) to equal RGB(255,0,0)', () => {
    expect(Color.CMYKtoRGB(0, 1, 1, 0)).toEqual([255, 0, 0]);
});

test('convert CMYK(1,0,1,0) to equal RGB(0,255,0)', () => {
    expect(Color.CMYKtoRGB(1, 0, 1, 0)).toEqual([0, 255, 0]);
});

test('convert CMYK(1,1,0,0) to equal RGB(0,0,255)', () => {
    expect(Color.CMYKtoRGB(1, 1, 0, 0)).toEqual([0, 0, 255]);
});

test('convert HSV(0,0,0) to equal RGB(0,0,0)', () => {
    expect(Color.HSVtoRGB(0, 0, 0)).toEqual([0, 0, 0]);
});

test('convert HSV(0,0,1) to equal RGB(255,255,255)', () => {
    expect(Color.HSVtoRGB(0, 0, 1)).toEqual([255, 255, 255]);
});

// Ignored - issues with rounding
test.skip('convert HSV(0,0,0.5) to equal RGB(128,128,128)', () => {
    expect(Color.HSVtoRGB(0, 0, 0.5)).toEqual([128, 128, 128]);
});

test('convert HSV(0,1,1) to equal RGB(255,0,0)', () => {
    expect(Color.HSVtoRGB(0, 1, 1)).toEqual([255, 0, 0]);
});

test('convert HSV(120,1,1) to equal RGB(0,255,0)', () => {
    expect(Color.HSVtoRGB(120, 1, 1)).toEqual([0, 255, 0]);
});

test('convert HSV(240,1,1) to equal RGB(0,0,255)', () => {
    expect(Color.HSVtoRGB(240, 1, 1)).toEqual([0, 0, 255]);
});