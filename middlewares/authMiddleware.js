import jwt from "jsonwebtoken";

/**
 * ------------------- HTTP Middleware -------------------
 * Protects REST API routes by verifying JWT tokens.
 */
export const protect = (req, res, next) => {
  try {
    // 🔹 Extract token from Authorization header or cookie
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // 🔹 Handle "Bearer <token>" format
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // 🔹 Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * ------------------- SOCKET.IO Middleware -------------------
 * Protects WebSocket connections by verifying JWT tokens.
 */
export const authSocket = (socket, next) => {
  try {
    // 🔹 Extract token from socket handshake (auth or headers)
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization;

    if (!token) {
      console.log("❌ No token provided for socket connection");
      return next(new Error("Authentication error: No token provided"));
    }

    // 🔹 Remove "Bearer " prefix if present
    const actualToken = token.startsWith("Bearer ")
      ? token.split(" ")[1]
      : token;

    // 🔹 Verify JWT
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    socket.user = decoded; // attach user info to socket
    console.log(`✅ Authenticated socket: ${decoded.username || decoded.email}`);
    next();
  } catch (err) {
    console.log("❌ Socket authentication failed:", err.message);
    next(new Error("Authentication error: Invalid or expired token"));
  }
};

/**
 * ------------------- Role-based Access Middleware -------------------
 * Restrict access by user roles
 */

// 🔹 Admin Only
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied: Admins only" });
  }
  next();
};

// 🔹 Teacher Only
export const isTeacher = (req, res, next) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ success: false, message: "Access denied: Teachers only" });
  }
  next();
};

// 🔹 Student Only
export const isStudent = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ success: false, message: "Access denied: Students only" });
  }
  next();
};
