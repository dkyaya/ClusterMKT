import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@cluster-mkt/ui/styles.css";
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/edition-theme.css";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Application root is missing.");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
