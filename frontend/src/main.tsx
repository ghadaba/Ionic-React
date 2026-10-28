import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { createRoot } from "react-dom/client";
import App from "./App";

defineCustomElements(window);

createRoot(document.getElementById("root")!).render(<App />);
