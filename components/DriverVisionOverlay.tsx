// components/DriverVisionOverlay.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { getFaceLandmarker } from "@/lib/visionSingleton";

interface DriverVisionOverlayProps {
  isArmed?: boolean;
  onGazeLost?: () => void;
  className?: string;
}

export function DriverVisionOverlay({
  isArmed = false,
  onGazeLost,
  className = "",
}: DriverVisionOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const yawTextRef = useRef<HTMLDivElement | null>(null);
  const gazeStatusRef = useRef<HTMLDivElement | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const isArmedRef = useRef(isArmed);
  const onGazeLostRef = useRef(onGazeLost);
  useEffect(() => {
    isArmedRef.current = isArmed;
    onGazeLostRef.current = onGazeLost;
  }, [isArmed, onGazeLost]);

  const lastVideoTimeRef = useRef<number>(-1);
  const lastTimestampRef = useRef<number>(0);
  const gazeDriftFramesRef = useRef<number>(0);
  const animFrameIdRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;
    let activeStream: MediaStream | null = null;
    let faceLandmarker: any = null;

    async function init() {
      try {
        faceLandmarker = await getFaceLandmarker();
        if (!isMounted) return;

        // Force MediaPipe into VIDEO mode if it was initialized as IMAGE
        if (faceLandmarker?.setOptions) {
          try {
            await faceLandmarker.setOptions({ runningMode: "VIDEO" });
          } catch (e) {
            console.warn("Could not set runningMode to VIDEO, falling back to frame detect:", e);
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, frameRate: { ideal: 60 } },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        activeStream = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            if (isMounted && video) {
              video.play().then(() => {
                if (isMounted) startGazeTracking();
              }).catch(() => {});
            }
          };
          setHasPermission(true);
        }
      } catch (err) {
        if (isMounted) setHasPermission(false);
      }
    }

    function startGazeTracking() {
      const loop = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (
          !video ||
          !canvas ||
          video.paused ||
          video.ended ||
          video.readyState < 2 ||
          video.videoWidth === 0 ||
          !faceLandmarker
        ) {
          animFrameIdRef.current = requestAnimationFrame(loop);
          return;
        }

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;

        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -w, 0, w, h);
        ctx.restore();

        let now = Math.round(performance.now());
        if (now <= lastTimestampRef.current) {
          now = lastTimestampRef.current + 1;
        }
        lastTimestampRef.current = now;

        let isLookingAtTarget = true;
        let headYawDegrees = 0;
        let gazeWarningText = "EYES ON RETICLE";

        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;

          try {
            // Pass the rendered canvas rather than the raw off-screen video element
            let results: any = null;
            if (typeof faceLandmarker.detectForVideo === "function") {
              try {
                results = faceLandmarker.detectForVideo(canvas, now);
              } catch (modeErr) {
                results = faceLandmarker.detect(canvas);
              }
            } else {
              results = faceLandmarker.detect(canvas);
            }

            if (results?.faceLandmarks?.length > 0) {
              const landmarks = results.faceLandmarks[0];
              const nose = landmarks[1];
              const leftTragus = landmarks[234];
              const rightTragus = landmarks[454];

              if (nose && leftTragus && rightTragus) {
                const distToLeft = Math.abs(nose.x - leftTragus.x);
                const distToRight = Math.abs(nose.x - rightTragus.x);
                const faceWidth = distToLeft + distToRight;
                const yawRatio = (distToLeft - distToRight) / (faceWidth || 1);
                headYawDegrees = Math.round(yawRatio * 70);
              }

              let irisDrift = false;
              if (landmarks[468] && landmarks[33] && landmarks[133]) {
                const eyeWidth = Math.abs(landmarks[133].x - landmarks[33].x);
                const irisOffset = Math.abs(landmarks[468].x - landmarks[33].x);
                const gazeRatio = irisOffset / (eyeWidth || 1);

                if (gazeRatio < 0.36 || gazeRatio > 0.64) {
                  irisDrift = true;
                  gazeWarningText = "PUPIL SACCADE DETECTED";
                }
              }

              if (Math.abs(headYawDegrees) > 14) {
                isLookingAtTarget = false;
                gazeWarningText = "HEAD ROTATED SIDEWAYS";
              } else if (irisDrift) {
                isLookingAtTarget = false;
              }

              // Overlays
              const nx = (1 - nose.x) * w;
              const ny = nose.y * h;

              ctx.strokeStyle = isLookingAtTarget ? "#10b981" : "#ef4444";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(nx, ny, 7, 0, 2 * Math.PI);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(nx, ny);
              ctx.lineTo(nx - headYawDegrees * 2, ny);
              ctx.stroke();

              if (landmarks[468] && landmarks[473]) {
                const rx = (1 - landmarks[468].x) * w;
                const ry = landmarks[468].y * h;
                const lx = (1 - landmarks[473].x) * w;
                const ly = landmarks[473].y * h;

                ctx.fillStyle = isLookingAtTarget ? "#38bdf8" : "#ef4444";
                ctx.fillRect(rx - 3, ry - 3, 6, 6);
                ctx.fillRect(lx - 3, ly - 3, 6, 6);
              }
            } else {
              isLookingAtTarget = false;
              gazeWarningText = "NO FACE IN FOV";
            }
          } catch (err) {
            // Frame skip guard
          }
        }

        // Top Status Ribbon
        ctx.fillStyle = "rgba(5, 5, 7, 0.85)";
        ctx.fillRect(0, 0, w, 22);

        ctx.fillStyle = isLookingAtTarget ? "#10b981" : "#ef4444";
        ctx.font = "bold 8.5px monospace";
        ctx.fillText(
          `3D GAZE LOCK // ${isLookingAtTarget ? "TARGET LOCKED" : gazeWarningText}`,
          8,
          14
        );

        if (isArmedRef.current && !isLookingAtTarget) {
          gazeDriftFramesRef.current++;
          if (gazeDriftFramesRef.current > 8) {
            if (onGazeLostRef.current) {
              onGazeLostRef.current();
            }
          }
        } else {
          gazeDriftFramesRef.current = 0;
        }

        if (yawTextRef.current) {
          yawTextRef.current.textContent = `${headYawDegrees > 0 ? "+" : ""}${headYawDegrees}°`;
        }
        if (gazeStatusRef.current) {
          gazeStatusRef.current.textContent = isLookingAtTarget ? "LOCKED" : "LOST";
          gazeStatusRef.current.className = `text-xs font-bold mt-0.5 ${
            isLookingAtTarget ? "text-emerald-400" : "text-red-500"
          }`;
        }

        animFrameIdRef.current = requestAnimationFrame(loop);
      };

      animFrameIdRef.current = requestAnimationFrame(loop);
    }

    init();

    return () => {
      isMounted = false;
      if (activeStream) activeStream.getTracks().forEach((t) => t.stop());
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  if (hasPermission === false) {
    return (
      <div className={`p-4 border border-zinc-800 bg-zinc-950/80 font-mono text-xs text-zinc-500 flex items-center gap-2 ${className}`}>
        <AlertCircle className="size-4 text-amber-400" />
        Camera offline or permission denied.
      </div>
    );
  }

  return (
    <div className={`relative border border-zinc-800 bg-zinc-950/90 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="fixed -top-[9999px] -left-[9999px] opacity-0 pointer-events-none"
        playsInline
        muted
        autoPlay
      />

      <canvas ref={canvasRef} width={320} height={220} className="w-full h-auto object-cover block" />

      <div className="p-2 border-t border-zinc-900 bg-zinc-950 font-mono text-xs grid grid-cols-2 gap-2 text-center">
        <div className="p-1 border border-zinc-900 bg-zinc-900/40">
          <div className="text-[8px] text-zinc-500 uppercase">Head Angle</div>
          <div ref={yawTextRef} className="text-xs font-bold text-cyan-400 mt-0.5">
            0°
          </div>
        </div>

        <div className="p-1 border border-zinc-900 bg-zinc-900/40">
          <div className="text-[8px] text-zinc-500 uppercase">Target Gaze</div>
          <div ref={gazeStatusRef} className="text-xs font-bold text-emerald-400 mt-0.5">
            LOCKED
          </div>
        </div>
      </div>
    </div>
  );
}