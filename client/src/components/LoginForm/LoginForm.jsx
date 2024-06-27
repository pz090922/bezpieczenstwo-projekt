import React from "react";

import { useKeycloak } from "@react-keycloak/web";
export default function LoginForm() {
  const { keycloak, initialized } = useKeycloak();
  return (  
      <button
        type="submit"
        className="bg-zinc-800 text-white w-1/2 rounded h-8 font-bold hover:bg-zinc-700"
        onClick={() => keycloak.login()}
      >
        Zaloguj się
      </button>
  );
}
