import React, { useEffect, useState } from "react";
import axios from "axios";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import { FaHeart, FaComment } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { useUser } from "../../context/userContext";
import { useKeycloak } from '@react-keycloak/web'
import { BsThreeDots } from "react-icons/bs";
import EditPost from "../EditPost/EditPost";
export default function ModalPost({ isVisible, onClose, post, setReload }) {
  const [postDetails, setPostDetails] = useState(null);
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const { keycloak } = useKeycloak()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/post/get/single`,
          {
            id: post._id,
          },
          {
            headers: { Authorization: `Bearer ${keycloak.token}` }
          }
        );
        setPostDetails(response.data.post);
      } catch (error) {
        console.log(error);
      }
    };
    if (post && isVisible) {
      fetchData();
    }
  }, [isVisible, post]);

  const formik = useFormik({
    initialValues: {
      comment: "",
    },
    validationSchema: Yup.object().shape({
      comment: Yup.string().required("Nie możesz wysłać pustego komentarza!"),
    }),
    onSubmit: async (values) => {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/post/comment`, {
          sub: keycloak.tokenParsed.sub,
          id: post._id,
          comment: values.comment,
        },
        {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        });
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/post/get/single`,
          {
            id: post._id,
          },
          {
            headers: { Authorization: `Bearer ${keycloak.token}` }
          }
        );
        setPostDetails(response.data.post);
        setReload();
        toast.success("Udało się zamieścić komentarz");
      } catch (error) {
        toast.error("Coś poszło nie tak...");
      }
      formik.values.comment = "";
    },
  });

  const handleLike = async () => {
    try {
      const message = await axios.put(`${process.env.REACT_APP_API_URL}/post/like`, {
        postId: post._id,
        sub: keycloak.tokenParsed.sub
      }, {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      });
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/post/get/single`,
        {
          id: post._id,
        },
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`
          }
        }
      );
      setPostDetails(response.data.post);
      setReload();
      toast.success(message.data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      formik.handleSubmit();
    }
  };

  if (!isVisible || !post) return null;
  return (
    <div className="fixed text-white inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center">
      <div className="flex h-[90vh] w-full justify-center">
        <div className="h-full bg-black">
          {isEditing && postDetails ? (
            <EditPost
              post={postDetails}
              setReload={() => setReload(true)}
              onClose={() => {
                onClose();
                setIsEditing(false);
              }}
            />
          ) : (
            <img
              src={`http://localhost:3001/Images/${post.imagePath}`}
              alt="fotka"
              className="object-contain h-full max-w-screen-md"
            />
          )}
        </div>
        <div className="flex flex-col w-[300px] bg-black">
          <div className="flex flex-col p-4 gap-2 border-b border-zinc-700">
            <div className="flex justify-between w-full">
              <div className="flex gap-3 items-center">
                {postDetails ? (
                  <div className="flex items-center gap-3">
                    <ProfilePicture user={postDetails.owner} size="h-8 w-8" />
                    <p className="font-bold">{postDetails.owner.username}</p>
                  </div>
                ) : null}
              </div>
              {postDetails && postDetails.owner._id === user._id ? (
                <div className="flex flex-col gap-2 items-center">
                  <button
                    className="text-white font-bold"
                    onClick={() => {
                      onClose();
                      setPostDetails(null);
                      setIsEditing(false);
                    }}
                  >
                    X
                  </button>
                  <BsThreeDots
                    className="text-xl cursor-pointer"
                    onClick={() => setIsEditing((prev) => !prev)}
                  />
                </div>
              ) : (
                <button
                  className="text-white font-bold"
                  onClick={() => {
                    onClose();
                    setPostDetails(null);
                  }}
                >
                  X
                </button>
              )}
            </div>
            <div>
              {postDetails ? (
                <p className="text-sm break-words">{postDetails.content}</p>
              ) : null}
            </div>
          </div>
          <div className="flex basis-full overflow-y-auto">
            {postDetails ? (
              <ul className="h-full gap-4 flex flex-col p-2">
                {postDetails.comments.map((comment) => (
                  <li className="flex gap-4" key={comment._id}>
                    <ProfilePicture user={comment.owner} size="h-8 w-8" />
                    <div className="text-sm break-words w-[220px]">
                      <strong>{comment.owner.username}</strong>
                      <p>{comment.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 h-[200px] p-4 border-t border-zinc-700">
            <div className="flex gap-6">
              <FaHeart
                onClick={handleLike}
                className={`text-2xl cursor-pointer transition ${
                  postDetails && postDetails.likes.includes(user._id)
                    ? "text-red-500"
                    : null
                }`}
              />
              <FaComment className="scale-x-[-1] text-2xl cursor-pointer" />
              <IoIosSend className="text-2xl cursor-pointer" />
            </div>
            {postDetails ? (
              <div className="flex flex-col">
                <p>
                  <strong>{postDetails.likes.length}</strong> użytkowników lubi
                  to
                </p>
                <p className="text-xs text-zinc-400">
                  {postDetails.createdAt.slice(0, 10)}
                </p>
              </div>
            ) : null}
            <form
              onSubmit={formik.handleSubmit}
              className="flex justify-between gap-3"
            >
              <textarea
                id="comment"
                name="comment"
                onChange={formik.handleChange}
                value={formik.values.comment}
                className="flex items-center p-1 resize-none h-9 bg-zinc-600 rounded-md w-full"
                onKeyPress={handleKeyPress}
              />
              <button type="submit" className="text-sky-700 font-bold">
                Opublikuj
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
