import React from "react";
// import { Navigate, useLocation } from "react-router-dom";
// export default function PrivateRoute({ children }) {
//   const isAuthenticated = useIsAuthenticated();
//   const location = useLocation();
//   if (isAuthenticated()) {
//     return children;
//   }

//   return <Navigate to={"/login"} state={{ from: location }} replace />;
// }
import { useKeycloak } from "@react-keycloak/web";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
 const { keycloak } = useKeycloak();
 const location = useLocation();
 const isLoggedIn = keycloak.authenticated;

 return isLoggedIn ? children : <Navigate to={"/login"} state={{ from: location }} replace />;
};

export default PrivateRoute;