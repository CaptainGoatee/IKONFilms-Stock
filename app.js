/** @format */

// ----------------------------------------------
// VARIABLES
// ----------------------------------------------

var createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");
const { WebhookClient, userMention } = require("discord.js");
const webhookClient = new WebhookClient({
  url: "https://discord.com/api/webhooks/1242904306189860875/gsl5PQfsvSbKvQpOqriDrlTQSmyyPZjECI9LuJhpIidbrN70oEFaWr1fx88mOUIC2zL-",
});

// ----------------------------------------------
// CONFIG
// ----------------------------------------------

dotenv.config();
const date = new Date();
let formattedDate = date.toISOString().split("T")[0];

const authRoutes = require("./routes/auth");

const app = express();

// Mongoose Models ::

mongoose.connect(process.env.MONGO_URI);

const User = require("./models/User");
const tempSchema = require("./models/tempModel");
const stockTyres = require("./models/tyres");
const jobSchema = require("./models/jobsheet");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// ----------------------------------------------
// BACKGROUND PROCESSES - CORE
// ----------------------------------------------

require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  res.render("login", { error: null });
});

const configSchema = require("./models/configSchema");
const techModel = require("./models/techs");

app.get("/login/google", passport.authenticate("google"));

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: "/",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/home");
  }
);

app.post("/login/password", async function (req, res, next) {
  try {
    const userData = await User.findOne({ payroll: req.body.username });

    if (!userData) {
      return res.render("login", { error: "Account not found." });
    }
    var salt = userData.salt;
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        if (err) {
          console.log(err);
        }
        User.findOne({
          payroll: req.body.username,
          hashed_password: hashedPassword,
        }).then((member) => {
          if (!member) {
            console.log(err);
            return res.render("login", {
              error: "Incorrect Username or Password",
            });
          }
          var user = {
            id: member._id,
            username: req.body.username,
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
  } catch (error) {
    console.log(error);
  }
});
app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  res.render("login", { error: null });
});

app.get("/scan-in", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.render("scan-in", { error: null });
});
app.get("/create_account", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  res.render("signup", {
    error:
      "System: Please create an account. Once you've created one, Please contact a System Administrator to finish setting your account up.",
  });
});

app.get(
  "/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/",
  }),
  async (req, res) => {
    res.redirect("/home");
  }
);

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

app.get("/home", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (!req.user.access) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });
    return res.render("login", {
      error: "Account not verified by iKON Studios.",
    });
  }
  const jobModel = await mongoose.model(`${formattedDate}`, jobSchema);
  const jobCards = await jobModel.find({ technician: req.user.payroll });
  // create new object
  let jobcards = [];
  await jobCards.forEach((job) =>
    jobcards.push({
      vrm: job.vrm,
      description: job.description,
      status: job.status,
      slotTime: job.slotTime,
    })
  );

  const sorted = await jobcards.toSorted(({ slotTime: a }, { slotTime: b }) =>
    a < b ? -1 : a > b ? 1 : 0
  );

  res.render("dashboard", { jobCards: sorted, user: req.user });
});

// ----------------------------------------------
// BACKGROUND PROCESSES - MISC
// ----------------------------------------------

app.post("/update-users", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  const user = await User.findById(req.user._id);
  if (!user || user.access == "Workshop" || user.access == "Office") {
    return res.redirect("/home");
  }

  try {
    const users = await User.find();
    for (const user of users) {
      user.access = req.body.accessLevel;
      await user.save();
    }

    res.redirect("/users");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/update-personal", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  const userSaving = await User.findById(req.user._id);

  try {
    console.log(req.user.payroll);
    const toUpdate = {
      displayName: `${req.body.nameForm}`,
      email: `${req.body.emailForm}`,
      phoneNumber: `${req.body.phoneForm}`,
    };
    try {
      console.log(toUpdate);
      await User.findOneAndUpdate(
        { payroll: req.user.payroll },
        {
          $set: {
            displayName: req.body.nameForm,
            email: req.body.emailForm,
            phoneNumber: req.body.phoneForm,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }

    res.redirect("/settings#personal");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ----------------------------------------------
// OTHER PAGES
// ----------------------------------------------

// -- /tyres
app.get("/tyres", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const tyres = await stockTyres.find();
  res.render("tyres", { data: tyres, search: null });
});
// -- /tyres after searching
app.post("/tyres/search", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const searchQuery = req.body.searchQuery;
  const tyres = await stockTyres.find({
    description: { $regex: `${searchQuery.toUpperCase()}` },
  });
  res.render("tyres", { data: tyres, search: searchQuery });
});

// -- /manage-jobs
app.get("/manage-jobs", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const error = { status: "404", stack: "Page in development." };
  res.render("devError", {
    message: "Page not released from development.",
    error,
  });
});

// -- /users
app.get("/users", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const users = await User.find();
  res.render("users", { users });
});

// -- /settings
app.get("/settings", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const user = await User.findOne({ payroll: req.user.payroll });
  res.render("settings", { user });
});

// -- Progress Board
app.get("/progress-board", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.user.access !== "Developer") {
    return res.redirect("/");
  }

  if (!req.user.access) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });
    return res.render("login", {
      error: "Account not verified by management.",
    });
  }
  const jobModel = mongoose.model(`${formattedDate}`, jobSchema);
  const tempModel = mongoose.model("tempJobs", tempSchema);
  const jobData = await jobModel.find();

  // create new object
  let jobcards = [];
  let availabletechs = [];

  const fetchedTechs = await techModel.find();
  fetchedTechs.forEach((tech) => {
    availabletechs.push({ code: tech.code, name: tech.name });
  });

  jobData.forEach(async (job) => {
    jobcards.push({
      vrm: job.vrm,
      description: job.description,
      status: job.status.replace("_", " "),
      technician: job.technician,
      slotTime: job.slotTime,
    });
    await tempModel.create({ vrm: `${job.vrm}` });
  });
  setTimeout(async () => {
    try {
      const jobsSorted = await jobcards
        .toSorted(({ slotTime: a }, { slotTime: b }) =>
          a < b ? -1 : a > b ? 1 : 0
        )
        .filter((v, i, a) => a.findIndex((t) => t.vrm === v.vrm) === i);

      res.render("progressBoard", {
        techs: availabletechs,
        jobCards: jobsSorted,
        user: req.user,
      });
      mongoose.connection.dropCollection("tempjobs");
    } catch (error) {
      return console.log(error);
    }
  }, 1000);
});

// ----------------------------------------------
// Listen
// ----------------------------------------------
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  var discordUser = "";
  if (!req.user) {
    discordUser = "Unknown";
  } else if (req.user) {
    discordUser = req.user.discordId;
  }

  res.status(err.status || 500);
  res.render("error", { user: discordUser });
});
const PORT = process.env.PORT || 3130;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
