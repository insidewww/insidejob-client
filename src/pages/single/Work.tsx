import { useLoaderData } from "react-router-dom";
import Layout from "../../components/layout/Layout.";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Work as WorkSchema } from "../Works";
import Image from "../../components/Image";
import Video from "../../components/Video";
import { Link } from "react-router-dom";
import { isImage, isVideo } from "../../utils/helpers";
import {
  ImageRefSchema,
  VideoRefSchema,
} from "@jakubkanna/labguy-front-schema";

export default function Work() {
  const data = (useLoaderData() as WorkSchema) || null;

  if (!data) return null;

  const { general, dimensions, medium, year, media } = data;

  if (!general.published) return "This page is private.";

  return (
    <Layout title={general.title}>
      <Container className="d-flex flex-column gap-4 mh-100 overflow-auto">
        {/* Display Dimensions and Year */}
        <Row>
          <Col xs={12}>
            <p id="Details" className="text-center">
              {dimensions && <span>{dimensions} (cm), </span>}
              {medium && <span>{medium}, </span>}
              {year && <span>{year}</span>}
            </p>
          </Col>
        </Row>
        {/* Display Images */}
        <Row className="gap-3">
          {media && media.length > 0 ? (
            media.map((item) => (
              <Col xs={12} key={item?.etag}>
                {isImage(item) && <Image imageref={item as ImageRefSchema} />}{" "}
                {/* Render image */}
                {isVideo(item) && (
                  <Video videoref={item as VideoRefSchema} />
                )}{" "}
                {/* Render video */}
              </Col>
            ))
          ) : (
            <p></p>
          )}
        </Row>
        {/* Footer Section */}
        <Row>
          <Col>
            <Link to="/projects" className="mt-4 me-2">
              <Button variant="insidejob">
                <i className="bi bi-arrow-left-short"></i> Back
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
