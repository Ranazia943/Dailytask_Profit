import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from the database using the decoded userId
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Attach the full user object to the request
    req.user = user; // Attach the entire user object, not just the userId
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error); // Log the error
    res.status(401).json({ message: "Token is not valid." });
  }
};

export default protect;

