const { verify } = require("jsonwebtoken");
const { User } = require("../dbSchema/models");

exports.isValidUser = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send("Token not found");
  }
  try {
    token = token.split(" ")[1];
    const decode = verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({
      userEmail: decode["userEmail"],
    });
    req.user = user;
    next();
  } catch (error) {
    res.status(403).send("Invalid token/Unauthorize access");
  }
};
