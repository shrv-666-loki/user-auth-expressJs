const { User } = require("../dbSchema/models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getUsers = async (req, res) => {
  try {
    const { startDate, endDate, keyword, pageNo, pageSize } = req.query;
    const pSize = pageSize ?? process.env.DEFAULT_PAGE_SIZE;

    let query = {};

    if (startDate && endDate) {
      query.createdOn = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.createdOn = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdOn = { $lte: new Date(endDate) };
    }

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { userEmail: { $regex: keyword, $options: "i" } },
      ];
    }

    let users = [];
    if (pageNo) {
      const skip = (pageNo - 1) * pSize;
      users = await User.find(query).skip(skip).limit(pSize);
    } else {
      users = await User.find(query);
    }

    const totalUsers = await User.countDocuments(query);

    return res.status(200).json({
      users,
      totalUsers,
      currentPage: pageNo,
      totalPages: Math.ceil(totalUsers / pSize),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { userEmail } = req.query;

    const user = await User.find({
      userEmail: userEmail,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching User:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, age, DOB, userEmail, password, role } = req.body;

    const existingUser = await User.findOne({ userEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      age,
      DOB,
      userEmail,
      password: hashedPassword,
      role,
      createdOn: new Date(),
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    if (!req.user.userEmail === userEmail) {
      return res.status(403).json("Unauthorized to update user");
    }
    const updatedUserData = req.body;

    const existingUser = await User.findById(userEmail);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userEmail,
      updatedUserData,
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userEmail = req.params.userEmail;

    const deletedUser = await User.deleteOne({ userEmail: userEmail });

    if (deletedUser.deletedCount === 1) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { userEmail, password } = req.body;

    const user = await User.findOne({ userEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(403).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userEmail: user.userEmail },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Internal Server Error");
  }
};
