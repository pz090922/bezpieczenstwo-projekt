const mongoose = require("mongoose");
const yup = require("yup");

const UserSchema = new mongoose.Schema(
  {
    sub: {
      type: String,
      unique: true,
      required: [true, "sid nie moze byc puste"]
    },
    username: {
      type: String,
      required: [true, "Pole nie może być puste!"],
      unique: true,
      minLength: [5, "Login musi mieć conajmniej 5 znaków"],
      maxLength: [20, "Login nie może mieć więcej niż 20 znaków"],
      text: true,
      validate: {
        validator: function (value) {
          return /^[^\s]+$/.test(value);
        },
        message: () => `Login nie może zawierać znaków białych!`,
      },
    },
    firstName: {
      type: String,
      required: [true, "Pole nie może być puste!"],
      validate: {
        validator: function (value) {
          return /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(value);
        },
        message: () => `Imię musi składać się z samych liter!`,
      },
      text: true,
    },
    lastName: {
      type: String,
      required: [true, "Pole nie może być puste!"],
      validate: {
        validator: function (value) {
          return /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(value);
        },
        message: () => `Nazwisko musi składać się z samych liter!`,
      },
    },
    email: {
      type: String,
      required: [true, "Pole nie może być puste!"],
      validate: {
        validator: async function (value) {
          const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          return emailRegex.test(value);
        },
        message: () => "Email jest niepoprawny",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      trim: true,
    },
    imagePath: {
      type: String,
      default: "",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { collection: "users" }
);

UserSchema.pre("deleteOne", async function (next) {
  try {
    const user = this.getQuery();
    await mongoose.model("User").updateMany({ $pull: { followers: user._id } });
    await mongoose.model("User").updateMany({ $pull: { following: user._id } });
    await mongoose.model("Comment").deleteMany({ owner: user._id });
    await mongoose
      .model("Post")
      .updateMany({ $pull: { comments: { owner: user._id } } });
    await mongoose.model("Post").updateMany({ $pull: { likes: user._id } });
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
