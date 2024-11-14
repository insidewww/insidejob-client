import { useContext } from "react";
import { GeneralContext } from "../../contexts/GeneralContext";
import { Col, ListGroup, Row } from "react-bootstrap";
import { UrlSchema } from "@jakubkanna/labguy-front-schema";
import { Link } from "react-router-dom";
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
        <Row>
          <Col>
            <ListGroup
              horizontal
              className="justify-content-center"
              variant="insidejob"
            >
              {homepage_urls &&
                homepage_urls.map((url, key) => (
                  <ListGroup.Item key={key}>
                    <Link to={(url as UrlSchema).url} target="_blank">
                      {(url as UrlSchema).title}
                    </Link>
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </Col>
        </Row>
      </Col>
    </Layout>
  );
}
