import { useEffect, useState } from "react";
import { ImageRefSchema } from "@jakubkanna/labguy-front-schema";
import { getImageAttributes } from "../utils/utils";
import { Fade } from "react-bootstrap";

interface ImageProps {
  imageref: ImageRefSchema;
  className?: string;
  fallbackUrl?: string; // Optional custom fallback image URL
}

export default function Image({ imageref, className }: ImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>("");
  const [loading, setLoading] = useState(true);
  const [isImageValid, setIsImageValid] = useState<boolean>(true);
  const { height, width } = imageref;

  const { src, srcSet, sizes, alt } = imageref
    ? getImageAttributes(imageref)
    : { src: "", srcSet: "", sizes: "", alt: "" };

  useEffect(() => {
    if (src) {
      // Validate the image URL
      fetch(src)
        .then((response) => {
          if (response.ok) {
            // If the response is OK, set the image source
            setImgSrc(src);
            setIsImageValid(true);
          } else {
            setIsImageValid(false);
          }
        })
        .catch(() => {
          setIsImageValid(false);
        });
    }
  }, [src]);

  if (!isImageValid) {
    return;
  }

  return (
    <>
      {loading && (
        <img height={height} width={width} className="img-fluid"></img>
      )}
      <Fade in={!loading} appear={true} timeout={500}>
        <img
          src={imgSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt || ""}
          style={!loading ? {} : { display: `none` }}
          onLoad={() => setLoading(false)}
          className={className || "img-fluid"}
        />
      </Fade>
    </>
  );
}
