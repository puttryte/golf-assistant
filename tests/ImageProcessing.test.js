import { expect, test } from '@jest/globals';
import ImageProcessing from '../ImageSegmentation V2/ImageProcessing'

test('expect 200x400 image scaled with base of 100 to be 100x200', () => {
    expect(ImageProcessing.GetImageScale(200, 400, 100)).toEqual([100, 200]);
});

test('expect 400x200 image scaled with base of 100 to be 200x100', () => {
    expect(ImageProcessing.GetImageScale(400, 200, 100)).toEqual([200, 100]);
});

/*
test('', () => {
    // Fetch source image
    const sourceImage = new Image();
    sourceImage.src = 'samples/source1.png';

    // Write source image data to source canvas
    const sourceCanvas = MOCK CANVAS RENDERING CONTEXT 2D;
    sourceCanvas.drawImage(sourceImage, 0, 0);

    // Fetch expected image
    const expectedImage = new Image();
    expectedImage.src = 'samples/expected1.png';

    // Write expected image data to expected canvas
    const expectedCanvas = MOCK CANVAS RENDERING CONTEXT 2D;
    expectedCanvas.drawImage(expectedImage, 0, 0);

    // Erode source canvas
    //ImageProcessing.Erosion(sourceCanvas, 1);

    // Compare eroded data to expected data
    expect(sourceCanvas.data).toEqual(expectedCanvas.data);
});
*/