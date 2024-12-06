import { Col, Container, Row } from "react-bootstrap";
import { Work } from "../pages/Works";
import { isImage, isVideo } from "../utils/helpers"; // Ensure you have `isVideo` helper imported
import { Link } from "react-router-dom";
import Image from "./Image"; // Assuming Image is a custom component
import Video from "./Video"; // Assuming Video is a custom component

interface CardProps {
  work: Work;
  onClick?: () => void;
}

export default function WorkCard({ work }: CardProps) {
  const { general, dimensions, year, media } = work;
  const { title } = general;

  if (!media || media.length === 0) return null; // Return null if no media

  const Caption = ({ className }: { className?: string }) => {
    return (
      <span style={{ textDecoration: "none" }} className={className}>
        <span style={{ fontStyle: "italic" }}>{title}</span>
        {dimensions && (
          <>
            {", " + dimensions + " "}
            <span style={{ fontSize: "0.8em" }}>(cm)</span>
          </>
        )}
        {year && <>{", " + year}</>}{" "}
      </span>
    );
  };
  return (
    <Container>
      <Row className="gap-3">
        <Col xs={12}>
          {media.map((item, index) => {
            if (isImage(item)) {
              return (
                <Link to={item.cld_url || "#"} target="_blank" key={index}>
                  <Image imageref={item} className="img-fluid" />
                  <Col xs={12} className="d-flex justify-content-center py-2">
                    <Caption />
                  </Col>
                </Link>
              );
            } else if (isVideo(item)) {
              return (
                <>
                  <Video key={index} videoref={item} />
                  <Col xs={12} className="d-flex justify-content-center py-2">
                    <Caption />
                  </Col>
                </>
              );
            } else {
              return <p key={index}>Unsupported media type.</p>;
            }
          })}
        </Col>
      </Row>
      <Row className="text-center"></Row>
    </Container>
  );
}
