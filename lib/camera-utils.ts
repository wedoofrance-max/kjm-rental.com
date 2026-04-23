/**
 * Camera utility functions for damage inspection photo capture
 */

export async function requestCameraAccess(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });
    return stream;
  } catch (err) {
    console.error('Camera access denied:', err);
    throw new Error(
      'Unable to access camera. Please grant camera permission to continue.'
    );
  }
}

export function stopCamera(stream: MediaStream) {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

export async function capturePhoto(
  videoElement: HTMLVideoElement
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to get canvas context');
  }

  context.drawImage(videoElement, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture photo'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

export async function uploadPhoto(
  file: Blob,
  damageLogId: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file, `damage-${Date.now()}.jpg`);
    formData.append('damageLogId', damageLogId);

    const res = await fetch('/api/admin/damage-logs/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error('Photo upload error:', err);
    throw err;
  }
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isCameraAvailable(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
    isMobileDevice()
  );
}
