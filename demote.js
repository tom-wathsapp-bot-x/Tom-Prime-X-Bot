const { requireGroup, requireAdmin, getMentioned } = require("../utils/guards");

/**
 * .demote @user — Removes admin role from a member
 * Requires: group, admin
 */
module.exports = async function demote({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const targets = getMentioned(msg);
  if (targets.length === 0) {
    await sock.sendMessage(groupId, {
      text: "❌ Please mention the user you want to demote.\nExample: `.demote @user`",
    });
    return;
  }

  try {
    await sock.groupParticipantsUpdate(groupId, targets, "demote");
    const names = targets.map((t) => `@${t.replace("@s.whatsapp.net", "")}`).join(", ");
    await sock.sendMessage(groupId, {
      text: `⬇️ ${names} ${targets.length > 1 ? "have" : "has"} been demoted from group admin.`,
      mentions: targets,
    });
  } catch (err) {
    await sock.sendMessage(groupId, {
      text: "❌ Failed to demote the user. Make sure the bot is an admin.",
    });
  }
};
