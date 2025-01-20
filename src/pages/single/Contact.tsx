import { ProfileSchema } from "@jakubkanna/labguy-front-schema";
import Layout from "../../components/layout/Layout.";
import { Col, Container, Row } from "react-bootstrap";
import { Link, useLoaderData } from "react-router-dom";
import { useContext } from "react";
import PortfolioButton from "../../components/PortfolioButton";
import { GeneralContext } from "../../contexts/GeneralContext";
import { Helmet } from "react-helmet";

export default function Contact() {
  const data = (useLoaderData() as ProfileSchema) || null;
  const { preferences } = useContext(GeneralContext);

  if (!data) return null;

  const { contact } = data;

  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://ulalucinska.com/contact" />
      </Helmet>
      <Layout title="Contact">
        <Container className="d-flex flex-column justify-content-center">
          <Row className="justify-content-center align-items-center">
            {contact?.map((c, i) => (
              <Col
                key={i}
                xs={12}
                md={6}
                className="d-flex flex-column align-items-center text-center my-3 p-4"
              >
                <h5>{c.name}</h5>
                <p>{c.email}</p>
                {c.socialmedia?.map((sm, index) => (
                  <Link
                    key={index}
                    to={sm.profileUrl || "#"}
                    target="_blank"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      textDecoration: "none",
                    }}
                  >
                    <i className={`bi bi-${sm.platform?.toLowerCase()}`} />
                    {sm.username}
                  </Link>
                ))}
              </Col>
            ))}
          </Row>
          <>
            {preferences?.enable_portfolio_pdf && (
              <div
                id="Portfolio"
                className="position-absolute bottom-0 end-0 p-5"
              >
                <PortfolioButton url={data.portfolio_pdf_url} />
              </div>
            )}
          </>
        </Container>
      </Layout>
    </>
  );
}
