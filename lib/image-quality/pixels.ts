export interface GreyImage {
  width: number;
  height: number;
  data: Float32Array;
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const loadBitmap = (file: File) =>
  createImageBitmap(file, { imageOrientation: "from-image" });

export const toGrey = (bitmap: ImageBitmap, maxSide: number): GreyImage => {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is not available");

  context.drawImage(bitmap, 0, 0, width, height);
  const { data: rgba } = context.getImageData(0, 0, width, height);

  const data = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 1) {
    data[i] =
      0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
  }

  return { width, height, data };
};

const clampRegion = (image: GreyImage, region?: Region): Region => {
  if (!region) return { x: 0, y: 0, width: image.width, height: image.height };

  const x = Math.max(0, Math.floor(region.x));
  const y = Math.max(0, Math.floor(region.y));

  return {
    x,
    y,
    width: Math.max(1, Math.min(image.width - x, Math.ceil(region.width))),
    height: Math.max(1, Math.min(image.height - y, Math.ceil(region.height))),
  };
};

export const luminanceStats = (image: GreyImage, region?: Region) => {
  const { x, y, width, height } = clampRegion(image, region);
  let sum = 0;
  let sumSquares = 0;
  let clipped = 0;

  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      const value = image.data[row * image.width + column];
      sum += value;
      sumSquares += value * value;
      if (value >= 250) clipped += 1;
    }
  }

  const count = width * height;
  const mean = sum / count;

  return {
    mean,
    deviation: Math.sqrt(Math.max(0, sumSquares / count - mean * mean)),
    clippedShare: clipped / count,
  };
};

export const laplacianVariance = (image: GreyImage, region?: Region) => {
  const { x, y, width, height } = clampRegion(image, region);
  if (width < 3 || height < 3) return 0;

  let sum = 0;
  let sumSquares = 0;
  let count = 0;

  for (let row = y + 1; row < y + height - 1; row += 1) {
    for (let column = x + 1; column < x + width - 1; column += 1) {
      const i = row * image.width + column;
      const value =
        image.data[i - image.width] +
        image.data[i + image.width] +
        image.data[i - 1] +
        image.data[i + 1] -
        4 * image.data[i];
      sum += value;
      sumSquares += value * value;
      count += 1;
    }
  }

  const mean = sum / count;
  return sumSquares / count - mean * mean;
};

export const borderStats = (image: GreyImage, exclude: Region) => {
  const band = Math.max(
    4,
    Math.round(Math.min(image.width, image.height) * 0.12),
  );
  const strips: Region[] = [
    { x: 0, y: 0, width: image.width, height: band },
    { x: 0, y: 0, width: band, height: image.height },
    { x: image.width - band, y: 0, width: band, height: image.height },
  ].filter(
    (strip) =>
      strip.x + strip.width <= exclude.x ||
      strip.x >= exclude.x + exclude.width ||
      strip.y + strip.height <= exclude.y ||
      strip.y >= exclude.y + exclude.height,
  );

  if (!strips.length) return null;

  const deviations = strips.map(
    (strip) => luminanceStats(image, strip).deviation,
  );
  return Math.max(...deviations);
};
