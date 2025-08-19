'use client';

import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import * as faceapi from 'face-api.js';
import avgPoint from '@/utils/avgPoing';
import loadFaceApiModels from '@/utils/loadFaceApiModels';

type Props = {
  onCaptured: (arr: number[]) => void;
  showOverlay?: boolean; // turn off in scan mode
  inputSize?: 160 | 192 | 224 | 256; // speed/accuracy knob
  stableFrames?: number; // frames to hold alignment before capture
};

export type FaceCaptureHandle = {
  stop: () => Promise<void>;
};

const FaceCapture = forwardRef<FaceCaptureHandle, Props>(
  (
    {
      onCaptured,
      showOverlay = true,
      inputSize = 160,
      stableFrames = 5,
    }: Props,
    ref,
  ) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const faceapiRef = useRef<typeof faceapi | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef(0);
    const stableRef = useRef(0);
    const capturingRef = useRef(false);

    const [status, setStatus] = useState('Initializing camera…');
    const [descriptor, setDescriptor] = useState<number[] | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const startedRef = useRef(false);

    // Oval (relative to 640x480) – matches your SVG (cx=320,cy=180, rx=140,ry=200)
    const OVAL = { cxR: 0.5, cyR: 180 / 480, rxR: 140 / 640, ryR: 200 / 480 };
    const TOL_CENTER = 0.35; // smaller = stricter
    const TOL_ROLL_DEG = 10; // max tilt
    const SIZE_MIN = 1.3; // bbox.h ≥ ry * SIZE_MIN
    const SIZE_MAX = 2.6; // bbox.h ≤ ry * SIZE_MAX

    useImperativeHandle(
      ref,
      () => ({
        stop,
      }),
      [],
    );

    useEffect(() => {
      if (startedRef.current) return; // <-- prevents a 2nd getUserMedia
      startedRef.current = true;

      (async () => {
        try {
          faceapiRef.current = faceapi;
          await loadFaceApiModels(async () => {
            if (
              !('mediaDevices' in navigator) ||
              !navigator.mediaDevices?.getUserMedia
            ) {
              setStatus('Camera not available. Open this page over HTTPS.');
              return;
            }

            streamRef.current = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
              audio: false,
            });
            if (videoRef.current) {
              videoRef.current.srcObject = streamRef.current;
              await videoRef.current.play().catch(() => {});
            }
            setStatus('Align your face in the frame, look straight.');
            startLoop();
          });
        } catch (e) {
          console.error(e);
          setStatus('Failed to initialize camera or models.');
        }
      })();

      return () => {
        stop();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stop = async () => {
      // stop loop
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      capturingRef.current = false;
      stableRef.current = 0;

      const v = videoRef.current;
      const s = streamRef.current;

      if (s) {
        const tracks = s.getTracks();
        const waitEnded = tracks.map((t) =>
          t.readyState === 'ended'
            ? Promise.resolve()
            : new Promise<void>((res) =>
                t.addEventListener('ended', () => res(), { once: true }),
              ),
        );
        tracks.forEach((t) => t.stop()); // stop source
        await Promise.race([
          Promise.all(waitEnded),
          new Promise((res) => setTimeout(res, 150)),
        ]);
        streamRef.current = null;
      }

      if (v) {
        try {
          v.pause();
        } catch {}
        v.srcObject = null; // detach stream
        // helps some engines finalize detachment
        if (typeof v.load === 'function') v.load();
      }
    };

    const startLoop = () => {
      const faceapi = faceapiRef.current!;
      const opts = new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold: 0.5,
      });
      const targetFPS = 14;
      const minDelta = 1000 / targetFPS;

      const tick = async (ts: number) => {
        rafRef.current = requestAnimationFrame(tick);
        if (!videoRef.current || capturingRef.current) return;

        // throttle
        if (ts - lastTsRef.current < minDelta) return;
        lastTsRef.current = ts;

        const v = videoRef.current;
        // FAST PATH: detect only (no descriptor yet)
        const detOnly = await faceapi
          .detectSingleFace(v, opts)
          .withFaceLandmarks();
        if (!detOnly) {
          stableRef.current = 0;
          setStatus('No face detected. Center your face.');
          return;
        }

        // Alignment checks
        const { box } = detOnly.detection;
        const vw = v.videoWidth || 640,
          vh = v.videoHeight || 480;
        const cx = OVAL.cxR * vw,
          cy = OVAL.cyR * vh;
        const rx = OVAL.rxR * vw,
          ry = OVAL.ryR * vh;

        // mirror X because video is flipped
        const detCx = vw - (box.x + box.width / 2);
        const detCy = box.y + box.height / 2;

        const dx = (detCx - cx) / rx;
        const dy = (detCy - cy) / ry;
        const centered = Math.hypot(dx, dy) <= TOL_CENTER;

        const lm = detOnly.landmarks;
        const L = avgPoint(lm.getLeftEye());
        const R = avgPoint(lm.getRightEye());
        const Lm = { x: vw - L.x, y: L.y },
          Rm = { x: vw - R.x, y: R.y };
        const rollDeg = Math.abs(
          (Math.atan2(Lm.y - Rm.y, Lm.x - Rm.x) * 180) / Math.PI,
        );
        const rollOk = rollDeg <= TOL_ROLL_DEG;

        const sizeOk =
          box.height >= ry * SIZE_MIN && box.height <= ry * SIZE_MAX;

        const ok = centered && rollOk && sizeOk;
        setStatus(ok ? 'Hold still…' : 'Align your face with the guides.');

        if (!ok) {
          stableRef.current = 0;
          return;
        }

        // Stable long enough? → compute descriptor once
        if (++stableRef.current >= (stableFrames ?? 10)) {
          capturingRef.current = true;
          setStatus('Capturing…');
          const desc = await captureDescriptorOnce(v, opts, faceapi);
          if (!desc) {
            setStatus('Lost face, retrying…');
            capturingRef.current = false;
            stableRef.current = 0;
            return;
          }
          setDescriptor(desc);
          onCaptured(desc);
          setStatus('Face captured!');
          // keep running if you want continuous scanning; otherwise stop loop:
          cancelAnimationFrame(rafRef.current!);
          return;
          // capturingRef.current = false;
          // stableRef.current = 0; // allow another capture if needed
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    // Heavy step done ONCE when stable
    const captureDescriptorOnce = async (
      v: HTMLVideoElement,
      opts: faceapi.TinyFaceDetectorOptions,
      faceapiLib: typeof faceapi,
    ): Promise<number[] | null> => {
      // small averaging for stability (3 frames)
      const frames: number[][] = [];
      for (let i = 0; i < 3; i++) {
        const det = await faceapiLib
          .detectSingleFace(v, opts)
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (!det) return null;
        frames.push(Array.from(det.descriptor));
        await new Promise((r) => setTimeout(r, 80));
      }
      const avg = frames[0].map(
        (_, j) => frames.reduce((s, v) => s + v[j], 0) / frames.length,
      );
      const norm = Math.hypot(...avg);
      return avg.map((v) => v / (norm || 1));
    };

    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <div className="relative">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-[340px] w-[320px] rounded-md bg-black object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {showOverlay && (
            <div className="pointer-events-none absolute inset-0">
              <svg viewBox="0 0 640 480" className="h-full w-full">
                <ellipse
                  cx="320"
                  cy="180"
                  rx="180"
                  ry="220"
                  fill="none"
                  stroke="red"
                  strokeWidth="6"
                  strokeDasharray="8 8"
                />
              </svg>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">{status}</p>
        {descriptor && (
          <p className="text-md font-semibold text-emerald-400">
            Face map ready ({descriptor.length} dims).
          </p>
        )}
      </div>
    );
  },
);

FaceCapture.displayName = 'FaceCapture';

export default FaceCapture;
