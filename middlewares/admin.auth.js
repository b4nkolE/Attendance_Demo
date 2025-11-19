import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = await req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
    const verified = jwt.verify(token, JWT_SECRET);
    req.auth = verified;
    next(); 
  } catch (error) {
    return res.status(400).json({message: "Invalid token" })
  }
};
