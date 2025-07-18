import userModel from "../Model/User.model.js";
import catchAsyncError from "../Middleware/CatchAsyncError.js";
import jwt from "jsonwebtoken";
import sendmail from "../Utils/sendMail.js";
import { sendTokens } from "../Utils/jwt.js";
import ArtistModel from "../Model/Artist.model.js";
import { redis } from "../Utils/redis.js";
import * as userService from "../Service/user.service.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// register a new user => /api/v1/register
export const registerUser = catchAsyncError(async (req, res) => {
  const { name, email, password } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (isEmailExist) {
    return res.status(400).json({ message: "Email already exists" });
  }
  const user = { name, email, password };
  const activationToken = createActivationToken(user);
  const activationCode = activationToken.activationCode;
  console.log(activationCode)
  console.log(activationToken.token)
  const data = {
    user: { name: user.name },
    activationCode,
  };
  try {
    await sendmail({
      email: user.email,
      subject: "Account Activation Link",
      template: "activation-mail.ejs",
      data,
    });
    res.status(200).json({
      message: "Account activation code sent to your email",
      activationToken: activationToken.token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET,
    { expiresIn: "10m" }
  );
  return { activationCode, token };
};

export const activaUserAccount = catchAsyncError(async (req, res) => {
  const { activationToken, activationCode } = req.body;
  if (!activationToken || !activationCode) {
    return res.status(400).json({ message: "Please provide activation code" });
  }
  let newUser;
  try {
    newUser = jwt.verify(activationToken, process.env.ACTIVATION_SECRET);
  } catch (error) {
    return res.status(400).json({ message: "Invalid token or token expired" });
  }
  if (newUser.activationCode !== activationCode) {
    return res.status(400).json({ message: "Invalid activation code" });
  }
  const { name, email, password } = newUser.user;
  const existsUser = await userModel.findOne({ email });
  if (existsUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  await userModel.create({ name, email, password });
  return res.status(201).json({
    message: "Account activated successfully",
    success: true,
  });
});

// login user => /api/v1/login

export const loginUser = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  console.log(user)

  sendTokens(user, 200, res);
});

// logout user => /api/v1/logout
export const logoutUser = catchAsyncError(async (req, res) => {
  const userId = req.user._id;
  if (userId) {
    await redis.del(userId.toString());
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully" });
});

export const updateProfile = catchAsyncError(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(400).json({ message: "User not found" });
  }
  console.log(req.body);

  const { name, password, avatar, bio, genres, socialLinks } = req.body;

  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (name) user.name = name;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (avatar) {
    if (user.avatar.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }
    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatar",
      width: 150,
      crop: "scale",
    });
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  await user.save();

  let combinedData = { ...user.toObject() };

  if (user.role === "artist") {
    const artist = await ArtistModel.findOne({ userId });
    if (!artist) {
      return res.status(400).json({ message: "Artist not found" });
    }
    if (bio) artist.bio = bio;
    if (genres) artist.genres = genres;
    if (socialLinks) artist.socialLinks = socialLinks;
    await artist.save();
    combinedData = { ...combinedData, artist };
  }
  await redis.set(userId, JSON.stringify(combinedData));
  return res.status(200).json({ success: true, user: combinedData });
});

export const getUserProfile = catchAsyncError(async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "User not found" });
  }
  const userId = req.user._id;
  const userData = await userService.getUserProfile(userId);
  return res.status(200).json({ success: true, user: userData });
});

export const followUnfollowArtist = catchAsyncError(async (req, res) => {
  const userId = req.user._id;
  const { artistId } = req.body;
  if (!userId || !artistId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (!mongoose.Types.ObjectId.isValid(artistId)) {
    return res.status(400).json({ message: "Invalid artist ID" });
  }

  const user = await userModel.findById(userId);

  if (!user.followingArtists.includes(artistId)) {
    user.followingArtists.push(artistId);
  } else {
    user.followingArtists.pull(artistId);
  }

  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Follow/Unfollow successful" });
});

export const getAllFollowing = catchAsyncError(async (req, res) => {
  const userId = req.user._id;
  const user = await userModel.findById(userId)
  if (!user) {
    return res.status(404).json({ message: 'User not found' });

  }
  return res.status(200).json({ success: true, followingArtists: user.followingArtists });
});
