const connectDB = require('./db');
const User = require('./User');
require('dotenv').config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

connectDB();

const express = require('express');

const app = express();

// app.get('/', (req, res) => res.send('API Running'));
app.get('/', (req, res) => res.sendFile('auth.html', { root: __dirname }));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.send('You have successfully logged in'));
app.get('/error', (req, res) => res.send('error logging in'));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
/*  Google AUTH  */

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile.displayName, profile.emails[0].value, profile.id);
      //check user table for anyone with a facebook ID of profile.id
      User.findOne(
        {
          'google.id': profile.id,
        },
        function(err, user) {
          if (err) {
            res.send('Exists');
          }
          //No user was found... so create a new user with values from Facebook (all the profile. stuff)
          if (!user) {
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              username: profile.username,
              provider: 'google',
              //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
              google: profile._json,
            });
            user.save(function(err) {
              if (err) console.log(err);
              res.send('User exist')
            });
          } else {
            //found user. Return
            res.send('Success');
          }
        },
      );
    },
  ),
);

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  },
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
