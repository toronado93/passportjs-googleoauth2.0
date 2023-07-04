const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

// We gonna create protected link

app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());

// Authorized

const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/google/responde",
    },
    // This area represent what will be happen after succesfuly authentication connection
    function (accessToken, refreshToken, profile, done) {
      // If you wantto connect other google services such as calendar vs vs we nee to use
      // token as well
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  res.send('<a href="/google">Authenticate with Google</a>');
});

app.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/responde",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/",
  })
);

app.get("/protected", isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    err ? console.log(err) : res.redirect("/");
  });
  //   req.session.destroy();
  //   res.send("Goodbye!");
});

app.listen(port, () => {
  console.log("Port: " + port + " up and running in success...");
});
