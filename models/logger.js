/** @format */

module.exports = (action, brief, req) => {
  const { WebhookClient, EmbedBuilder } = require("discord.js");
  const webhookClient = new WebhookClient({
    url: "https://discord.com/api/webhooks/1245115246759379074/0Xr49p4v4sqLYaRb9LgraxZONbG_2-EVhYc_PpfWUeqEtutgTz83eEAt-XTUANvnsx4v",
  });

  webhookClient.send({
    content: `\`REQ: ${req.originalUrl}\``,
    embeds: [
      new EmbedBuilder()
        .setTitle("Website Logging")
        .setDescription(brief)
        .addFields({
          name: "Action",
          value: `${action}`,
        })
        .addFields({
          name: "User",
          value: `<@${req.user.discordId}>`,
        })
        .setColor("Blue")
        .setTimestamp(),
    ],
  });
};
