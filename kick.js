const { requireGroup, requireAdmin, getMentioned } = require("../utils/guards");

/**
 * .kick @user — Removes a member from the group
 * Requires: group, admin
 */
module.exports = async function kick({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const targets = getMentioned(msg);
  if (targets.length === 0) {
    await sock.sendMessage(groupId, {
      text: "❌ Please mention the user you want to kick.\nExample: `.kick @user`",
    });
    return;
  }

  try {
    await sock.groupParticipantsUpdate(groupId, targets, "remove");
    const names = targets.map((t) => `@${t.replace("@s.whatsapp.net", "")}`).join(", ");
    await sock.sendMessage(groupId, {
      text: `✅ ${names} ${targets.length > 1 ? "have" : "has"} been removed from the group.`,
      mentions: targets,
    });
  } catch (err) {
    await sock.sendMessage(groupId, {
      text: "❌ Failed to kick the user. Make sure the bot is an admin.",
    });
  }
};
