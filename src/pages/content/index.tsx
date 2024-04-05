import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./app";

const div = document.createElement("div");
div.id = "__root";
div.classList.add("efitter-root");
document.body.appendChild(div);

const rootContainer = document.querySelector("#__root");
if (!rootContainer) throw new Error("Can't find Options root element");
const root = createRoot(rootContainer);
root.render(<App />);

try {
  console.log("content script loaded");
} catch (e) {
  console.error(e);
}
