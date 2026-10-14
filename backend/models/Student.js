const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required."],
      trim: true,
      minlength: [2, "Student name must contain at least 2 characters."],
      maxlength: [100, "Student name cannot exceed 100 characters."],
    },
    course: {
      type: String,
      required: [true, "Course is required."],
      trim: true,
      maxlength: [100, "Course cannot exceed 100 characters."],
    },
    year: {
      type: Number,
      required: [true, "Year is required."],
      min: [1, "Year must be at least 1."],
      max: [10, "Year cannot exceed 10."],
      validate: {
        validator: Number.isInteger,
        message: "Year must be a whole number.",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
