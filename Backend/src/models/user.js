const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      index:true,
      minLength: [4, "First name must be at least 4 characters"],
      maxLength: [50, "First name cannot exceed 50 characters"],
      validate(value) {
        if (!validator.isAlpha(value.replace(/\s/g, ""))) {
          throw new Error(
            "First name should contain only letters"
          );
        }
      },
    },

    lastName: {
      type: String,
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"],
      validate(value) {
        if (
          value &&
          !validator.isAlpha(value.replace(/\s/g, ""))
        ) {
          throw new Error(
            "Last name should contain only letters"
          );
        }
      },
    },

    emailId: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(
            "Invalid email address: " + value
          );
        }
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must contain uppercase, lowercase, number, and symbol"
          );
        }
      },
    },

    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [100, "Age cannot exceed 100"],
      validate(value) {
        if (!Number.isInteger(value)) {
          throw new Error("Age must be an integer");
        }
      },
    },

    gender: {
      type: String,
      lowercase: true,
      trim: true,
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not a valid gender",
      },
    },

    photoUrl: {
      type: String,
      default:
        "https://geographyandyou.com/images/user-profile.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error(
            "Invalid photo URL: " + value
          );
        }
      },
    },

    about: {
      type: String,
      trim: true,
      default: "This is a default about of the user!",
      maxLength: [300, "About section too long"],
    },

    // Make sure your schema has EXACTLY these names
resetPasswordToken:  String,
resetPasswordExpiry: Date,
    skills: {
      type: [String],

      validate(value) {
        if (value.length > 10) {
          throw new Error(
            "You can add maximum 10 skills"
          );
        }

        const hasDuplicates =
          new Set(value).size !== value.length;

        if (hasDuplicates) {
          throw new Error(
            "Duplicate skills are not allowed"
          );
        }

        const invalidSkill = value.some(
          (skill) => skill.trim().length < 2
        );

        if (invalidSkill) {
          throw new Error(
            "Each skill must have at least 2 characters"
          );
        }
      },
    },
  },

  {
    timestamps: true,
  }
);

userSchema.index({firstName:1, lastName:1});

userSchema.methods.getJWT = async function (){
  const user = this;
     const token = jwt.sign(
        { _id: user._id},
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser){
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser, passwordHash
  );

  return isPasswordValid
}
module.exports = mongoose.model("User", userSchema);