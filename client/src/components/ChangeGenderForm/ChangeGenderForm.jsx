import React from "react";
import { toast } from "react-hot-toast";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { useUser } from "../../context/userContext";
import { useKeycloak } from '@react-keycloak/web'
export default function ChangeGenderForm() {
  const { user, setUser } = useUser();
  const { keycloak } = useKeycloak()
  const formik = useFormik({
    initialValues: {
      gender: "",
    },
    validationSchema: Yup.object().shape({
      gender: Yup.string()
        .required("Płeć jest wymagana")
        .oneOf(["male", "female", "other"]),
    }),
    onSubmit: async (values) => {
      try {
        if (values.gender !== user.gender) {
          await axios.put(`${process.env.REACT_APP_API_URL}/profile/update/gender`, {
            gender: values.gender,
            sub: keycloak.tokenParsed.sub
          }, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          });
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/getUserInfoByToken`, { data: keycloak.tokenParsed}, {
              headers: {
                Authorization: `Bearer ${keycloak.token}`
              }
            },
          );
          setUser(response.data.user);
          toast.success("Pomyślnie zmieniono płeć");
        } else {
          throw new Error("Podana płeć jest taka sama");
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
  return (
    <form
      className="flex w-full justify-between items-center"
      onSubmit={formik.handleSubmit}
    >
      <div className="flex gap-10">
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
      <button
        type="submit"
        className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
      >
        Zapisz
      </button>
    </form>
  );
}
