import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import Gate from "./Gate";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Gate>
      <App />
    </Gate>
  </StrictMode>
);
