type DestinationImageInput = {
  _id?: string;
  name?: string;
  city?: string;
  country?: string;
  imageUrl?: string;
  destinationName?: string;
  destinationCity?: string;
  destinationCountry?: string;
  destinationImageUrl?: string;
};

const fallbackDestinationImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80",
];

function hashText(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getDestinationImageUrl(destination: DestinationImageInput) {
  const providedImage = destination.imageUrl || destination.destinationImageUrl;

  if (providedImage) {
    return providedImage;
  }

  const key = [
    destination._id,
    destination.name || destination.destinationName,
    destination.city || destination.destinationCity,
    destination.country || destination.destinationCountry,
  ]
    .filter(Boolean)
    .join("-");

  const fallbackIndex = hashText(key) % fallbackDestinationImages.length;

  return fallbackDestinationImages[fallbackIndex];
}
