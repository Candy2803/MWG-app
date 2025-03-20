const express = require("express");
const Contribution = require("../models/Contribution");
const User = require("../models/User");
const nodemailer = require("nodemailer");



const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    if (users.length === 0) {
      return res.status(200).send({ message: "No users found", users: [] });
    }

    // Map each user to include only _id and userName
    const usersData = users.map(user => ({
      _id: user._id,
      userName: user.name
    }));

    console.log("Fetched users:", usersData);

    res.status(200).send({
      message: "Users fetched successfully",
      users: usersData,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({
      message: "Error fetching users",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const contributions = await Contribution.find();

    if (contributions.length === 0) {
      return res
        .status(200)
        .send({ message: "No contributions found", contributions: [] });
    }

    console.log("Fetched all contributions:", contributions);

    res
      .status(200)
      .send({ message: "Contributions fetched successfully", contributions });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res
      .status(500)
      .send({ message: "Error fetching contributions", error: error.message });
  }
});

router.get("/:userId/contributions", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.expoPushToken && user.pushNotificationsEnabled) {
      await sendPushNotification(
        user.expoPushToken,
        'Contribution Received',
        `Your contribution of ${amount} has been received successfully`
      );
    }
    const contributions = await Contribution.find({ userId }).populate(
      "userId",
      "name"
    );

    if (contributions.length === 0) {
      return res.status(200).send({
        message: "No contributions found for this user",
        contributions: [],
      });
    }

    console.log(`Fetched contributions for user ${user.name}:`, contributions);

    res.status(200).send({
      message: `Contributions for ${user.name} fetched successfully`,
      contributions,
    });
  } catch (error) {
    console.error("Error fetching contributions:", error);
    res
      .status(500)
      .send({ message: "Error fetching contributions", error: error.message });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: "mwarighaswelfare@gmail.com", 
    pass: "yock vqdb gwod vbf", 
  },
});

router.post("/:userId/contributions", async (req, res) => {
  const { userId } = req.params;
  const { amount, paymentMethod } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const newContribution = new Contribution({
      userId,
      userName: user.name,
      amount,
      paymentMethod,
    });

    const savedContribution = await newContribution.save();

    console.log("New contribution created for user:", savedContribution);

    const currentDate = new Date();
    const nextContributionDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      5
    ); 

    const mailOptions = {
      from: "candyjessie2@gmail.com", 
      to: user.email, 
      subject: "Confirmation of Your Contribution",
      text: `Dear ${user.name},

Thank you for your recent contribution of ${amount} to our Money Market account via ${paymentMethod}. Your contribution is greatly appreciated and helps us maintain the financial well-being of our family welfare group.

Please note that your next contribution is due on the 5th of the upcoming month, specifically on ${nextContributionDate.toDateString()}.

We are grateful for your consistent support. Should you have any questions or need assistance with your next contribution, feel free to reach out to us.

Best regards,
MWG Team.
`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).send({
      message: "Contribution created successfully and email sent",
      contribution: savedContribution,
    });
  } catch (error) {
    console.error("Error creating contribution:", error);
    res
      .status(500)
      .send({ message: "Error creating contribution", error: error.message });
  }
});

router.delete("/:contributionId", async (req, res) => {
  const { contributionId } = req.params;

  try {
    const contribution = await Contribution.findByIdAndDelete(contributionId);

    if (!contribution) {
      return res.status(404).send({ message: "Contribution not found" });
    }

    console.log(`Contribution with ID ${contributionId} deleted successfully`);

    res
      .status(200)
      .send({ message: "Contribution deleted successfully", contribution });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    res
      .status(500)
      .send({ message: "Error deleting contribution", error: error.message });
  }
});

module.exports = router;
