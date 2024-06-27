import React, {useEffect} from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import { useKeycloak } from "@react-keycloak/web";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const { keycloak} = useKeycloak();
  const navigate = useNavigate();
  useEffect(() => {
    const signIn = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { data: keycloak.tokenParsed } 
            ,{
                headers: {
                  Authorization: `Bearer ${keycloak.token}`
                }
              })
              
        } catch (error) {
            console.error(error)
        }
    }
    if (keycloak.authenticated) {
      signIn()
      navigate("/")
    }
}, [keycloak.authenticated])




  return (
    <div className="bg-black">
      <div className="container flex mx-auto max-w-screen-md items-center h-screen">
        <div className="flex w-3/5">
          <img src="/images/phones.png" alt="iPhone with Instagram app" />
        </div>
        <div className="flex flex-col w-2/5">
          <div className="flex flex-col items-center bg-blue p-4 border border-gray-400 mb-4 rounded">
            <h1 className="flex justify-center w-full">
              <img
                src="/images/logo.png"
                alt="Instagram"
                className="mt-2 w-6/12 mb-4"
              />
            </h1>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
