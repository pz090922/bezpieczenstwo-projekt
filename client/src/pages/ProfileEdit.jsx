import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { useGetUser } from "../hooks/useGetUser";
import { useUser } from "../context/userContext";
import ProfileEditForm from "../components/ProfileEditForm/ProfileEditForm";
export default function ProfileEdit() {
  useGetUser();
  return (
    <div className="bg-black h-screen flex">
      <div className="w-1/6 h-screen">
        <Sidebar onLogout={() => {}} />
      </div>
      <ProfileEditForm />
    </div>
  );
}
