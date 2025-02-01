import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc    Authenticate the User & GET Token
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  } catch (error) {
    res.status(500).json({ error });
    throw new Error("Login failed: " + error);
  }
});

/**
 * @desc    Register a New User
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User Already Exists");
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      generateToken(res, user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(400);
      throw new Error("Invalid User Data");
    }
  } catch (error) {
    res.status(500).json({ error });
    throw new Error("Registration failed: " + error);
  }
});

/**
 * @desc    Logout User & Clear Cookie
 * @route   POST /api/users/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    res.status(500).json({ error });
    throw new Error("Logout failed: " + error);
  }
});

/**
 * @desc    GET User Profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error("User Not Found");
    }
  } catch (error) {
    res.status(500).json({ error });
    throw new Error("Error fetching user profile: " + error);
  }
});

/**
 * @desc    Update User Profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Check and update fields directly
      if (req.body.name && req.body.name !== user.name) {
        user.name = req.body.name; // Update name
      }
      if (req.body.email && req.body.email !== user.email) {
        user.email = req.body.email; // Update email
      }
      if (req.body.password) {
        user.password = req.body.password; // Update password
      }

      // Only save if there are changes
      if (req.body.name || req.body.email || req.body.password) {
        const updatedUser = await user.save();
        res.status(200).json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
        });
      } else {
        res.status(200).json({ message: "No changes made" });
      }
    } else {
      res.status(404);
      throw new Error("User Not Found");
    }
  } catch (error) {
    res.status(500).json({ error });
    throw new Error("Error updating user profile: " + error);
  }
});

/**
 * @desc    GET All Users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
    throw new Error("Error fetching users" + error);
  }
});

/**
 * @desc    GET Users By ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserByID = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
      return res.status(200).json(user);
    } else {
      res.status(404);
      throw new Error("Resource Not Found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
    throw new Error("Error fetching user" + error);
  }
});

/**
 * @desc    Delete User
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.isAdmin) {
        res.status(400).json({ message: "Cannot delete admin user" });
        throw new Error("Cannot delete admin user");
      }
      await User.deleteOne({ _id: user._id });
      res.status(200).json({
        message: "User deleted successfully",
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
    console.log(error);
    throw new Error("Error deleting user" + error);
  }
});

/**
 * @desc    Update User
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);

      const updatedUser = await user.save();
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(500).status(error);
    console.log(error);
    throw new Error(error);
  }
});

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserByID,
  deleteUser,
  updateUser,
};
