const { requireGroup, requireAdmin } = require("../utils/guards");
const config = require("../../config");

/**
 * .antilink on/off — Toggle anti-link protection in the group
 * Requires: group, admin
 */
module.exports = async function antilink({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const action = (args[0] || "").toLowerCase();
  if (action !== "on" && action !== "off") {
    await sock.sendMessage(groupId, {
      text: `ℹ️ Usage: \`.antilink on\` or \`.antilink off\`\nCurrently: *${config.FEATURES.ANTI_LINK ? "ON" : "OFF"}*`,
    });
    return;
  }

  config.FEATURES.ANTI_LINK = action === "on";
  await sock.sendMessage(groupId, {
    text: `🔗 Anti-Link protection is now *${action.toUpperCase()}*.`,
  });
};
