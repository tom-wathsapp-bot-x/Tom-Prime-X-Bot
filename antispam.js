const { requireGroup, requireAdmin } = require("../utils/guards");
const config = require("../../config");

/**
 * .antispam on/off — Toggle anti-spam protection in the group
 * Requires: group, admin
 */
module.exports = async function antispam({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const action = (args[0] || "").toLowerCase();
  if (action !== "on" && action !== "off") {
    await sock.sendMessage(groupId, {
      text: `ℹ️ Usage: \`.antispam on\` or \`.antispam off\`\nCurrently: *${config.FEATURES.ANTI_SPAM ? "ON" : "OFF"}*`,
    });
    return;
  }

  config.FEATURES.ANTI_SPAM = action === "on";
  await sock.sendMessage(groupId, {
    text: `🚫 Anti-Spam protection is now *${action.toUpperCase()}*.`,
  });
};
