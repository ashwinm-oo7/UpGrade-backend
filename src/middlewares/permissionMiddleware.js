export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    if (req.user.role === "admin") {
      return next(); // super admin bypass
    }

    if (!req.user.permissions?.[permission]) {
      return res.status(403).json({
        msg: `Permission denied: ${permission}`,
      });
    }

    next();
  };
};
