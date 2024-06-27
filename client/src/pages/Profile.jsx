import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ProfileHeader from "../components/ProfileHeader/ProfileHeader";
import { useUser } from "../context/userContext";
import { useGetUser } from "../hooks/useGetUser";
import { IoMdGrid } from "react-icons/io";
import { FaUserTag } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import ModalAddPost from "../components/ModalAddPost/ModalAddPost";
import ProfilePosts from "../components/ProfilePosts/ProfilePosts";
export default function Profile() {
  const { keycloak } = useKeycloak();
  useGetUser();
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  // const token = authHeader().replace(/^Bearer\s/, "");
  const [userData, setUserData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    email: "",
    gender: "",
    followers: [],
    following: [],
  });
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  useEffect(() => {
    if (username && username === user.username) {
      navigate("/profile");
    } else if (username && user.username && username !== user.username) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/${username}`
            ,{
              headers: {
                Authorization: `Bearer ${keycloak.token}`
              }
            }
          );
          setUserData(response.data);
          const posts = await axios.post(
            `${process.env.REACT_APP_API_URL}/post/get/other`,
            { username, sub: keycloak.tokenParsed.sub }
          , {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          });
          setPosts(posts.data.posts.reverse());
        } catch (error) {
          setIsNotFound(true);
        }
      };
      fetchData();
    }
  }, [username, navigate, user.username, keycloak.token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/post/get`,
          {
            sub: keycloak.tokenParsed.sub,
          }, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          }
        );
        setPosts(response.data.posts.reverse());
      } catch (error) {
        console.error(error);
      }
    };
    if (!username) {
      setIsNotFound(false);
      setUserData(user);
      fetchData();
    }
  }, [user, username, keycloak.token]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (username) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/post/get/other`,
            { username, sub: keycloak.tokenParsed.sub },
            {
              headers: {
                Authorization: `Bearer ${keycloak.token}`
              }
            } // token
          );
          setPosts(response.data.posts.reverse());
        } else {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/post/get`,
            {
              sub: keycloak.tokenParsed.sub,
            },
            {
              headers: {
                Authorization: `Bearer ${keycloak.token}`
              }
            }
          );
          setPosts(response.data.posts.reverse());
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (reload) {
      fetchData();
      setReload(false);
    }
  }, [reload, keycloak.token]);
  if (isNotFound) {
    return (
      <div className="bg-black h-screen flex">
        <div className="w-1/6 h-screen">
          <Sidebar onLogout={() => setPosts([])} />
        </div>
        <div className="w-5/6 h-screen text-white">Nie znaleziono</div>
      </div>
    );
  }

  return (
    <div className="bg-black h-screen flex">
      <div className="w-1/6 h-screen">
        <Sidebar onLogout={() => setPosts([])} />
      </div>
      <div className="w-5/6 h-screen text-white overflow-y-auto">
        <div className="container flex flex-col mx-auto max-w-5xl p-6">
          <ProfileHeader
            userData={userData}
            posts={posts.length}
            onMove={() => setPosts([])}
          />
          {user.username === userData.username ? (
            <div className="flex flex-col w-full justify-center items-center mb-3 gap-1 font-bold">
              <IoMdAdd
                onClick={() => setShowModal(true)}
                className="text-5xl rounded-full border border-white cursor-pointer"
              />
              <p onClick={() => setShowModal(true)} className="cursor-pointer">
                Dodaj post
              </p>
            </div>
          ) : null}
          <div className="flex w-full border-t border-zinc-700  gap-10 justify-center">
            <div className="flex border-t border-slate-50 p-3 items-center font-bold gap-2 cursor-pointer">
              <IoMdGrid />
              <div>Posty</div>
            </div>
            <div className="flex border-t border-black text-zinc-500 p-3 gap-2 items-center cursor-pointer">
              <FaUserTag />
              <div>Z oznaczeniem</div>
            </div>
          </div>
          <ProfilePosts posts={posts} setReload={() => setReload(true)} />
        </div>
      </div>
      <ModalAddPost
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        setReload={() => setReload(true)}
      />
    </div>
  );
}
