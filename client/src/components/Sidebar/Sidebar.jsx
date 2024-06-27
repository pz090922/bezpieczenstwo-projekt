import React, { useEffect, useState } from "react";
import { IoMdHome, IoIosLogOut } from "react-icons/io";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaHeart, FaUserCircle } from "react-icons/fa";
import { CiSquarePlus } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import { IoIosSend } from "react-icons/io";
import { useKeycloak } from "@react-keycloak/web";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import axios from "axios";
export default function Sidebar({ onLogout }) {
  const { user, setUser } = useUser();
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const logout = () => {
    onLogout();
    setUser({});
    keycloak.logout()
    navigate("/login");
  };
  const handleClick = (username) => {
    navigate(`/${username}`);
    setSearchTerm("");
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm !== "") {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/search/search?q=${searchTerm}`, {
              headers: {
                Authorization: `Bearer ${keycloak.token}`
              }
            }
          );
          const array = response.data;
          setResults(array);
        } catch (err) {
          console.error(err);
        }
      } else {
        setResults([]);
      }
    };
    fetchData();
  }, [searchTerm]);

  const [showSearchBar, setShowSearchBar] = useState(false);
  if (showSearchBar) {
    return (
      <div className="flex flex-col justify-between border-r border-zinc-700 p-4 h-full">
        <div className="flex flex-col gap-10">
          <div className="w-full mt-5">
            <img
              src="/images/logo.png"
              alt="Instagram"
              className="w-2/5 ml-3 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <div className="flex">
            <ul className="text-white w-min">
              <li
                onClick={() => navigate("/")}
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded"
              >
                <IoMdHome className="text-3xl" />
              </li>
              <li
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded"
                onClick={() => setShowSearchBar((prev) => !prev)}
              >
                <FaMagnifyingGlass className="text-3xl" />
              </li>
              <li className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded">
                <IoIosSend className="text-3xl" />
              </li>
              <li className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded">
                <FaHeart className="text-3xl" />
              </li>
              <li className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded">
                <CiSquarePlus className="text-3xl" />
              </li>
              <li
                onClick={() => {
                  onLogout();
                  navigate("/profile");
                }}
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded"
              >
                {user.imagePath ? (
                  <img
                    src={`http://localhost:3001/Images/${user.imagePath}`}
                    alt="fotka"
                    className="rounded-full w-8 h-8 object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-3xl" />
                )}
              </li>
            </ul>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col p-4 border-b border-zinc-600">
                <div className="flex mb-10">
                  <p className="text-white font-bold text-2xl">Szukaj</p>
                </div>
                <input
                  type="text"
                  className="rounded bg-zinc-700 p-2 text-white"
                  placeholder="Szukaj"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
              </div>
              <div className="flex p-2">
                <ul className="flex flex-col gap-2">
                  {results.map((user) => (
                    <li
                      className="text-white flex items-center gap-2 cursor-pointer hover:bg-zinc-800 p-2 rounded"
                      onClick={() => handleClick(user.username)}
                      key={user._id}
                    >
                      <ProfilePicture user={user} size="h-8 w-8" />
                      <strong>{user.username}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={logout}
          className="p-4 flex items-center gap-3 text-white cursor-pointer hover:bg-zinc-800 rounded"
        >
          <IoIosLogOut className="text-3xl" />
          <div className="font-semibold">Wyloguj</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-between border-r border-zinc-700 p-4 h-full">
      <div className="flex flex-col gap-10">
        <div className="w-full mt-5">
          <img
            src="/images/logo.png"
            alt="Instagram"
            className="w-2/5 ml-3 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div>
          <ul className="text-white">
            <li
              onClick={() => navigate("/")}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded"
            >
              <IoMdHome className="text-3xl" />
              <p className="font-semibold">Strona główna</p>
            </li>
            <li
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded"
              onClick={() => setShowSearchBar((prev) => !prev)}
            >
              <FaMagnifyingGlass className="text-3xl" />
              <p className="font-semibold">Wyszukaj</p>
            </li>
            <li className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded">
              <IoIosSend className="text-3xl" />
              <p className="font-semibold">Wiadomości</p>
            </li>
            <li className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded">
              <FaHeart className="text-3xl" />
              <p className="font-semibold">Powiadomienia</p>
            </li>
            <li className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded">
              <CiSquarePlus className="text-3xl" />
              <p className="font-semibold">Stwórz</p>
            </li>
            <li
              onClick={() => navigate("/profile")}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 rounded"
            >
              {user.imagePath ? (
                <img
                  src={`http://localhost:3001/Images/${user.imagePath}`}
                  alt="fotka"
                  className="rounded-full w-8 h-8 object-cover"
                />
              ) : (
                <FaUserCircle className="text-3xl" />
              )}

              <div className="font-semibold">Profil</div>
            </li>
          </ul>
        </div>
      </div>
      <div
        onClick={logout}
        className="p-4 flex items-center gap-3 text-white cursor-pointer hover:bg-zinc-800 rounded"
      >
        <IoIosLogOut className="text-3xl" />
        <div className="font-semibold">Wyloguj</div>
      </div>
    </div>
  );
}
