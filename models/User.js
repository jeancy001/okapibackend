import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  resetCode: { type: String },
  resetCodeExpires: { type: String },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
    refreshToken: { type: String }, 

},{timestamps:true});

export default mongoose.model("User", userSchema);
