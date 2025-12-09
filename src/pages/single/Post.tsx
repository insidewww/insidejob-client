import { useLoaderData } from "react-router-dom";
import {
  GeneralSectionSchema,
  ImageRefSchema,
  PostSchema,
  VideoRefSchema,
} from "@jakubkanna/labguy-front-schema";
import { Container } from "react-bootstrap";
import HTMLReactParser from "html-react-parser";
import VideoComponent from "../../components/Video";
import ImageComponent from "../../components/Image";
import Layout from "../../components/layout/Layout";
import { Content } from "@jakubkanna/labguy-front-schema/dist/Post.schema";

interface Post extends PostSchema {
  general: GeneralSectionSchema;
}

function renderPostContent(content: Content | undefined) {
  if (!content) return null;

  return content.map((block, index) => {
    if ("text" in block) {
      // Handle Text block
      return <div key={index}>{HTMLReactParser(block.text as string)}</div>;
    }

    if ("images" in block) {
      // Handle Image block
      const images = block.images as ImageRefSchema[];
      return images.map((image, i) => (
        <ImageComponent key={`${index}-${i}`} imageref={image} />
      ));
    }

    if ("videos" in block) {
      // Handle Video block
      const videos = block.videos as VideoRefSchema[];
      return videos.map((video, i) => (
        <VideoComponent key={`${index}-${i}`} videoref={video} />
      ));
    }

    return null;
  });
}

export default function Post() {
  const data = useLoaderData() as Post;

  if (!data) {
    console.warn("No data received in Post component.");
    return null;
  }

  const { general, content } = data;

  if (!content) {
    console.warn("Content field is undefined or null.");
    return <p>No content available.</p>;
  }

  return (
    <Layout title={general.title}>
      <Container className="d-flex flex-column gap-4">
        {renderPostContent(content)}
      </Container>
    </Layout>
  );
}
