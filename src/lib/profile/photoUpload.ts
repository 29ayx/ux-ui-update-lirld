import imageCompression from 'browser-image-compression';
import { getCloudinarySignature } from '~/server/cloudinary';

export interface UploadProgress {
  progress: number;
  stage: 'compressing' | 'uploading' | 'complete' | 'error';
}

export interface UploadResult {
  downloadURL: string;
}

export interface UploadError {
  message: string;
  code: string;
}

/**
 * Compress and upload an image to Cloudinary with progress tracking
 * @param file - The image file to upload
 * @param userId - The user ID (used for folder organization in Cloudinary if needed, though we use a generic 'users' folder in the signature)
 * @param onProgress - Optional callback for progress updates
 * @returns Promise with download URL
 */
export async function compressAndUpload(
  file: File,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Notify compression started
    onProgress?.({ progress: 0, stage: 'compressing' });

    // Compression options targeting 90KB
    const options = {
      maxSizeMB: 0.09, // 90KB target
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
      initialQuality: 0.8,
      onProgress: (progress: number) => {
        onProgress?.({ progress: progress * 0.5, stage: 'compressing' });
      }
    };

    // Compress the image
    const compressedFile = await imageCompression(file, options);

    // Notify upload started
    onProgress?.({ progress: 50, stage: 'uploading' });

    // Get signature from server
    const { signature, timestamp, cloudName, apiKey } = await getCloudinarySignature();

    if (!cloudName || !apiKey) {
      throw new Error('Cloudinary configuration missing');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', 'users');

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const uploadProgress = (e.loaded / e.total) * 50;
          onProgress?.({
            progress: 50 + uploadProgress,
            stage: 'uploading'
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onProgress?.({ progress: 100, stage: 'complete' });
          resolve({ downloadURL: response.secure_url });
        } else {
          const error = JSON.parse(xhr.responseText);
          const uploadError: UploadError = {
            message: error.error?.message || 'Upload failed',
            code: 'upload-error'
          };
          onProgress?.({ progress: 0, stage: 'error' });
          reject(uploadError);
        }
      };

      xhr.onerror = () => {
        const uploadError: UploadError = {
          message: 'Network error during upload',
          code: 'network-error'
        };
        onProgress?.({ progress: 0, stage: 'error' });
        reject(uploadError);
      };

      xhr.send(formData);
    });

  } catch (error) {
    // Handle errors
    const uploadError: UploadError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'error'
    };
    onProgress?.({ progress: 0, stage: 'error' });
    throw uploadError;
  }
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch (error) {
    console.warn('Failed to revoke preview URL:', error);
  }
}
