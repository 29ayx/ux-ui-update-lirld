import { Show } from "solid-js";
import PhotoManager from "~/components/PhotoManager";

interface PhotoSectionProps {
  photos: string[];
  userId: string;
  onPhotosChange: (photos: string[]) => void;
  hasError?: boolean;
}

export default function PhotoSection(props: PhotoSectionProps) {
  return (
    <>
      <p class="text-sm text-black dark:text-white mb-4">
        Add up to 6 photos. First photo will be your profile picture.
        <Show when={props.hasError}>
          <span class="block mt-2 text-red-400 font-medium">At least 1 photo is required</span>
        </Show>
      </p>
      <PhotoManager
        photos={props.photos}
        userId={props.userId}
        onPhotosChange={props.onPhotosChange}
        maxPhotos={6}
      />
    </>
  );
}
