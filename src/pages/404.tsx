import { Link, useLocation, useNavigate } from "react-router-dom";
import { Col, Container } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { useEffect } from "react";
import Layout from "../components/layout/Layout.";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the location contains '/index.php' and redirect if needed
    if (location.pathname.includes("/index.php")) {
      navigate("/");
    }
  }, [location, navigate]);

  return (
    <Container>
      <Helmet>
        <title>404 Not Found</title>
      </Helmet>
      <Layout>
        <Col className="position-fixed top-50 start-50 translate-middle text-center font-monospace">
          <p>Page not found :(</p>
          <Link to={"/"}>Home</Link>
        </Col>
      </Layout>
    </Container>
  );
}
