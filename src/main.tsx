import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/theme.scss";
import { createRoot } from "react-dom/client";
import Router from "./Router";
import { GeneralProvider } from "./contexts/providers/GeneralProvider";

createRoot(document.getElementById("root")!).render(
  <GeneralProvider>
    <Router />
  </GeneralProvider>
);
