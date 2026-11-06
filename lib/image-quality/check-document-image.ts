import type { DocumentType } from "@/types/driver";
import { detectFaces } from "./face";
import {
  borderStats,
  laplacianVariance,
  loadBitmap,
  luminanceStats,
  toGrey,
} from "./pixels";

export const PORTRAIT_DOCUMENTS: DocumentType[] = [
  "PASSPORT_PHOTO",
  "GUARANTOR_PASSPORT",
];

export const IMAGE_QUALITY = {
  analysisSide: 800,
  minShortSide: { document: 600, portrait: 300 },
  minMeanLuminance: 55,
  maxMeanLuminance: 225,
  maxGlareShare: 0.12,
  minSharpness: { document: 35, portrait: 25 },
  maxRollDegrees: 22,
  minFaceHeightShare: 0.18,
  maxFaceHeightShare: 0.9,
  maxCentreOffset: 0.22,
  minFaceLuminance: 70,
  maxBackgroundDeviation: 42,
};

export type ImageCheckResult = { ok: true } | { ok: false; reason: string };

const fail = (reason: string): ImageCheckResult => ({ ok: false, reason });

// The detector does not promise which eye comes first, so the angle is folded into -90..90.
export const eyeLineRoll = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  size: { width: number; height: number },
) => {
  const degrees =
    (Math.atan2((b.y - a.y) * size.height, (b.x - a.x) * size.width) * 180) /
    Math.PI;

  return degrees > 90 ? degrees - 180 : degrees < -90 ? degrees + 180 : degrees;
};

const checkPortrait = async (
  bitmap: ImageBitmap,
  grey: ReturnType<typeof toGrey>,
): Promise<ImageCheckResult> => {
  const faces = await detectFaces(bitmap);

  if (!faces.length)
    return fail(
      "We can't find a face. Hold the phone upright and face the camera, head and shoulders in the frame.",
    );
  if (faces.length > 1) return fail("Only one person can be in the photo.");

  const [face] = faces;
  const box = face.boundingBox;
  const [rightEye, leftEye] = face.keypoints;
  if (!box) return fail("We can't find a face. Try again facing the camera.");

  if (rightEye && leftEye) {
    if (
      Math.abs(eyeLineRoll(rightEye, leftEye, bitmap)) >
      IMAGE_QUALITY.maxRollDegrees
    )
      return fail(
        "Your head is tilted. Sit or stand upright and keep your head straight - no lying down.",
      );
  }

  const heightShare = box.height / bitmap.height;
  if (heightShare < IMAGE_QUALITY.minFaceHeightShare)
    return fail("Move closer - your face should fill most of the photo.");
  if (heightShare > IMAGE_QUALITY.maxFaceHeightShare)
    return fail("Too close - step back so your whole head and shoulders show.");

  const centre = (box.originX + box.width / 2) / bitmap.width;
  if (Math.abs(centre - 0.5) > IMAGE_QUALITY.maxCentreOffset)
    return fail("Put your face in the middle of the photo.");

  const scale = grey.width / bitmap.width;
  const faceRegion = {
    x: box.originX * scale,
    y: box.originY * scale,
    width: box.width * scale,
    height: box.height * scale,
  };

  if (luminanceStats(grey, faceRegion).mean < IMAGE_QUALITY.minFaceLuminance)
    return fail(
      "Your face is too dark. Face a window or a bright light and try again.",
    );

  if (laplacianVariance(grey, faceRegion) < IMAGE_QUALITY.minSharpness.portrait)
    return fail("Your face is blurry. Hold the phone still and tap to focus.");

  const background = borderStats(grey, {
    x: faceRegion.x - faceRegion.width * 0.6,
    y: 0,
    width: faceRegion.width * 2.2,
    height: grey.height,
  });

  if (background !== null && background > IMAGE_QUALITY.maxBackgroundDeviation)
    return fail(
      "Use a plain background - stand in front of a light, empty wall. No pillows, beds or patterns behind you.",
    );

  return { ok: true };
};

export const checkDocumentImage = async (
  type: DocumentType,
  file: File,
): Promise<ImageCheckResult> => {
  if (!file.type.startsWith("image/")) return { ok: true };

  const portrait = PORTRAIT_DOCUMENTS.includes(type);
  const bitmap = await loadBitmap(file);

  try {
    const shortSide = Math.min(bitmap.width, bitmap.height);
    if (
      shortSide < IMAGE_QUALITY.minShortSide[portrait ? "portrait" : "document"]
    )
      return fail(
        "This photo is too small. Take a new photo with your camera instead of a screenshot.",
      );

    const grey = toGrey(bitmap, IMAGE_QUALITY.analysisSide);
    const { mean, clippedShare } = luminanceStats(grey);

    if (mean < IMAGE_QUALITY.minMeanLuminance)
      return fail("The photo is too dark. Move to better light and try again.");
    if (mean > IMAGE_QUALITY.maxMeanLuminance)
      return fail(
        "The photo is washed out. Move out of direct light and try again.",
      );

    if (!portrait && clippedShare > IMAGE_QUALITY.maxGlareShare)
      return fail(
        "There's glare on the document. Tilt it away from the light so every detail is readable.",
      );

    if (
      !portrait &&
      laplacianVariance(grey) < IMAGE_QUALITY.minSharpness.document
    )
      return fail(
        "The photo is blurry. Lay the document flat, hold the phone still and tap to focus.",
      );

    if (portrait) return await checkPortrait(bitmap, grey);

    return { ok: true };
  } finally {
    bitmap.close();
  }
};
