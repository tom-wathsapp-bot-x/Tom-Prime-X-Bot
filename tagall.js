const { requireGroup, requireAdmin } = require("../utils/guards");

/**
 * .tagall [message] — Tags all group members
 * Requires: group, admin
 */
module.exports = async function tagall({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const meta = await sock.groupMetadata(groupId);
  const members = meta.participants;

  const customMsg = args.join(" ") || "👋 Attention everyone!";
  const mentions = members.map((m) => m.id);

  const tagText =
    `*${customMsg}*\n\n` +
    members.map((m, i) => `${i + 1}. @${m.id.replace("@s.whatsapp.net", "")}`).join("\n");

  await sock.sendMessage(groupId, {
    text: tagText,
    mentions,
  });
};
