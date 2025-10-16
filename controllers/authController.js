
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // short-lived token
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// Send email utility
const sendEmail = async (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Okapi Academia" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text,
  });
};

// ------------------- REGISTER -------------------
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword  = bcrypt.hashSync(password, 10)
    if(!hashedPassword)return res.status(400).json({message:"Invalids  Password "})

    const user = await User.create({ username, email, password:hashedPassword, role });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Send token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, username: user.username, role: user.role,},
      token:token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- LOGIN -------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compareSync(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, role: user.role },
      token:token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- LOGOUT -------------------
export const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET PROFILE -------------------
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -refreshToken");
  res.json(user);
};

// ------------------- REFRESH TOKEN -------------------
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- FORGOT PASSWORD -------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetCode = crypto.randomInt(100000, 999999).toString();
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    await sendEmail(email, "Password Reset Code", `Your code: ${resetCode}`);

    res.json({ message: "Reset code sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- RESET PASSWORD -------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    const user = await User.findOne({ email, resetCode });
    if (!user) return res.status(400).json({ message: "Invalid code" });

    if (Date.now() > user.resetCodeExpires)
      return res.status(400).json({ message: "Code expired" });

    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
