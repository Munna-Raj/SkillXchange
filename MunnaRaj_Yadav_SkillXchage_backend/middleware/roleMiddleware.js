const isMentor = (req, res, next) => {
  if (req.user && req.user.role === "mentor") {
    next();
  } else {
    res.status(403).json({ msg: "Access denied. Only mentors can perform this action." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Access denied. Only admins can perform this action." });
  }
};

module.exports = { isMentor, isAdmin };
