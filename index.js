import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { startKeepAlive } from "./config/keepAlive.js";

// Routers
import { userRouter } from "./routes/user.js";
import { routerContacts } from "./routes/Contacts.js";


dotenv.config();
connectDB();
//startKeepAlive();

const app = express();

app.use(
  cors({
    origin:"*",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// REST API routes
app.use("/api/auth", userRouter);
app.use("/api/contacts",routerContacts)

app.get("/", (req, res) => res.send("📡 Classroom API Running Securely & Successfully"));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
