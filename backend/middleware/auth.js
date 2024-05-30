require("dotenv").config();
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token non fourni");
      return res.status(401).json({ message: "Token non fourni" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    const decodedToken = jwt.verify(token, SECRET_KEY);
    console.log("Decoded Token:", decodedToken);

    if (!decodedToken || !decodedToken.userId) {
      console.log("Token invalide");
      return res.status(401).json({ message: "Token invalide" });
    }

    req.auth = {
      userId: decodedToken.userId,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentification échouée" });
  }
};
