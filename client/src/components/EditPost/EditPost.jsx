import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function EditPost({ post, setReload, onClose }) {
  const formik = useFormik({
    initialValues: {
      text: post.content,
      privacy: post.privacy,
    },
    validationSchema: Yup.object().shape({
      text: Yup.string().max(200, "Tekst nie może być dłuższy niż 200 znaków"),
      privacy: Yup.string()
        .required("Rodzaj widoczności posta jest wymagana")
        .oneOf(["private", "public", "friends"]),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/post`, {
          // token,
          id: post._id,
          privacy: values.privacy,
          content: values.text,
        });
        onClose();
        setReload();
        toast.success(response.data.message);
      } catch (error) {
        toast.error(error.response.data.error);
      }
    },
  });
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/post`, {
        headers: {
          // Authorization: token,
        },
        data: {
          // token: token,
          id: post._id,
        },
      });
      onClose();
      setReload();
      toast.success("Pomyślnie usunięto post");
    } catch (error) {
      console.error(error);
      toast.error("Coś poszło nie tak...");
    }
  };
  return (
    <div className="p-3 flex flex-col border-r border-zinc-700 h-full w-[350px] bg-zinc-900">
      <div className="w-full text-center">Edytuj post</div>
      <form
        className="flex flex-col pt-5 pb-5 gap-5"
        onSubmit={formik.handleSubmit}
      >
        <div className="flex flex-col items-center justify-center w-full">
          <textarea
            id="text"
            name="text"
            className="resize-none h-[100px] bg-zinc-600 rounded-md w-full"
            onChange={formik.handleChange}
            value={formik.values.text}
          />
        </div>
        <div className="w-full flex flex-col gap-5">
          <label className="flex gap-1 text-white">
            <input
              type="radio"
              value="private"
              name="privacy"
              checked={formik.values.privacy === "private"}
              onChange={formik.handleChange}
            />
            Prywatny
          </label>
          <label className="flex gap-1 text-white">
            <input
              type="radio"
              value="public"
              name="privacy"
              checked={formik.values.privacy === "public"}
              onChange={formik.handleChange}
            />
            Publiczny
          </label>
          <label className="flex gap-1 text-white">
            <input
              type="radio"
              value="friends"
              name="privacy"
              checked={formik.values.privacy === "friends"}
              onChange={formik.handleChange}
            />
            Dla znajomych
          </label>
        </div>

        <button
          type="submit"
          className="flex cursor-pointer pt-1 pb-1 pr-4 pl-4 rounded-xl bg-zinc-600 font-bold hover:bg-zinc-700 mx-auto"
        >
          Wyślij
        </button>
      </form>
      <div className="flex justify-center">
        <button
          onClick={handleDelete}
          className="pt-1 pb-1 pr-4 pl-4  rounded-xl bg-red-500 hover:bg-red-600"
        >
          Usuń post
        </button>
      </div>
    </div>
  );
}
