require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_management";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Student Management API is running." });
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    console.error("Error retrieving students:", error.message);
    res.status(500).json({ success: false, message: "Could not retrieve students." });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { name, course, year, email } = req.body;
    const student = await Student.create({
      name: typeof name === "string" ? name.trim() : name,
      course: typeof course === "string" ? course.trim() : course,
      year,
      email: typeof email === "string" ? email.trim().toLowerCase() : email,
    });
    res.status(201).json({
      success: true,
      message: "Student added successfully.",
      data: student,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message || "Please provide valid student information.",
      });
    }
    console.error("Error adding student:", error.message);
    res.status(500).json({ success: false, message: "Could not add student." });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, course, year, email } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: typeof name === "string" ? name.trim() : name,
        course: typeof course === "string" ? course.trim() : course,
        year,
        email: typeof email === "string" ? email.trim().toLowerCase() : email,
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.json({
      success: true,
      message: "Student updated successfully.",
      data: updatedStudent,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.name === "CastError" ? "Invalid student ID." : error.message,
      });
    }
    console.error("Error updating student:", error.message);
    res.status(500).json({ success: false, message: "Could not update student." });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.json({
      success: true,
      message: "Student deleted successfully.",
      data: deletedStudent,
    });
  } catch (error) {
    console.error("Error deleting student:", error.message);
    res.status(500).json({ success: false, message: "Could not delete student." });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
      console.log(`Student Management API running at http://localhost:${PORT}`);
      console.log(`Allowed frontend origin: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Check that MongoDB is running and MONGODB_URI in backend/.env is correct.");
    process.exit(1);
  }
}

startServer();
