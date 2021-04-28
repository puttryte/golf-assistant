import Utility from '../../public/Utility';

test('expect 128 clamped in range [0,255] to equal 128', () => {
    expect(Utility.Clamp(128, 0, 255)).toEqual(128);
});

test('expect 0 clamped in range [0,255] to equal 0', () => {
    expect(Utility.Clamp(0, 0, 255)).toEqual(0);
});

test('expect 255 clamped in range [0,255] to equal 255', () => {
    expect(Utility.Clamp(255, 0, 255)).toEqual(255);
});

test('expect -1 clamped in range [0,255] to equal 0', () => {
    expect(Utility.Clamp(-1, 0, 255)).toEqual(0);
});

test('expect 256 clamped in range [0,255] to equal 255', () => {
    expect(Utility.Clamp(256, 0, 255)).toEqual(255);
});

test('expect 128 clamped in range [255,0] to throw error', () => {
    expect(() => Utility.Clamp(128, 255, 0)).toThrowError();
});

test('expect distance from (0) to (1) to equal 1', () => {
    expect(Utility.EuclideanDistance(1, [0], [1])).toEqual(1);
});

test('expect distance from (1) to (0) to equal 1', () => {
    expect(Utility.EuclideanDistance(1, [1], [0])).toEqual(1);
});

test('expect distance from (0,0) to (0,1) to equal 1', () => {
    expect(Utility.EuclideanDistance(2, [0, 0], [0, 1])).toEqual(1);
});

test('expect distance from (0,1) to (0,0) to equal 1', () => {
    expect(Utility.EuclideanDistance(2, [0, 1], [0, 0])).toEqual(1);
});

test('expect distance from (0,0) to (1,1) to equal sqrt(2)', () => {
    expect(Utility.EuclideanDistance(2, [0, 0], [1, 1])).toBeCloseTo(Math.sqrt(2));
});

test('expect distance from (0,0,0) to (0,0,1) to equal 1', () => {
    expect(Utility.EuclideanDistance(3, [0, 0, 0], [0, 0, 1])).toEqual(1);
});

test('expect distance from (0,0,1) to (0,0,0) to equal 1', () => {
    expect(Utility.EuclideanDistance(3, [0, 0, 1], [0, 0, 0])).toEqual(1);
});

test('expect distance from (0,0,0) to (1,1,1) to equal sqrt(3)', () => {
    expect(Utility.EuclideanDistance(3, [0, 0, 0], [1, 1, 1])).toBeCloseTo(Math.sqrt(3));
});