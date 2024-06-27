import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { ReactKeycloakProvider } from '@react-keycloak/web'
import keycloak from './keycloak/keycloak'
import UserProvider from "./context/userContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <ReactKeycloakProvider authClient={keycloak}>
      <UserProvider>
      <App />
      <Toaster position="top-center" />
      </UserProvider>
    </ReactKeycloakProvider>
  // </React.StrictMode>
);
