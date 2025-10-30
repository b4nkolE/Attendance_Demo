import mongoose from "mongoose";
const { Schema, model } = mongoose;

const EnrollSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minLength: [4, "Name must be more than 4 characters"],
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minLength: [4, "Name must be more than 4 characters"],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: [10, "Email must be more than 10 charcters"],
    match: [/\S+@\S+\.\S+/, "Email is invalid"],
  },
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
    maxLength: [10, "phone number is not 10 digits"],
    match: [/^\+?[1-9]\d{1,14}$/, "Phone Number is invalid"],
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female"],
  },
  learningTrack: {
    type: String,
    enum: [
      "Fullstack Development",
      "Backend Development",
      "Cyber Security",
      "Cloud Computing",
      "Data Analytics",
    ],
    required: true,
  },
}, {timestamps: true});


const Enroll = model("Enroll", EnrollSchema);
export default Enroll;
