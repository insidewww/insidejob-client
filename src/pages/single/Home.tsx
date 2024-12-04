import { useContext } from "react";
import { GeneralContext } from "../../contexts/GeneralContext";
import { Button, Col, Row } from "react-bootstrap";
import { UrlSchema } from "@jakubkanna/labguy-front-schema";
import Background from "../../components/Background";
import Layout from "../../components/layout/Layout.";

export default function Homepage() {
  const { preferences } = useContext(GeneralContext);

  if (!preferences) return null;

  const {
    homepage_heading,
    homepage_subheading,
    homepage_media,
    homepage_urls,
  } = preferences;

  const Backdrop = ({ className }: { className: string }) => {
    return <div className={className}></div>;
  };

  return (
    <Layout title="">
      <Col className="d-flex flex-column justify-content-center align-items-center h-100 position-relative">
        <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
          <Backdrop className="h-100 w-100 z-1 bg-insidejob-light position-fixed opacity-25" />
          <Background media={homepage_media} />
        </div>
        <Row>
          <Col className="d-flex flex-column align-items-center z-2">
            {homepage_heading && (
              <h1 className="display-1 mb-3">{homepage_heading}</h1>
            )}{" "}
            {homepage_subheading && (
              <h2 className="h5 mb-4 font-insidejob-ext">
                {homepage_subheading}
              </h2>
            )}{" "}
          </Col>
        </Row>
        <Row className="w-100">
          <Col xs={12} className="d-flex justify-content-center gap-3">
            {homepage_urls &&
              homepage_urls.map((url, key) => (
                <Button
                  variant={"insidejob"}
                  onClick={() =>
                    window.open(
                      (url as UrlSchema).url,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  key={key}
                >
                  <span>{(url as UrlSchema).title}</span>
                </Button>
              ))}
          </Col>
        </Row>
      </Col>
    </Layout>
  );
}
