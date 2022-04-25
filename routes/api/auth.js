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
const {
  registerValidation,
  validateSubscription,
  emailValidation,
} = require("../../validator");
const avatarsDir = path.join(__dirname, "../../public/avatars");
const { v4: uuidv4 } = require("uuid");
const sgMail = require("@sendgrid/mail");
router.post("/signup", registerValidation(), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(409).json({ message: "Email in use" });
      return;
    }
    const vToken = uuidv4();
    const gravatarUrl = gravatar.url(email);
    const newUser = new User({
      ...req.body,
      avatarUrl: gravatarUrl,
      verificationToken: vToken,
    });
    await newUser.hashPassword();
    await newUser.save();
    const msg = {
      to: newUser.email,
      from: "lutskyimakar@gmail.com",
      subject: "Contacts email verification",
      html: `<a target="_blank" rel="noopener" href="http://localhost:8000/api/users/verify/${newUser.verificationToken}">Verify</a>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error.response.body.errors);
      });
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
    if (!user.verify) {
      res.status(400).json({ message: "Email is not verified!" });
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
          avatarUrl: `${req.file.filename}`,
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
router.get("/verify/:verificationToken", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      verificationToken: req.params.verificationToken,
    });
    if (!existingUser) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    existingUser.verificationToken = null;
    existingUser.verify = true;
    await existingUser.save();
    res.status(200).json({ message: "Verification successfull!" });
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/verify", emailValidation(), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (user.verify) {
      res.status(400).json({ message: "Verification has already been passed" });
    }
    const msg = {
      to: user.email,
      from: "lutskyimakar@gmail.com",
      subject: "Contacts email verification",
      html: `<a target="_blank" rel="noopener" href="http://localhost:8000/api/users/verify/${user.verificationToken}">Verify</a>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error.response.body.errors);
      });
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
