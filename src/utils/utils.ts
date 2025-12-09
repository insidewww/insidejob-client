import { Cloudinary } from "@cloudinary/url-gen/index";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { format } from "@cloudinary/url-gen/actions/delivery";
import { ImageRefSchema } from "@jakubkanna/labguy-front-schema";

// Global sizes for responsive images
const sizes = {
  SMALL: 400,
  MEDIUM: 800,
  BIG: 1600,
  FULL: 2160,
};

// Cloudinary URL generator with a specific width
function getCldUrl(public_id: string, width: number) {
  const cld = new Cloudinary({
    cloud: {
      cloudName: import.meta.env.VITE_CLD_CLOUD_NAME,
    },
  });

  const myImage = cld.image(public_id);
  // Keep transparency intact by forcing an alpha-safe format.
  myImage.delivery(format("auto"));
  myImage.resize(scale().width(width));
  return myImage.toURL();
}

// Generate srcSet for responsive image loading
function getSrcSet(public_id: string) {
  return Object.values(sizes)
    .map((width) => `${getCldUrl(public_id, width)} ${width}w`)
    .join(", ");
}

// Get Image attributes based on Cloudinary availability
export function getImageAttributes(image: ImageRefSchema) {
  const { cld_url, public_id } = image;

  if (cld_url && public_id) {
    return {
      src: getCldUrl(public_id, sizes.MEDIUM),
      srcSet: getSrcSet(public_id),
      sizes: `(max-width: 600px) ${sizes.SMALL}px, (max-width: 1200px) ${sizes.MEDIUM}px, (max-width: 1600px) ${sizes.BIG}px, ${sizes.FULL}px`,
      alt: image.description || "",
    };
  }

  // Non-Cloudinary image or missing data fallback
  return {
    src: "",
    srcSet: "",
    sizes: "",
    alt: "",
  };
}
