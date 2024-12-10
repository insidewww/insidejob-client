import React from "react";
import ReactPlayer from "react-player/lazy";
import { VideoRefSchema } from "@jakubkanna/labguy-front-schema";

function getVideoUrl(videoRef: VideoRefSchema): string | null {
  if (videoRef.yt_url) return videoRef.yt_url;
  if (videoRef.vimeo_url) return videoRef.vimeo_url;
  if (videoRef.sc_url) return videoRef.sc_url;
  return null;
}

export default function Video({
  videoref,
  className,
}: {
  videoref: VideoRefSchema;
  className?: string;
}) {
  const videoUrl = getVideoUrl(videoref);

  if (!videoUrl) return null;

  const playerWrapperStyle: React.CSSProperties = {
    position: "relative",
    paddingTop: "56.25%", // 16:9 aspect ratio
    height: 0,
    overflow: "hidden",
    maxWidth: "100%",
  };

  const playerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  };

  return (
    <div style={playerWrapperStyle} className={className}>
      <ReactPlayer
        url={videoUrl}
        controls
        width={"100%"}
        height={"100%"}
        style={playerStyle}
      />
    </div>
  );
}
