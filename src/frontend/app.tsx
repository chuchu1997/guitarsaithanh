/** @format */

import "./index.css";
import { createRoot } from "react-dom/client";

import DashboardView from "./views/dashboard";

const root = createRoot(document.body);
root.render(
  <div>
    <DashboardView />
  </div>
);
