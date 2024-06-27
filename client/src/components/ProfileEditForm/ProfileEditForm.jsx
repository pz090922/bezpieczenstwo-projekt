import React, { useState, useRef } from "react";
import { useUser } from "../../context/userContext";
import { toast } from "react-hot-toast";
import axios from "axios";
import ModalConfirmDelete from "../ModalConfirmDelete/ModalConfirmDelete";
import ChangePasswordForm from "../ChangePasswordForm/ChangePasswordForm";
import ChangeNameForm from "../ChangeNameForm/ChangeNameForm";
import ChangeGenderForm from "../ChangeGenderForm/ChangeGenderForm";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
export default function ProfileEditForm() {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak()
  const { user, setUser } = useUser();

  const [file, setFile] = useState(null);

  const submitImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    try {
      if (!file) {
        toast.error("Nie wybrałeś żadnego zdjęcia!");
      } else {
        formData.append("sub", keycloak.tokenParsed.sub);
        formData.append("file", file);
        const res = await axios.put(
          `${process.env.REACT_APP_API_URL}/profile/update/image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${keycloak.token}`
            },
          }
        );
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/getUserInfoByToken`,
          { data: {sub: keycloak.tokenParsed.sub} }, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          }
        );
        setUser(response.data.user);
        toast.success("Pomyślnie zmieniono zdjęcie");
      }
    } catch (error) {
      console.log(error)
      if (error.response?.status === 500) {
        toast.error("Coś poszło nie tak");
      } else {
        toast.error(error.response?.data?.error);
      }
    }
  };

  const deleteImage = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/profile/update/image`, {
        sub: keycloak.tokenParsed.sub,
        delete: true,
      }, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      });
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/getUserInfoByToken`,
        { data: {sub: keycloak.tokenParsed.sub} }, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`
          }
        }
      );
      setUser(response.data.user);
      toast.success("Pomyślnie usunięto zdjęcie");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const onInputChange = (e) => {
    try {
      setFile(e.target.files[0]);
      toast.success("Pomyślnie wybrano zdjęcie");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/profile/delete`,
        {
          headers: {
            // Authorization: token,
          },
          data: {
            // token: token,
          },
        }
      );
      toast.success(response.data.message);
      // signOut();
      navigate("/login");
    } catch (error) {
      toast.error("Nie udało się usunąć konta");
    }
  };

  const jsonInputRef = useRef(null);

  const handleJsonClick = () => {
    jsonInputRef.current.click();
  };

  const [showModal, setShowModal] = useState(false);

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/export/${user._id}`
      );
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exported_data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast.error("Coś poszło nie tak...");
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const importedData = JSON.parse(event.target.result);
        console.log(importedData);
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/import/${user._id}`,
          importedData
        );

        toast.success(response.data.message);
        const user = await axios.post(
          `${process.env.REACT_APP_API_URL}/getUserInfoByToken`,
          // { token }
        );
        setUser(user.data.user);
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error("Błąd podczas importu danych");
    }
  };

  return (
    <div className="w-full text-white flex flex-col justify-content-center items-center pt-10 gap-10 overflow-y-auto">
      <div className="flex flex-col w-1/2 justify-content-center gap-9">
        <div className="text-xl font-bold">Edytuj profil</div>
        <div className="flex justify-between items-center rounded-2xl p-5 bg-zinc-800">
          <div className="flex gap-4 items-center">
            <ProfilePicture user={user} size="h-14 w-14" />
            <div className="flex flex-col">
              <div className="font-bold">{user.username}</div>
              <div className="text-sm text-zinc-400">
                {user.firstName} {user.lastName}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <form onSubmit={submitImage} className="flex items-center gap-3">
              <input
                type="file"
                id="selectedFile"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={onInputChange}
              />
              <input
                type="button"
                value="Wybierz zdjęcie"
                onClick={handleButtonClick}
                className="flex cursor-pointer pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
              />
              <button className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700">
                Potwierdź
              </button>
            </form>
            <button
              onClick={deleteImage}
              className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-red-600 font-bold hover:bg-red-700"
            >
              Usuń zdjęcie
            </button>
          </div>
        </div>
        {/* <div className="text-xl font-bold">Zmień hasło</div>
        <div className="flex items-center rounded-2xl p-5 bg-zinc-800">
          <ChangePasswordForm />
        </div>
        <div className="text-xl font-bold">Zmień dane osobowe</div>
        <div className="flex items-center rounded-2xl p-5 bg-zinc-800">
          <ChangeNameForm />
        </div> */}
        <div className="text-xl font-bold">Płeć</div>
        <div className="flex items-center rounded-2xl p-5 bg-zinc-800">
          <ChangeGenderForm />
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-red-600 font-bold hover:bg-red-700"
          >
            Usuń konto
          </button>
          {/* <button
            onClick={handleExport}
            className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
          >
            Eksportuj
          </button> */}
          {/* <button className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700">
            Importuj
          </button> */}
          {/* <input
            type="file"
            id="json"
            className="hidden"
            accept=".json"
            ref={jsonInputRef}
            onChange={handleImport}
          />
          <input
            type="button"
            value="Importuj json"
            onClick={handleJsonClick}
            className="flex cursor-pointer pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
          /> */}
        </div>
      </div>
      <ModalConfirmDelete
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onDelete={() => deleteAccount()}
      />
    </div>
  );
}
