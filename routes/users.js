const express = require("express");
const userController = require("../controllers/users");
const { isAdmin } = require("../middlewares/adminMiddleware");
const { isValidUser } = require("../middlewares/userMiddleware");

const router = express.Router();

// exposed for admin only
router.get("/api/users", isValidUser, isAdmin, userController.getUsers);

// exposed for admin only
router.get(
  "/api/users/findUser/:userEmail",
  isValidUser,
  isAdmin,
  userController.getUser
);

//access with valid token
router.put("/api/users/:userEmail", isValidUser, userController.updateUser);

// exposed for admin only
router.delete(
  "/api/users/:userEmail",
  isValidUser,
  isAdmin,
  userController.deleteUser
);

// public access
router.post("/api/user/register", userController.createUser);

// public access
router.post("/api/user/login", userController.userLogin);

module.exports = router;
