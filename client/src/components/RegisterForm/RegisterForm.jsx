import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
export default function RegisterForm() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
    },
    validationSchema: Yup.object().shape({
      username: Yup.string()
        .min(5, "Nazwa użytkownika musi mieć conajmniej 5 znaków")
        .max(20, "Nazwa użytkownika nie moze miec wiecej niż 20 znaków")
        .required("Pole nie moze byc puste!"),
      password: Yup.string()
        .min(8, "Haslo musi mieć conajmniej 8 znaków")
        .required("Pole nie może być puste!"),
      confirmPassword: Yup.string()
        .required("Pole nie moze byc puste!")
        .oneOf([Yup.ref("password"), null], "Hasło musi być takie same!"),
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
      email: Yup.string()
        .email("Podany email nie jest poprawny!")
        .required("Pole nie może być puste"),
      gender: Yup.string().required("Musisz wybrać płeć"),
    }),
    onSubmit: async (values) => {
      console.log(`${process.env.REACT_APP_API_URL}/register`)
      const { username, password, firstName, lastName, email, gender } = values;
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/register`, {
          username: username,
          password: password,
          firstName: firstName,
          lastName: lastName,
          email: email,
          gender: gender,
        });
        toast.success("Pomyślnie zarejestrowano");
        navigate("/");
      } catch (error) {
        if (error.response?.status === 500) {
          toast.error("Coś poszło nie tak");
        } else {
          toast.error(error.response.data.error);
        }
      }
    },
  });

  return (
    <form
      className="flex flex-col items-center w-full"
      onSubmit={formik.handleSubmit}
    >
      <input
        aria-label="Podaj nazwę użytkownika"
        type="text"
        placeholder="Podaj nazwę użytkownika"
        className="text-sm text-gray-base w-full py-5 px-4 h-2 border border-gray-primary rounded mb-2"
        {...formik.getFieldProps("username")}
      />
      {formik.touched.username && formik.errors.username ? (
        <p className="text-sm text-gray-400 mb-2">{formik.errors.username}</p>
      ) : null}
      <div className="flex gap-1">
        <input
          aria-label="Podaj swoje imię"
          type="text"
          placeholder="Podaj imię"
          className="text-sm text-gray-base w-full py-5 px-4 h-2 border border-gray-primary rounded mb-2"
          {...formik.getFieldProps("firstName")}
        />
        <input
          aria-label="Podaj swoje nazwisko"
          type="text"
          placeholder="Podaj nazwisko"
          className="text-sm text-gray-base w-full py-5 px-4 h-2 border border-gray-primary rounded mb-2"
          {...formik.getFieldProps("lastName")}
        />
      </div>
      {formik.touched.firstName && formik.errors.firstName ? (
        <p className="text-sm text-gray-400 mb-2">{formik.errors.firstName}</p>
      ) : formik.touched.lastName && formik.errors.lastName ? (
        <p className="text-sm text-gray-400 mb-2">{formik.errors.lastName}</p>
      ) : null}
      <input
        aria-label="Podaj swój email"
        type="text"
        placeholder="Podaj e-mail"
        className="text-sm text-gray-base w-full py-5 px-4 h-2 border border-gray-primary rounded mb-2"
        {...formik.getFieldProps("email")}
      />
      {formik.touched.email && formik.errors.email ? (
        <p className="text-sm text-gray-400 mb-2">{formik.errors.email}</p>
      ) : null}
      <div className="flex justify-between w-full mb-2">
        <label className="flex gap-1 text-white">
          <input
            type="radio"
            value="male"
            name="gender"
            checked={formik.values.gender === "male"}
            onChange={formik.handleChange}
          />
          Mężczyzna
        </label>
        <label className="flex gap-1 text-white">
          <input
            type="radio"
            value="female"
            name="gender"
            checked={formik.values.gender === "female"}
            onChange={formik.handleChange}
          />
          Kobieta
        </label>
        <label className="flex gap-1 text-white">
          <input
            type="radio"
            value="other"
            name="gender"
            checked={formik.values.gender === "other"}
            onChange={formik.handleChange}
          />
          Inne
        </label>
      </div>
      <input
        aria-label="Podaj swoje hasło"
        type="password"
        placeholder="Hasło"
        className="text-sm text-gray-base w-full py-5 px-4 h-2 border border-gray-primary rounded mb-2"
        {...formik.getFieldProps("password")}
      />

      {formik.touched.password && formik.errors.password ? (
        <p className="text-sm text-gray-400 mb-2">{formik.errors.password}</p>
      ) : null}
      <input
        aria-label="Potwierdź swoje hasło"
        type="password"
        placeholder="Potwierdź hasło"
        className="text-sm text-gray-base w-full py-5 px-4 h-2 border border-gray-primary rounded mb-2"
        {...formik.getFieldProps("confirmPassword")}
      />
      {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
        <p className="text-sm text-gray-400 mb-2">
          {formik.errors.confirmPassword}
        </p>
      ) : null}
      <button
        type="submit"
        className="bg-zinc-800 text-white w-1/2 rounded h-8 font-bold hover:bg-zinc-700"
      >
        Zarejestruj
      </button>
    </form>
  );
}
