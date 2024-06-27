import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { useGetUser } from "../hooks/useGetUser";
import { useUser } from "../context/userContext";
import ProfilePicture from "../components/ProfilePicture/ProfilePicture";
import axios from "axios";
import { BsThreeDots } from "react-icons/bs";
import { FaHeart, FaComment } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import ModalPost from "../components/ModalPost/ModalPost";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
export default function Dashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(null);
  useGetUser();
  const { keycloak } = useKeycloak();
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [clickedPost, setClickedPost] = useState(null);
  const [reload, setReload] = useState(true);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await axios.post(`${process.env.REACT_APP_API_URL}/dashboard`, {
          user,
        }, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`
          }
        });
        setPosts(posts.data.posts);
        setReload(false);
      } catch (error) {
        console.error(error);
      }
    };
    if (user && user.username && reload) {
      fetchData();
    }
  }, [user, reload]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/dashboard/users`,
          { user },
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          }
        );
        setUsers(response.data.users);
      } catch (error) {
        console.error(error);
      }
    };
    if (user && user.username) {
      fetchData();
    }
    // console.log(user)
  }, [user, setUsers]);

  const handleLike = async (post) => {
    try {
      const message = await axios.put(`${process.env.REACT_APP_API_URL}/post/like`, {
        postId: post._id,
        sub: keycloak.tokenParsed.sub,
      }, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      });
      setReload(true);
      toast.success(message.data.message);
    } catch (error) {
      console.error(error);
      toast.error("Coś poszło nie tak");
    }
  };
  return (
    <div className="bg-black h-screen flex">
      <div className="w-1/6 h-screen">
        <Sidebar onLogout={() => setPosts(null)} />
      </div>
      <div className="flex w-5/6 overflow-y-auto text-white">
        <div className="flex flex-col gap-5 w-3/4">
          <ul className="flex flex-col items-center gap-12 pt-10 pb-10">
            {posts
              ? posts.map((post) => (
                  <li key={post._id} className="pb-3 border-b border-zinc-500">
                    <div className="flex flex-col w-[468px] gap-2">
                      <div className="flex justify-between">
                        <div
                          className="flex gap-2 items-center cursor-pointer"
                          onClick={() => navigate(`/${post.owner[0].username}`)}
                        >
                          <ProfilePicture user={post.owner[0]} size="h-8 w-8" />
                          <strong>{post.owner[0].username}</strong>
                        </div>
                        <div className="flex items-center">
                          <BsThreeDots className="cursor-pointer" />
                        </div>
                      </div>
                      <div className="w-full">
                        <img
                          src={`http://localhost:3001/Images/${post.imagePath}`}
                          alt="fotka"
                          className="object-cover w-full aspect-[3/4] cursor-pointer border border-zinc-500 rounded"
                          onClick={() => {
                            setClickedPost(post);
                            setShowModal(true);
                            setReload(true);
                          }}
                        />
                      </div>
                      <div className="flex flex-col w-full gap-1">
                        <div className="w-full">
                          <div className="flex gap-4">
                            <FaHeart
                              onClick={() => handleLike(post)}
                              className={`text-2xl cursor-pointer transition ${
                                post && post.likes.includes(user._id)
                                  ? "text-red-500"
                                  : null
                              }`}
                            />
                            <FaComment
                              onClick={() => {
                                setClickedPost(post);
                                setShowModal(true);
                                setReload(true);
                              }}
                              className="scale-x-[-1] text-2xl cursor-pointer"
                            />
                            <IoIosSend className="text-2xl cursor-pointer" />
                          </div>
                        </div>
                        <div className="flex items-center font-bold gap-2 text-sm">
                          <p>Liczba polubień: </p>
                          <p>{post.likes.length}</p>
                        </div>
                        <div className="flex gap-2 text-sm">
                          <p className="font-bold">{post.owner[0].username}</p>
                          <p>{post.content}</p>
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              setClickedPost(post);
                              setShowModal(true);
                              setReload(true);
                            }}
                          >
                            Zobacz wszystkie komentarze: {post.comments.length}
                          </button>
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              setClickedPost(post);
                              setShowModal(true);
                              setReload(true);
                            }}
                          >
                            Dodaj komentarz
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              : null}
          </ul>
        </div>
        <div className="pt-20 flex flex-col gap-3">
          <div className="text-sm text-zinc-500">Propozycje dla Ciebie</div>
          <ul className="flex flex-col gap-3">
            {users
              ? users.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => navigate(`/${user.username}`)}
                    className="flex items-center gap-3 cursor-pointer
                  "
                  >
                    <ProfilePicture user={user} size="h-8 w-8" />
                    <strong>{user.username}</strong>
                  </li>
                ))
              : null}
          </ul>
        </div>
      </div>
      <ModalPost
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        post={clickedPost}
        setReload={() => setReload(true)}
      />
    </div>
  );
}
