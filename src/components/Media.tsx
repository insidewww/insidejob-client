import { Link } from "react-router-dom";
import { isImage, isVideo, MediaRef } from "../utils/helpers";
import Image from "./Image";
import Video from "./Video";

interface MediaProps {
  media: MediaRef[];
  className?: string;
  linkImg?: boolean;
}

export default function MediaComponent({
  media,
  className,
  linkImg,
}: MediaProps) {
  // Early return if no media is provided
  if (!media || media.length === 0) {
    return <p></p>;
  }

  return (
    <>
      {media.map((item, index) => {
        if (isImage(item)) {
          return linkImg ? (
            <Link to={item.cld_url || "#"} target="_blank" key={index}>
              <Image imageref={item} className={className} />
            </Link>
          ) : (
            <Image key={index} imageref={item} className={className} />
          );
        } else if (isVideo(item)) {
          return <Video key={index} videoref={item} />;
        } else {
          return <p key={index}>Unsupported media type.</p>;
        }
      })}
    </>
  );
}
