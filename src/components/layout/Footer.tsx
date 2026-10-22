import { Col, Row } from "react-bootstrap";
import { useSite } from "../../lib/useSite";

export default function Footer() {
  const { site } = useSite();
  const artists_name = site?.name || "";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-4 position-fixed bottom-0 start-50 translate-middle-x pe-1">
      <Col>
        <Row>
          <Col className="d-flex align-items-center justify-content-center">
            {/*  */}
          </Col>
          <Col className="d-flex align-items-center justify-content-center">
            {/*  */}
          </Col>
          <Col className="d-flex align-items-center justify-content-center">
            {/*  */}
          </Col>
        </Row>
        <Row>
          <Col className="d-flex align-items-end justify-content-end">
            <small>
              © {currentYear} {artists_name}
            </small>
          </Col>
        </Row>
      </Col>
    </footer>
  );
}
