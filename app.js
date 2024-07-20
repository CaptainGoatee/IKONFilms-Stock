/** @format */

var createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const { WebhookClient, EmbedBuilder } = require("discord.js");
const webhookClient = new WebhookClient({
  url: "https://discord.com/api/webhooks/1264342902692122738/6C7czQWgrGd0u1pQ86klc3jx0RygAAhi05LzsvykaLyHWgFReQ3sRJs69tEirz5u2-pY",
});
function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

dotenv.config();

const authRoutes = require("./routes/auth");
const ticketRoutes = require("./routes/tickets");

const app = express();

mongoose.connect(process.env.MONGO_URI);

const Ticket = require("./models/Ticket");
const UserModel = require("./models/User");
const configSchema = require("./models/configSchema");
const ticketModel = require("./models/ticketLogSchema");
const punishModel = require("./models/punishSchema");
const agentModel = require("./models/addUserSchema");

const User = require("./models/User");
const logger = require("./models/logger");
const { readlink } = require("fs/promises");
const loaModel = require("./models/loaSchema");
const errorModel = require("./models/error");
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

require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/dashboard", ticketRoutes);

app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    const user = await UserModel.findOne({ discordId: req.user.discordId });
    // const existing = await agentModel.findOne({ userID: req.user.discordId });
    // if (!existing) return res.redirect("/not-existing");
    // else if (existing.notOnTeam == true) return res.redirect("/not-in-team");
    if (user.isStaff == false) return res.redirect("/coming-soon");
    return res.redirect("/dashboard");
  }
  res.render("index");
});

app.get(
  "/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/",
  }),
  async (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/logout", (req, res, done) => {
  // If the user is loggedin
  if (req.isAuthenticated) {
    req.logout(done);
    res.redirect("/");
  } else {
    // Not logged in
    res.redirect("/");
  }
});



app.get("/dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const user = await UserModel.findOne({ discordId: req.user.discordId });
  if (user.isStaff == false) return res.render("too-early");
  const rank = req.user.discordId;

  res.render("dashboard", {
    user: req.user,
    rank,
  });
});
app.get("/not-in-team", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  res.render("not-in-team", { user: req.user });
});

app.get("/settings", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;
  console.log(req.user);

  res.render("settings", { user: req.user, rank });
});
app.get("/coming-soon", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  res.render("too-early", { user: req.user });
});
app.get("/not-in-discord", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  res.render("not-registered", { user: req.user });
});
// ______________ ROSTER __________________

app.get("/roster", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  const tickets = await ticketModel.find({ agent: req.user.discordId });

  // create rank variables
  let agentData = [];
  let agents = [];
  let senAgents = [];
  let trainers = [];
  let qaAgents = [];
  let lsa = [];
  let atc = [];
  let tc = [];
  let lqa = [];
  let cmdAgent = [];

  const all_agents = await agentModel.find();

  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;

  await all_agents.forEach((data) => {
    if (data.notOnTeam == true) return;
    if (!data) return;
    if (data.rank == "Agent") {
      return agents.push(data);
    } else if (data.rank == "Senior Agent") {
      return senAgents.push(data);
    } else if (data.rank == "Trainer") {
      return trainers.push(data);
    } else if (data.rank == "Quality Assurance Agent") {
      return qaAgents.push(data);
    } else if (data.rank == "Lead Support Agent") {
      return lsa.push(data);
    } else if (data.rank == "Command") {
      return cmdAgent.push(data);
    } else if (data.rank == "Assistant Training Coordinator") {
      return atc.push(data);
    } else if (data.rank == "Training Coordinator") {
      return tc.push(data);
    } else if (data.rank == "Lead Quality Agent") {
      return lqa.push(data);
    } else {
      return console.log(data.userName + "'s rank is not defined.");
    }
  });

  await res.render("roster", {
    user: req.user,
    tickets,
    agents,
    senAgents,
    trainers,
    qaAgents,
    lsa,
    cmdAgent,
    atc,
    tc,
    lqa,
    rank,
  });
});

app.get("/not-existing", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  res.render("not-existing", { user: req.user });
});

app.get("/new-ticket", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;
  res.render("new-ticket", { user: req.user, rank });
});

app.post("/confirm-ticket-log/:ticketID", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const ticketID = req.params.ticketID;
  const ticket = await ticketModel.findOne({ ticketLogID: ticketID });
  // Validate form inputs

  res.render("review-ticket", { user: req.user, rank, ticket });
});

app.post("/submit-ticket", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const { platform, reason, memberAssisted, ticketLink } = req.body;
  const agent = req.user.discordId;
  // Validate form inputs
  const currentDate = new Date();
  const options = { month: "long", year: "numeric" };
  const currentMonth = currentDate.toLocaleString("default", options);
  const loggedDate = currentMonth;
  const ticketID = "web_" + makeid(9);
  const previous = await ticketModel.findOne({ ticketLink: ticketLink });
  try {
    // Create a new ticket
    const newTicket = await ticketModel.create({
      memberAssisted: memberAssisted,
      ticketLink: ticketLink,
      ticketReason: reason,
      agent: agent,
      date: loggedDate,
      interactionID: "website",
      ticketLogID: ticketID,
    });

    const agentMe = await agentModel.findOne({ userID: req.user.discordId });
    const rank = agentMe.rank;
    console.log(previous);
    if (previous) {
      const errorLog = await errorModel.create({
        discordID: req.user.discordId,
        reason: "Ticket already exists. You've created a duplicate log.",
        URL: req.headers.origin + req.route.path,
      });

      return res.render("error", { user: req.user, error: errorLog, rank });
    }
    res.render("review-ticket", { user: req.user, ticket: newTicket, rank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get(`/delete-punish/:caseId`, async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  // Validate form inputs
  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;
  sessionStorage.setItem("previousPageUrl", window.location.href);

  try {
    // Create a new ticket
    const deletePunish = await punishModel.findOneAndDelete({
      caseID: req.params.caseId,
    });

    //Save the ticket to the database
    const action = `Deleted Punishment: ${req.params.caseId}`;
    const brief = `A punishment has been deleted.`;
    logger(action, brief, req);

    res.redirect("/punishments");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get(`/delete-ticket/:ticketId`, async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    if (req.user.isStaff !== true) return res.redirect("/dashboard");
  }
  // Validate form inputs
  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;

  try {
    // Create a new ticket
    const deleteTicket = await ticketModel.findByIdAndDelete(
      req.params.ticketId
    );

    //Save the ticket to the database
    const action = `Deleted Ticket: ${req.params.ticketId}`;
    const brief = `A Ticket has been deleted.`;
    logger(action, brief, req);

    res.redirect("/ticket-manager");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get(`/delete-my-ticket/:ticketId`, async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const ticketToDelete = await ticketModel.findById(req.params.ticketId);
  if (req.isAuthenticated()) {
    if (req.user.discordId !== ticketToDelete.agent)
      return res.redirect("/dashboard");
  }
  req.sessionStore.set("previousURL", req.url);
  // Validate form inputs
  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;

  try {
    // Create a new ticket
    const deleteTicket = await ticketModel.findByIdAndDelete(
      req.params.ticketId
    );

    //Save the ticket to the database
    const action = `Deleted Ticket: ${req.params.ticketId}`;
    const brief = `A Ticket has been deleted.`;
    logger(action, brief, req);

    res.redirect("/my-tickets");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.post("/update-punishment/:caseId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;
  const { caseId } = await req.params;
  const { offence, description } = await req.body;
  const agent = await req.user.discordId;
  // Validate form inputs
  try {
    // Create a new ticket
    const updatePunish = await punishModel.findOneAndUpdate({
      caseID: caseId,
      $set: {
        offence: offence,
        description: description,
      },
    });

    const action = `Updated Punishment: ${caseId} \n Offence: ${offence} \n Description: ${description}`;
    const brief = `A punishment has been updated.`;
    logger(action, brief, req);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/edit-ticket/:ticketID", async (req, res) => {
  const ticketLog = await ticketModel.findById(req.params.ticketID);
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    let perms = false;
    if (req.user.isStaff == true) {
      perms = true;
    }
    if (req.user.discordId !== ticketLog.agent) {
      perms = true;
    }
    if ((perms = false)) {
      return res.redirect("/dashboard");
    }
  }

  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;
  const { ticketID } = await req.params;
  console.log(req.body);
  const {} = await req.body;
  const agent = await req.user.discordId;
  // Validate form inputs
  try {
    // Create a new ticket
    const updatePunish = await punishModel.findOneAndUpdate({
      caseID: caseId,
      $set: {
        offence: offence,
        description: description,
      },
    });

    const action = `Updated Punishment: ${caseId} \n Offence: ${offence} \n Description: ${description}`;
    const brief = `A punishment has been updated.`;
    logger(action, brief, req);
    res.redirect("/dashboard");
  } catch (err) {
    55503;
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/staff-ticket/:ticketid", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    if (req.user.isStaff !== true) return res.redirect("/dashboard");
  }
  try {
    const ticket = await Ticket.findById(req.params.ticketid)
      .populate("userId")
      .populate("assignedTo")
      .populate("messages.user");
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }
    const agentMe = await agentModel.findOne({ userID: req.user.discordId });
    const rank = agentMe.rank;

    const staffMembers = await User.find({ isStaff: true });
    res.render("staff-ticket-detail", {
      ticket,
      staffMembers,
      user: req.user,
      rank,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/update-ticket/:ticketid", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const { status, assignedTo } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.ticketid);
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }

    ticket.status = status;
    ticket.assignedTo = assignedTo ? assignedTo : null;
    const user = await User.find({ _id: ticket.userId });
    if (req.body.assignedTo !== "") {
      if (ticket.status == "Closed") {
        webhookClient.send({
          content: `<@${user[0].discordId}>`,
          embeds: [
            new EmbedBuilder()
              .setTitle("Ticket Closed")
              .setDescription(`Your ticket has been closed!`)
              .setColor("Green"),
          ],
        });
      }
      if (ticket.status !== "Closed") {
        const assigned = await User.find({ _id: assignedTo });
        webhookClient.send({
          content: `<@${assigned[0].discordId}>`,
          embeds: [
            new EmbedBuilder()
              .setTitle("Ticket Assigned")
              .setDescription(
                `A ticket has been assigned to you or the ticket status has been updated!`
              )
              .setColor("Green")
              .setURL(`https://tickets.mhmatters.us/ticket/${ticket._id}`),
          ],
        });
      }
    }
    await ticket.save();

    res.redirect(`/staff-ticket/${ticket._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Staff Dashboard Route
app.get("/lsa-dashboard", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    if (req.user.isStaff !== true) return res.redirect("/dashboard");
  }
  try {
    const agentMe = await agentModel.findOne({ userID: req.user.discordId });
    const rank = agentMe.rank;
    const user = await User.findById(req.user._id);
    // LOA COUNT
    const loaCount = (await loaModel.find()).length;

    // INACTIVE COUNT

    // TEAM COUNT
    const memberTotal =
      (await agentModel.find()).length -
      (await agentModel.find({ notOnTeam: true })).length;
    // Total Tickets
    const totalTickets = (await ticketModel.find()).length;
    //const tickets = await Ticket.find().populate('userId').populate('assignedTo');
    res.render("lsa-dashboard", {
      user: req.user,
      totalTickets,
      memberTotal,
      rank,
      loaCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get("/ticket-manager", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    if (req.user.isStaff !== true) return res.redirect("/dashboard");
  }
  try {
    const agentMe = await agentModel.findOne({ userID: req.user.discordId });
    const rank = agentMe.rank;
    const user = await User.findById(req.user._id);
    const data = await ticketModel.find();
    const tickets = data.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    const pageSize = 5;
    let curPage = 1;
    const arr = data.slice(curPage * pageSize, (curPage + 1) * pageSize);
    arr.forEach((ticket) => {
      console.log(ticket.agent);
    });

    //const tickets = await Ticket.find().populate('userId').populate('assignedTo');
    res.render("ticket-manager", { user: req.user, data, rank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.post("/ticket-manager/search", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    if (req.user.isStaff !== true) return res.redirect("/dashboard");
  }
  try {
    const agentMe = await agentModel.findOne({ userID: req.user.discordId });
    const rank = agentMe.rank;
    const user = await User.findById(req.user._id);
    const data = await ticketModel.find({ agent: req.body.discordID });
    const tickets = data.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    //const tickets = await Ticket.find().populate('userId').populate('assignedTo');
    res.render("ticket-manager", { user: req.user, data, rank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/punishments", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    if (req.user.isStaff !== true) return res.redirect("/dashboard");
  }
  try {
    const user = await User.findById(req.user._id);
    const punishments = await punishModel.find();
    const agentMe = await agentModel.findOne({ userID: req.user.discordId });
    const rank = agentMe.rank;
    //const punishments = [...unsorted].sort((a, b) => b.date - a.date);
    //const tickets = await Ticket.find().populate('userId').populate('assignedTo');
    res.render("punishments", { user: req.user, punishments, rank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get(`/punishments/:caseId`, async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    if (req.user.isStaff !== true) return res.redirect("/dashboard");
  }
  try {
    const punishment = await punishModel.findById(req.params.caseId);
    if (!punishment) {
      return res.status(404).send("No punishment found with that ID");
    }
    const agentMe = await agentModel.findOne({ userID: req.user.discordId });
    const rank = agentMe.rank;
    res.render("edit-punishment", { user: req.user, punishment, rank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get(`/tickets/:ticketID`, async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.isAuthenticated()) {
    if (req.user.isStaff !== true) return res.redirect("/dashboard");
  }
  try {
    const ticket = await ticketModel.findById(req.params.ticketID);
    if (!ticket) {
      return res.status(404).send("No Ticket found with that ID");
    }
    const agentMe = await agentModel.findOne({ userID: req.user.discordId });
    const rank = agentMe.rank;
    res.render("edit-ticket", { user: req.user, ticket, rank });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      res.redirect("/");

      return next(err);
    }
    res.redirect("/");
  });
  res.redirect("/");
});

app.post("/staff-ticket/:ticketid/respond", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const { message } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.ticketid);
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }
    const ticketUser = await User.find({ _id: ticket.userId });
    ticket.messages.push({
      user: req.user._id,
      message: message,
      dateTime: new Date(),
    });
    await ticket.save();
    webhookClient.send({
      content: `<@${ticketUser[0].discordId}>`,
      embeds: [
        new EmbedBuilder()
          .setTitle("Ticket Update")
          .setDescription(`A new message is available in your ticket!`)
          .setColor("Green")
          .setURL(`https://tickets.mhmatters.us/ticket/${ticket._id}`),
      ],
    });
    res.redirect(`/staff-ticket/${ticket._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ----------------------------------------------
app.get("/ticket/:ticketid", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  try {
    const ticket = await Ticket.findById(req.params.ticketid)
      .populate("userId")
      .populate("messages.user");
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }
    if (ticket.userId.discordId !== req.user.discordId)
      return res.redirect("/dashboard");
    res.render("ticket", { ticket, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/ticket/:ticketid/respond", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  const { message } = req.body;

  try {
    const ticket = await Ticket.findById(req.params.ticketid);
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }

    ticket.messages.push({
      user: req.user._id,
      message: message,
      dateTime: new Date(),
    });
    if (ticket.assignedTo) {
      const assigned = await User.find({ _id: ticket.assignedTo });
      webhookClient.send({
        content: `<@${assigned[0].discordId}>`,
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket Update")
            .setDescription(
              `A new message is available in the ticket you are assigned!`
            )
            .setColor("Green")
            .setURL(`https://tickets.mhmatters.us/ticket/${ticket._id}`),
        ],
      });
    }

    await ticket.save();
    res.redirect(`/ticket/${ticket._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
app.get("/user-management", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.user.isStaff !== true) return res.redirect("/dashboard");
  if (req.user.superAdmin !== true) return res.redirect("/dashboard");
  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;

  const users = await agentModel.find();
  res.render("user-management", { users, user: req.user, rank });
});

app.post("/update-users", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  const user = await User.findById(req.user._id);
  if (!user || !user.superAdmin) {
    return res.redirect("/dashboard");
  }

  try {
    const users = await agentModel.find();
    for (const user of users) {
      user.userName = req.body.userName;
      user.userLoa = req.body[`userLoa_${user._id}`] === "on";
      user.userExempt = req.body[`userExempt_${user._id}`] === "on";
      user.notOnTeam = req.body[`notOnTeam_${user._id}`] === "on";
      user.userSuspended = req.body[`userSuspended_${user._id}`] === "on";
      user.strikes = req.body.strikes;
      user.sentToRetrain = req.body[`sentToRetrain_${user._id}`] === "on";

      await user.save();
    }

    res.redirect("/user-management");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/update-admin", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  if (!req.user || !req.user.superAdmin) {
    return res.redirect("/dashboard");
  }

  try {
    const users = await User.find();
    for (const user of users) {
      user.isStaff = req.body[`isStaff_${user._id}`] === "on";
      user.superAdmin = req.body[`superAdmin_${user._id}`] === "on";
      user.banned = req.body[`banned_${user._id}`] === "on";
      await user.save();
    }

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/admin", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  if (req.user.isStaff !== true) return res.redirect("/dashboard");
  if (req.user.superAdmin !== true) return res.redirect("/dashboard");
  const agentMe = await agentModel.findOne({ userID: req.user.discordId });
  const rank = agentMe.rank;

  const users = await User.find();
  res.render("admin-panel", { users, user: req.user, rank });
});

app.post("/admin", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }

  const user = await User.findById(req.user._id);
  if (!user || !user.superAdmin) {
    return res.redirect("/dashboard");
  }

  try {
    const users = await User.find();
    for (const user of users) {
      user.isStaff = req.body[`isStaff_${user._id}`] === "on";
      user.superAdmin = req.body[`superAdmin_${user._id}`] === "on";
      user.banned = req.body[`banned_${user._id}`] === "on";
      await user.save();
    }

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  var discordUser = "";
  if (!req.user) {
    discordUser = "Unknown";
  } else if (req.user) {
    discordUser = req.user.discordId;
  }

  // render the error page
  res.status(err.status || 500);
  res.render("error", { user: discordUser });
});

const PORT = process.env.PORT || 3110;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
