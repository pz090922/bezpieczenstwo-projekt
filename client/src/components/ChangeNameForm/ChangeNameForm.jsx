import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { useUser } from "../../context/userContext";
export default function ChangeNameForm() {
  const { user, setUser } = useUser();
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
  });
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string()
        .required("Pole nie może być puste")
        .matches(
          /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/,
          "Imię musi zawierać tylko litery!"
        ),
      lastName: Yup.string()
        .required("Pole nie może być puste")
        .matches(
          /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/,
          "Nazwisko musi zawierać tylko litery!"
        ),
    }),
    onSubmit: async (values) => {
      try {
        if (
          user.firstName !== data.firstName ||
          user.lastName !== data.lastName
        ) {
          await axios.put(`${process.env.REACT_APP_API_URL}/profile/update/name`, {
            // token,
            firstName: values.firstName,
            lastName: values.lastName,
          });
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/getUserInfoByToken`,
            // { token }
          );
          setUser(response.data.user);
          toast.success("Pomyślnie zmieniono dane");
        } else {
          throw new Error("Zmiana danych niepowiodła się");
        }
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.error);
          return;
        }
        toast.error(error.message);
      }
    },
  });

  useEffect(() => {
    setData({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }, [user]);

  useEffect(() => {
    formik.values.firstName = data.firstName;
    formik.values.lastName = data.lastName;
  }, [data, formik.values]);

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex w-full items-center justify-between"
    >
      <div className="flex flex-col gap-3 w-3/4">
        <div className="flex gap-3 w-full">
          <input
            aria-label="Podaj nowe imię"
            type="text"
            placeholder="Podaj imię"
            value={data.firstName}
            className="text-sm text-gray-base bg-zinc-900 w-72 py-5 px-4 h-2 rounded-xl"
            name="firstName"
            id="firstName"
            onChange={(e) => {
              setData({
                ...data,
                firstName: e.target.value,
              });
              formik.handleChange(e);
            }}
          />
          {formik.touched.firstName && formik.errors.firstName ? (
            <p className="text-sm text-gray-400 text-pretty w-36">
              {formik.errors.firstName}
            </p>
          ) : null}
        </div>
        <div className="flex gap-3 w-full">
          <input
            aria-label="Podaj nazwisko"
            type="text"
            placeholder="Podaj nazwisko"
            value={data.lastName}
            className="text-sm text-gray-base bg-zinc-900 w-72 py-5 px-4 h-2 rounded-xl"
            name="lastName"
            id="lastName"
            onChange={(e) => {
              setData({
                ...data,
                lastName: e.target.value,
              });
              formik.handleChange(e);
            }}
          />
          {formik.touched.lastName && formik.errors.lastName ? (
            <p className="text-sm text-gray-400 text-pretty w-36">
              {formik.errors.lastName}
            </p>
          ) : null}
        </div>
      </div>
      <button
        type="submit"
        className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
      >
        Zmień dane
      </button>
    </form>
  );
}
