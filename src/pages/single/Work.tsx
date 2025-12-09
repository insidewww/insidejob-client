import { useLoaderData, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Work as WorkSchema } from "../Works";
import Image from "../../components/Image";
import Video from "../../components/Video";
import { isImage, isVideo } from "../../utils/helpers";
import {
  ImageRefSchema,
  VideoRefSchema,
} from "@jakubkanna/labguy-front-schema";
import { Helmet } from "react-helmet";
import getCanonicalBaseUrl from "../../utils/getCanonicalBaseUrl";

export default function Work() {
  const data = (useLoaderData() as WorkSchema) || null;
  const navigate = useNavigate();

  if (!data) return null;

  const { general, dimensions, medium, year, media } = data;

  if (!general.published) return "This page is private.";

  return (
    <>
      <Helmet>
        <link
          rel="canonical"
          href={`${getCanonicalBaseUrl(data)}/projects/${general.slug}`}
        />
      </Helmet>
      <Layout title={general.title}>
        <Container className="d-flex flex-column gap-4 mh-100 overflow-auto">
          <Col>
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
                    {isImage(item) && (
                      <Image imageref={item as ImageRefSchema} />
                    )}{" "}
                    {/* Render image */}
                    {isVideo(item) && (
                      <Video videoref={item as VideoRefSchema} />
                    )}{" "}
                    {/* Render video */}
                  </Col>
                ))
              ) : (
                <></>
              )}
            </Row>
            {/* Footer Section */}
            <Row>
              <Col>
                <Button
                  variant="insidejob"
                  className="mt-4 me-2"
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left-short"></i> Back
                </Button>
              </Col>
            </Row>
          </Col>
        </Container>
      </Layout>
    </>
  );
}
