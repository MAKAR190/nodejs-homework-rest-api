const express = require("express");
const User = require("../../model/User");
const jwt = require("jsonwebtoken");
const { auth } = require("../../middlewares");
const router = express.Router();
const { registerValidation, validateSubscription } = require("../../validator");
router.post("/signup", registerValidation(), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(409).json({ message: "Email in use" });
    }
    const newUser = new User(req.body);
    await newUser.hashPassword();
    newUser.save();
    const payload = {
      _id: newUser._id,
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET);
    res.status(201).json({
      ...newUser,
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
    const data = await User.findOne({ email });
    if (!data || !(await data.validatePassword(req.body.password))) {
      res.status(409).json({ message: "Email or password is wrong" });
      return;
    }
    const payload = {
      _id: data._id,
    };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      user: { ...data },
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
router.patch("/subscription/:id", validateSubscription(), async (req, res) => {
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
    } else {
      res.status(200).json({ updatedContact: updatedContact });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
