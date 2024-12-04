import { isImage, isVideo, MediaRef } from "../utils/helpers";
import Image from "./Image";
import Video from "./Video";

interface MediaProps {
  media: MediaRef[];
  className?: string;
}

export default function MediaComponent({ media, className }: MediaProps) {
  // Early return if no media is provided
  if (!media || media.length === 0) {
    return <p></p>;
  }

  return (
    <>
      {media.map((item, index) => {
        if (isImage(item)) {
          return <Image key={index} imageref={item} className={className} />;
        } else if (isVideo(item)) {
          return <Video key={index} videoref={item} />;
        } else {
          return <p key={index}>Unsupported media type.</p>;
        }
      })}
    </>
  );
}
