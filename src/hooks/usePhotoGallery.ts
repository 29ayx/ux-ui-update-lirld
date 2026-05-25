import { createSignal, createMemo } from "solid-js";

export function usePhotoGallery(profileData: () => any) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = createSignal(0);

  const photos = createMemo(() => {
    const data = profileData();
    if (!data) return [];
    
    if (Array.isArray(data.photos)) return data.photos;
    
    if (data.photo1_url || data.photo2_url || data.photo3_url) {
      const photosList: string[] = [];
      if (data.photo1_url) photosList.push(data.photo1_url);
      if (data.photo2_url) photosList.push(data.photo2_url);
      if (data.photo3_url) photosList.push(data.photo3_url);
      return photosList;
    }
    
    return [];
  });

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos().length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos().length) % photos().length);
  };

  return {
    photos,
    currentPhotoIndex,
    nextPhoto,
    prevPhoto
  };
}
