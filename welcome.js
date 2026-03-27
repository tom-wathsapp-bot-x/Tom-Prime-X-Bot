const { requireGroup, requireAdmin } = require("../utils/guards");
const config = require("../../config");

/**
 * .welcome on/off — Toggle welcome/goodbye messages
 * Requires: group, admin
 */
module.exports = async function welcome({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const action = (args[0] || "").toLowerCase();
  if (action !== "on" && action !== "off") {
    await sock.sendMessage(groupId, {
      text: `ℹ️ Usage: \`.welcome on\` or \`.welcome off\`\nCurrently: *${config.FEATURES.WELCOME ? "ON" : "OFF"}*`,
    });
    return;
  }

  const enabled = action === "on";
  config.FEATURES.WELCOME = enabled;
  config.FEATURES.GOODBYE = enabled;

  await sock.sendMessage(groupId, {
    text: `👋 Welcome & Goodbye messages are now *${action.toUpperCase()}*.`,
  });
};
