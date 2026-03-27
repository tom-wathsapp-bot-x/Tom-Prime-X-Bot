const { requireGroup, requireAdmin, getMentioned } = require("../utils/guards");

/**
 * .promote @user — Makes a member a group admin
 * Requires: group, admin
 */
module.exports = async function promote({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const targets = getMentioned(msg);
  if (targets.length === 0) {
    await sock.sendMessage(groupId, {
      text: "❌ Please mention the user you want to promote.\nExample: `.promote @user`",
    });
    return;
  }

  try {
    await sock.groupParticipantsUpdate(groupId, targets, "promote");
    const names = targets.map((t) => `@${t.replace("@s.whatsapp.net", "")}`).join(", ");
    await sock.sendMessage(groupId, {
      text: `⬆️ ${names} ${targets.length > 1 ? "have" : "has"} been promoted to group admin.`,
      mentions: targets,
    });
  } catch (err) {
    await sock.sendMessage(groupId, {
      text: "❌ Failed to promote the user. Make sure the bot is an admin.",
    });
  }
};
