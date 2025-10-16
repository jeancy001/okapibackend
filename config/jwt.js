import jwt from "jsonwebtoken";

export const SECRET_KEY = "supersecretkey123"; // Use process.env in production

export const generateToken = (user) => {
  return jwt.sign(user, SECRET_KEY, { expiresIn: "2h" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};
