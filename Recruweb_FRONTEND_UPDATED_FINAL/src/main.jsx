import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";
import "./perf-mobile.css";

import { AuthProvider } from "./context/AuthContext";
import { GlobalPrefsProvider } from "./context/GlobalPrefsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <AuthProvider>
        <GlobalPrefsProvider>
          <App />
        </GlobalPrefsProvider>
      </AuthProvider>
  </React.StrictMode>,
);
