'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import {
  requestCameraAccess,
  stopCamera,
  capturePhoto,
  uploadPhoto,
  isCameraAvailable,
} from '../../lib/camera-utils';

const MAX_PHOTOS_PER_SESSION = 4;

export default function CameraCapture({
  damageLogId,
  onPhotoCapture,
  isDark,
  onSessionComplete,
}: {
  damageLogId: string;
  onPhotoCapture: (photoUrl: string) => void;
  isDark: boolean;
  onSessionComplete?: () => void;
}) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [cameraAvailable, setCameraAvailable] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setCameraAvailable(isCameraAvailable());
  }, []);

  const openCamera = async () => {
    try {
      setError(null);
      const stream = await requestCameraAccess();
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
      setCapturedPhotos([]);
    } catch (err: any) {
      setError(err.message || 'Failed to access camera');
    }
  };

  const closeCamera = async () => {
    if (streamRef.current) {
      stopCamera(streamRef.current);
    }
    setIsCameraOpen(false);

    // Trigger cleanup and callback when closing camera
    if (capturedPhotos.length > 0) {
      try {
        // Call cleanup API to remove old photos
        const cleanupRes = await fetch('/api/admin/damage-logs/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!cleanupRes.ok) {
          console.warn('Cleanup request failed:', await cleanupRes.text());
        }

        // Call the session complete callback
        if (onSessionComplete) {
          onSessionComplete();
        }
      } catch (err) {
        console.error('Cleanup error:', err);
        // Still call callback even if cleanup fails
        if (onSessionComplete) {
          onSessionComplete();
        }
      }
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    // Check if we've reached the max photos limit
    if (capturedPhotos.length >= MAX_PHOTOS_PER_SESSION) {
      setError(`Maximum ${MAX_PHOTOS_PER_SESSION} photos per session reached`);
      return;
    }

    try {
      setIsCapturing(true);
      setError(null);
      const photoBlob = await capturePhoto(videoRef.current);

      // Create preview URL
      const previewUrl = URL.createObjectURL(photoBlob);
      setCapturedPhotos((prev) => [...prev, previewUrl]);

      // Upload photo
      setUploading(true);
      const uploadedUrl = await uploadPhoto(photoBlob, damageLogId);
      setCapturedPhotos((prev) => [
        ...prev.slice(0, -1),
        uploadedUrl,
      ]);
      onPhotoCapture(uploadedUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to capture or upload photo');
    } finally {
      setIsCapturing(false);
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  if (!cameraAvailable) {
    return (
      <div
        className={`rounded-lg p-4 ${
          isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'
        }`}
      >
        <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
          📸 Camera not available on this device
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Camera Preview */}
      {isCameraOpen && (
        <div className={`rounded-lg overflow-hidden border-2 border-primary-500`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full bg-black"
            style={{ aspectRatio: '4/3' }}
          />
        </div>
      )}

      {/* Canvas for capture (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Photo slots counter */}
      {isCameraOpen && (
        <div className={`px-4 py-3 rounded-lg flex items-center justify-between ${
          isDark ? 'bg-neutral-800' : 'bg-neutral-100'
        }`}>
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Photo Slots
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: MAX_PHOTOS_PER_SESSION }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                  i < capturedPhotos.length
                    ? isDark
                      ? 'bg-green-600 text-white'
                      : 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-neutral-700 text-neutral-500'
                    : 'bg-neutral-300 text-neutral-600'
                }`}
              >
                {i < capturedPhotos.length ? (
                  /* @ts-ignore */
                  <Icon icon="ph:check-bold" width={14} height={14} />
                ) : (
                  i + 1
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isCameraOpen ? (
          <button
            onClick={openCamera}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-primary-600 hover:bg-primary-500 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {/* @ts-ignore */}
            <Icon icon="ph:camera-bold" width={14} height={14} />
            Open Camera
          </button>
        ) : (
          <>
            <button
              onClick={handleCapture}
              disabled={isCapturing || uploading || capturedPhotos.length >= MAX_PHOTOS_PER_SESSION}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                capturedPhotos.length >= MAX_PHOTOS_PER_SESSION
                  ? isDark
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                  : isDark
                  ? 'bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white'
                  : 'bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white'
              }`}
            >
              {/* @ts-ignore */}
              <Icon icon="ph:circle-fill" width={14} height={14} />
              {uploading ? 'Uploading...' : isCapturing ? 'Capturing...' : capturedPhotos.length >= MAX_PHOTOS_PER_SESSION ? 'Limit Reached' : 'Capture'}
            </button>
            <button
              onClick={closeCamera}
              disabled={uploading}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                isDark
                  ? 'bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 text-white'
                  : 'bg-neutral-300 hover:bg-neutral-400 disabled:opacity-40 text-neutral-900'
              }`}
            >
              Done
            </button>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Captured photos gallery */}
      {capturedPhotos.length > 0 && (
        <div className="space-y-2">
          <p className={`text-xs font-semibold ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Captured Photos ({capturedPhotos.length})
          </p>
          <div className="flex gap-2 flex-wrap">
            {capturedPhotos.map((photoUrl, idx) => (
              <div key={idx} className="relative w-16 h-16">
                <img
                  src={photoUrl}
                  alt={`Damage photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-neutral-600"
                />
                <button
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                  title="Delete photo"
                >
                  {/* @ts-ignore */}
                  <Icon icon="ph:x-bold" width={12} height={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
