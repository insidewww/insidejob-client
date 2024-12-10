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
    return null;
  }

  return (
    <>
      {media.map((item, index) => {
        if (isImage(item)) {
          return (
            <div key={index} className="media-item">
              {linkImg ? (
                <Link to={item.cld_url || "#"} target="_blank">
                  <Image imageref={item} className={className} />
                </Link>
              ) : (
                <Image imageref={item} className={className} />
              )}
              <p className="small py-2 m-0 text-center">{item.description}</p>
            </div>
          );
        } else if (isVideo(item)) {
          return (
            <div key={index} className="media-item">
              <Video videoref={item} className={className} />
              <p className="small py-2 m-0 text-center">{item.description}</p>
            </div>
          );
        } else {
          return (
            <div key={index} className="media-item">
              <p>Unsupported media type.</p>
            </div>
          );
        }
      })}
    </>
  );
}
