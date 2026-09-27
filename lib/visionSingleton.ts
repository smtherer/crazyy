// lib/visionSingleton.ts
let faceLandmarkerPromise: Promise<any> | null = null;
let cachedFaceLandmarker: any = null;

export async function getFaceLandmarker() {
  if (cachedFaceLandmarker) return cachedFaceLandmarker;

  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = (async () => {
      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
        numFaces: 1,
      });
      cachedFaceLandmarker = landmarker;
      return landmarker;
    })();
  }

  return faceLandmarkerPromise;
}