import { Show, For, createSignal, onCleanup } from "solid-js";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "~/lib/firebase";
import { compressAndUpload, revokePreviewUrl, type UploadProgress } from "~/lib/profile/photoUpload";

interface PhotoManagerProps {
  photos: string[];
  userId: string;
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

interface UploadState {
  index: number;
  previewUrl: string;
  progress: number;
  stage: UploadProgress['stage'];
}

export default function PhotoManager(props: PhotoManagerProps) {
  const [uploadState, setUploadState] = createSignal<UploadState | null>(null);
  const maxPhotos = props.maxPhotos || 6;

  onCleanup(() => {
    const state = uploadState();
    if (state?.previewUrl) {
      revokePreviewUrl(state.previewUrl);
    }
  });

  const handleFileSelect = async (event: Event, index: number) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setUploadState({
      index,
      previewUrl,
      progress: 0,
      stage: 'compressing'
    });

    try {
      const result = await compressAndUpload(
        file,
        props.userId,
        (progress: UploadProgress) => {
          setUploadState({
            index,
            previewUrl,
            progress: progress.progress,
            stage: progress.stage
          });
        }
      );

      const newPhotos = [...props.photos];
      newPhotos[index] = result.downloadURL;
      props.onPhotosChange(newPhotos);

      revokePreviewUrl(previewUrl);
      setUploadState(null);
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      revokePreviewUrl(previewUrl);
      setUploadState(null);
    } finally {
      input.value = "";
    }
  };

  const handleRemovePhoto = async (index: number) => {
    try {
      const photoUrl = props.photos[index];

      // Handle Firebase Storage deletion (legacy)
      if (photoUrl && photoUrl.includes("firebase")) {
        try {
          const photoRef = ref(storage, photoUrl);
          await deleteObject(photoRef);
        } catch (error) {
          console.error("Error deleting from storage:", error);
        }
      }

      // Handle Cloudinary deletion
      if (photoUrl && photoUrl.includes("cloudinary")) {
        try {
          // Extract public ID from URL
          // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/users/photo.jpg
          const parts = photoUrl.split('/');
          const filename = parts[parts.length - 1];
          const publicId = `users/${filename.split('.')[0]}`;

          // Import dynamically to avoid server-side code in client bundle issues if not handled by framework
          const { deleteFromCloudinary } = await import("~/server/cloudinary");
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error("Error deleting from Cloudinary:", error);
        }
      }

      // Remove from array
      const newPhotos = props.photos.filter((_, i) => i !== index);
      props.onPhotosChange(newPhotos);
    } catch (error) {
      console.error("Error removing photo:", error);
    }
  };

  return (
    <div class="grid grid-cols-2 gap-3">
      <For each={Array(maxPhotos).fill(null)}>
        {(_, i) => {
          const index = i();

          return (
            <div class="aspect-square relative rounded-2xl overflow-hidden bg-white/5 border border-white/5 shadow-inner">
              <Show when={props.photos[index] || (uploadState()?.index === index && uploadState()?.previewUrl)} fallback={
                <label class="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                  <svg class="w-8 h-8 text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span class="text-xs text-white/40 font-medium">Add Photo</span>
                  <input type="file" accept="image/*" class="hidden" onChange={(e) => handleFileSelect(e, index)} />
                </label>
              }>
                <img
                  src={(uploadState()?.index === index && uploadState()?.previewUrl) ? uploadState()!.previewUrl : props.photos[index]}
                  alt="Photo"
                  class="w-full h-full object-cover"
                />

                <Show when={uploadState()?.index === index}>
                  <div class="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div class="flex flex-col items-center gap-2">
                      <div class="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span class="text-xs text-white">{uploadState()!.stage === 'compressing' ? 'Compressing...' : 'Uploading...'}</span>
                      <span class="text-xs text-white/60">{Math.round(uploadState()!.progress)}%</span>
                    </div>
                  </div>
                </Show>

                <Show when={uploadState()?.index !== index}>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <div class="absolute bottom-2 right-2 flex gap-2">
                      <label
                        class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-500 active:scale-95 transition-all shadow-lg border border-white/20"
                        title="Replace photo"
                      >
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <input type="file" accept="image/*" class="hidden" onChange={(e) => handleFileSelect(e, index)} />
                      </label>
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        class="w-9 h-9 rounded-full bg-[#FF375F] flex items-center justify-center hover:bg-[#FF375F]/80 active:scale-95 transition-all shadow-lg border border-white/20"
                        title="Delete photo"
                      >
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Show>
              </Show>
            </div>
          );
        }}
      </For>
    </div>
  );
}
