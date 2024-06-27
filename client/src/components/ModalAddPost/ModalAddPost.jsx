import React, { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useKeycloak } from '@react-keycloak/web'
export default function ModalAddPost({ isVisible, onClose, setReload }) {
  const { keycloak } = useKeycloak()
  const formik = useFormik({
    initialValues: {
      photo: null,
      text: "",
      privacy: "",
    },
    validationSchema: Yup.object().shape({
      photo: Yup.mixed().required("Zdjęcie jest wymagane"),
      text: Yup.string().max(200, "Tekst nie może być dłuższy niż 200 znaków"),
      privacy: Yup.string()
        .required("Rodzaj widoczności posta jest wymagany")
        .oneOf(["private", "public", "friends"]),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("sub", keycloak.tokenParsed.sub);
        formData.append("file", values.photo);
        formData.append("text", values.text);
        formData.append("privacy", values.privacy);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/post`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${keycloak.token}` },
          }
        );
        onClose();
        setReload();
        formik.setFieldValue("text", "");
        formik.setFieldValue("privacy", "");
        formik.setFieldValue("photo", null);
        setPreviewImage(null);
        toast.success(response.data.message);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 500) {
          toast.error("Coś poszło nie tak");
        } else {
          toast.error(error.response?.data?.error);
        }
      }
    },
  });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    if (event.currentTarget.files[0]) {
      formik.setFieldValue("photo", event.currentTarget.files[0]);
      setPreviewImage(URL.createObjectURL(event.currentTarget.files[0]));
    }
  };

  if (!isVisible) return null;
  return (
    <div className="fixed text-white inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center">
      <div className="flex flex-col w-[400px] bg-zinc-800 rounded-2xl p-4">
        <div className="flex justify-between items-center font-bold border-b border-zinc-600 pb-3">
          <div></div>
          <p>Utwórz nowy post</p>
          <button
            className="text-white font-bold place-self-end"
            onClick={() => {
              onClose();
              formik.setFieldValue("text", "");
              formik.setFieldValue("privacy", "");
              formik.setFieldValue("photo", null);
              setPreviewImage(null);
            }}
          >
            X
          </button>
        </div>
        <form
          className="flex flex-col pt-5 pb-5 gap-5"
          onSubmit={formik.handleSubmit}
        >
          <div className="flex justify-center w-full">
            <input
              type="file"
              id="selectedFile"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <input
              type="button"
              value="Wybierz zdjęcie"
              onClick={handleButtonClick}
              className="flex cursor-pointer pt-1 pb-1 pr-4 pl-4 rounded-xl bg-zinc-600 font-bold hover:bg-zinc-700"
            />
          </div>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-2 w-full max-h-80 object-contain rounded-md"
            />
          )}
          <div className="flex flex-col items-center justify-center w-full">
            <textarea
              id="text"
              name="text"
              onChange={formik.handleChange}
              value={formik.values.text}
              className="resize-none h-[100px] bg-zinc-600 rounded-md w-full"
            />
            {formik.errors.text ? <p>{formik.errors.text}</p> : null}
          </div>
          <div className="w-full flex justify-between">
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
          {formik.errors.privacy ? (
            <p className="text-zinc-500 text-center">{formik.errors.privacy}</p>
          ) : null}
          <button
            type="submit"
            className="flex cursor-pointer pt-1 pb-1 pr-4 pl-4 rounded-xl bg-zinc-600 font-bold hover:bg-zinc-700 mx-auto"
          >
            Wyślij
          </button>
        </form>
      </div>
    </div>
  );
}
