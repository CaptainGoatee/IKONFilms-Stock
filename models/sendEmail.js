/** @format */

const { CourierClient } = require("@trycourier/courier");

module.exports = async (emailAddress, emailBody, data) => {
  const courier = new CourierClient({
    authorizationToken: process.env.courierAuthorizationToken,
  });

  // Example: send a basic message to an email recipient
  const { requestId } = await courier.send({
    message: {
      to: {
        data: {
          name: "User",
        },
        email: emailAddress,
      },
      content: {
        title: "PACE Notifications",
        body: emailBody,
      },
      routing: {
        method: "single",
        channels: ["email"],
      },
    },
  });
};
