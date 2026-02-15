const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.user) {
      req.user = decoded.user;
    } else if (decoded.id) {
      req.user = { id: decoded.id };
    } else {
      console.error("Invalid token structure:", decoded);
      return res.status(401).json({ msg: "Token structure invalid" });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
