import { render } from '@testing-library/react';
import ImageProcessing from '../../public/ImageProcessing';

test('expect 200x400 image scaled with base of 100 to be 100x200', () => {
    expect(ImageProcessing.GetImageScale(200, 400, 100)).toEqual([100, 200]);
});

test('expect 400x200 image scaled with base of 100 to be 200x100', () => {
    expect(ImageProcessing.GetImageScale(400, 200, 100)).toEqual([200, 100]);
});

// CanvasRenderingContext2D unavailable for testing purposes
test.skip('erode source1.png to equal expected1.png', () => {
    const elements = render(
        <div>
            <canvas/>
            <canvas/>
        </div>
    ).baseElement.getElementsByTagName('canvas');

    // Fetch source image
    const sourceImage = new Image();
    sourceImage.src = 'samples/source1.png';

    // Write source image data to source canvas
    const sourceCanvas = elements[0].getContext('2d');
    sourceCanvas.drawImage(sourceImage, 0, 0);

    // Fetch expected image
    const expectedImage = new Image();
    expectedImage.src = 'samples/expected1.png';

    // Write expected image data to expected canvas
    const expectedCanvas = elements[1].getContext('2d');
    expectedCanvas.drawImage(expectedImage, 0, 0);

    // Erode source canvas
    //ImageProcessing.Erosion(sourceCanvas, 1);

    // Compare eroded data to expected data
    expect(sourceCanvas.data).toEqual(expectedCanvas.data);
});