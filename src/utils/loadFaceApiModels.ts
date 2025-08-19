import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl'; // GPU
// Optional fallback:
// import '@tensorflow/tfjs-backend-wasm';

const loadFaceApiModels = async (cb?: () => Promise<void>) => {
  // Pick the fastest available backend
  try {
    await tf.setBackend('webgl');
  } catch {}
  await tf.ready();

  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(
      `${MODEL_URL}/tiny_face_detector`,
    ),
    faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`),
    faceapi.nets.faceRecognitionNet.loadFromUri(
      `${MODEL_URL}/face_recognition`,
    ),
  ]);

  if (cb) await cb();
};

export default loadFaceApiModels;
