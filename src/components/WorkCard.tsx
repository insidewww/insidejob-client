import { Col, Container, Row } from "react-bootstrap";
import { Work } from "../pages/Works";
import MediaComponent from "./Media";

interface CardProps {
  work: Work;
  onClick?: () => void;
}

export default function WorkCard({ work }: CardProps) {
  const { general, dimensions, year, media } = work;
  const { title } = general;

  if (!media) return;

  return (
    <Container>
      <Row className="gap-3">
        <Col xs={12}>
          <MediaComponent media={media} linkImg />
        </Col>
      </Row>
      <Row className="text-center">
        <span style={{ textDecoration: "none" }}>
          <span style={{ fontStyle: "italic" }}>{title}</span>
          {dimensions && (
            <>
              {", " + dimensions + " "}
              <span style={{ fontSize: "0.8em" }}>(cm)</span>
            </>
          )}
          {year && <>{", " + year}</>}{" "}
        </span>
      </Row>{" "}
    </Container>
  );
}
