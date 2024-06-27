import React from "react";
import { toast } from "react-hot-toast";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
export default function ChangePasswordForm() {
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object().shape({
      password: Yup.string()
        .min(8, "Hasło musi mieć conajmniej 8 znaków")
        .required("Pole nie może być puste!"),
      confirmPassword: Yup.string()
        .required("Pole nie może być puste!")
        .oneOf([Yup.ref("password"), null], "Hasło musi być takie same!"),
    }),
    onSubmit: async (values) => {
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/profile/update/password`, {
          // token,
          password: values.password,
        });
        toast.success("Pomyślnie zmieniono hasło");
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.error);
          return;
        }
        toast.error(error.message);
      }
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex w-full items-center justify-between"
    >
      <div className="flex flex-col gap-3 w-3/4">
        <div className="flex gap-3 w-full">
          <input
            aria-label="Podaj nowe hasło"
            type="password"
            placeholder="Podaj hasło"
            className="text-sm text-gray-base bg-zinc-900 w-72 py-5 px-4 h-2 rounded-xl"
            {...formik.getFieldProps("password")}
          />
          {formik.touched.password && formik.errors.password ? (
            <p className="text-sm text-gray-400 text-pretty w-36">
              {formik.errors.password}
            </p>
          ) : null}
        </div>
        <div className="flex gap-3 w-full">
          <input
            aria-label="Potwierdź hasło"
            type="password"
            placeholder="Potwierdź hasło"
            className="text-sm text-gray-base bg-zinc-900 w-72 py-5 px-4 h-2 rounded-xl"
            {...formik.getFieldProps("confirmPassword")}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
            <p className="text-sm text-gray-400 text-pretty w-36">
              {formik.errors.confirmPassword}
            </p>
          ) : null}
        </div>
      </div>
      <button
        type="submit"
        className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
      >
        Zmień hasło
      </button>
    </form>
  );
}
