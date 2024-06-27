import { useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/userContext";
import { useKeycloak } from "@react-keycloak/web";
export function useGetUser() {
  const { keycloak } = useKeycloak();
  const { setUser } = useUser();
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(keycloak.tokenParsed)
        console.log(keycloak.token)
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/getUserInfoByToken`, { data: keycloak.tokenParsed}, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          },
        );
        setUser(response.data.user);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [setUser, keycloak.tokenParsed]); 
}
