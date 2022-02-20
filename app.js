const express = require('express');
const volleyball = require('volleyball');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const { contacts, auth } = require('./routes/api');
const User = require('./model/User');
const path = require('path');
require('dotenv').config();
const app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('Database connection successful'))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
passport.use(
  new Strategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload._id);
        if (!user) {
          done(new Error('User not found'));
          return;
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);
app.use(volleyball);
app.use(cors());
app.use(express.json());

app.use('/api/contacts', contacts);
app.use('/api/users', auth);
app.use(express.static(path.join(__dirname, './public')));
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
