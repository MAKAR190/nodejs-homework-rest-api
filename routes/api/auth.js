const express = require("express");
const User = require("../../model/User");
const jwt = require("jsonwebtoken");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs").promises;
const { auth } = require("../../middlewares");
const gravatar = require("gravatar");
const router = express.Router();
const { multer } = require("../../lib");
const { registerValidation, validateSubscription } = require("../../validator");
const avatarsDir = path.join(__dirname, "../../public/avatars");
router.post("/signup", registerValidation(), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(409).json({ message: "Email in use" });
      return;
    }
    const gravatarUrl = gravatar.url(email);
    const newUser = new User({
      ...req.body,
      avatarUrl: gravatarUrl,
    });
    await newUser.hashPassword();
    await newUser.save();
    const payload = {
      _id: newUser._id,
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET);
    res.status(200).json({
      newUser,
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.post("/login", registerValidation(), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.validatePassword(req.body.password))) {
      res.status(409).json({ message: "Email or password is wrong" });
      return;
    }
    const payload = {
      _id: user._id,
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      user,
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/current", auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.patch(
  "/subscription/:id",
  auth,
  validateSubscription(),
  async (req, res) => {
    try {
      const updatedContact = await User.findByIdAndUpdate(
        req.params.id,
        {
          subscription: req.body.subscription,
        },
        { new: true }
      );
      if (!updatedContact) {
        res.status(404).json({ message: "Not Found" });
        return;
      } else {
        res.status(200).json({ updatedContact: updatedContact });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
router.patch(
  "/avatars/:id",
  auth,
  multer.upload.single("avatar"),
  async (req, res) => {
    try {
      const avatar = await Jimp.read(req.file.path);
      await avatar.cover(250, 250).writeAsync(req.file.path);
      const newPath = path.join(avatarsDir, req.file.filename);
      await fs.rename(req.file.path, newPath);
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          avatarUrl: `${req.file.path}`,
        },
        { new: true }
      );
      if (!user) {
        res.status(404).json({ message: "Not Found..." });
        return;
      }

      res.status(200).json({
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);
module.exports = router;
