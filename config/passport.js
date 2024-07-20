/** @format */

const DiscordStrategy = require("passport-discord").Strategy;
const crypto = require("crypto");
const User = require("../models/User");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(function verify(username, password, done) {
      const userData = User.findOne({ payroll: username });
      if (!userData) {
        done("Invalid username or password");
      }
      var salt = userData.salt;
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (err) {
            console.log(err);
          }
          User.findOne({
            payroll: username,
            hashed_password: hashedPassword,
          }).then((member, err) => {
            if (err) {
              res.status(401).send("Invalid username or password");
            }
            var user = {
              id: member._id,
              username: username,
            };
            req.login(user, function (err) {
              if (err) {
                console.log(err);
              }
              res.redirect("/home");
            });
          });
        }
      );
    })
  );
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.google_client_id,
        clientSecret: process.env.google_client_secret,
        callbackURL: process.env.CALLBACK_URL,
        scope: ["profile", "email"],
        state: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          badge: profile.photos[0].value,
          email: profile.emails[0].value,
        };

        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user = await User.findOneAndUpdate(
              { email: profile.emails[0].value },
              newUser,
              {
                new: true,
              }
            );
            done(null, user);
          } else {
            return res.render("signup", {
              error:
                "Please create an account before logging in with this method.",
            });
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL,
        scope: ["identify", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          discordId: profile.id,
          email: profile.email,
          badge: profile.avatar,
        };

        try {
          let user = await User.findOne({ email: profile.email });
          if (user) {
            user = await User.findOneAndUpdate(
              { email: profile.email },
              newUser,
              { new: true }
            );
            done(null, user);
          } else {
            return res.render("signup", {
              error:
                "Please create an account before logging in with this method.",
            });
          }
        } catch (err) {
          console.error(err);
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {

    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
