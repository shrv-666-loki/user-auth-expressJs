exports.isAdmin = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "admin" &&
    req.user.userEmail === process.env.ADMIN_EMAIL
  ) {
    next();
  } else return res.status(403).json({ error: "Admin access required" });
};
