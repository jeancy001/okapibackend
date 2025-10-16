import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    languagePair: {
      type: String,
      enum: [
        "English-French",
        "English-Tshiluba",
        "English-Lingala",
        "English-Kikongo",
        "English-Swahili",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
