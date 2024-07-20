/** @format */

const router = require("express").Router();
const passport = require("passport");
const crypto = require("crypto");
const User = require("../models/User");
router.get("/login/google", passport.authenticate("google"));
router.get("/discord", passport.authenticate("discord"));

router.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/home");
  }
);

router.get(
  "/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/home");
  }
);


router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });

});

module.exports = router;
