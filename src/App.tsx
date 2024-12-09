import { Container } from "react-bootstrap";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import Main from "./components/layout/Main";
import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import Fallback from "./components/Fallback";
import { useContext } from "react";
import { GeneralContext } from "./contexts/GeneralContext";

function App() {
  const { preferences } = useContext(GeneralContext);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (!preferences) return null;

  const { homepage_media } = preferences;

  const isBright = homepage_media?.isBright;
  const textColor = isBright ? "var(--bs-dark)" : "var(--ijoblight)";

  return (
    <Container
      fluid
      className=""
      style={
        isHomePage
          ? {
              color: textColor,
            }
          : {}
      }
    >
      <Header />
      <Main>
        <ErrorBoundary FallbackComponent={Fallback}>
          <Outlet />
        </ErrorBoundary>
      </Main>
      <Footer />
    </Container>
  );
}

export default App;
