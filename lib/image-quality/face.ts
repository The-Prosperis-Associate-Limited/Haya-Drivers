import type { Detection, FaceDetector } from "@mediapipe/tasks-vision";

let detector: Promise<FaceDetector> | null = null;

const createDetector = async () => {
  const { FaceDetector, FilesetResolver } =
    await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");

  return FaceDetector.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: "/mediapipe/blaze_face_short_range.tflite",
      delegate: "CPU",
    },
    runningMode: "IMAGE",
    minDetectionConfidence: 0.75,
  });
};

export const getFaceDetector = () => {
  detector ??= createDetector().catch((error) => {
    detector = null;
    throw error;
  });

  return detector;
};

export const detectFaces = async (bitmap: ImageBitmap): Promise<Detection[]> =>
  (await getFaceDetector()).detect(bitmap).detections;
