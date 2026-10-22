import { useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { LinkContainer } from "react-router-bootstrap";
import { useSite } from "../../lib/useSite";
import { useIsMobile } from "../../lib/useIsMobile";
import { useLocation } from "react-router-dom";

function Header() {
  const isMobile = useIsMobile();
  const { preferences, site } = useSite();
  const artists_name = site?.name || "";
  const isBright = preferences?.homepage_media?.isBright;
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const filter = isHomePage ? (isBright ? "none" : "invert(1)") : "";
  // State to control Offcanvas visibility
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // Functions to handle Offcanvas toggle
  const handleShow = () => setShowOffcanvas(true);
  const handleClose = () => setShowOffcanvas(false);

  const offBodyClass =
    "d-flex flex-column align-items-end justify-content-center";
  const offBodyMobileClass =
    "d-flex flex-column align-items-center justify-content-center";

  return (
    <header className="position-fixed w-100 top-0 start-0 px-2 z-3 font-insidejob-ext">


      <Navbar expand="lg">
        <Container fluid>
          <LinkContainer to="/" className="me-auto">
            <Navbar.Brand>{artists_name}</Navbar.Brand>
          </LinkContainer>

          {/* Toggle Button to show Offcanvas */}
          <Navbar.Toggle
            aria-controls="offcanvasNavbar"
            onClick={handleShow}
            style={{ filter }}
          />

          {/* Offcanvas without any transition */}
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            responsive="lg"
            show={showOffcanvas}
            onHide={handleClose}
            className="insidejob-offcanvas w-100"
            backdrop={false}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                {artists_name}
              </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body
              className={isMobile ? offBodyMobileClass : offBodyClass}
            >
              <Nav>
                <LinkContainer to="calendar">
                  <Nav.Link onClick={handleClose}>Current</Nav.Link>
                </LinkContainer>
                <LinkContainer to="projects">
                  <Nav.Link onClick={handleClose}>Selected Projects</Nav.Link>
                </LinkContainer>
                <LinkContainer to="bio">
                  <Nav.Link onClick={handleClose}>Bio</Nav.Link>
                </LinkContainer>
                <LinkContainer to="contact">
                  <Nav.Link onClick={handleClose}>Contact</Nav.Link>
                </LinkContainer>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
