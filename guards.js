const config = require("../../config");

/**
 * Checks if the command is being used inside a group.
 * Sends a reply if not and returns false.
 */
async function requireGroup(sock, msg, isGroup) {
  if (!isGroup) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "❌ This command can only be used in a group.",
    });
    return false;
  }
  return true;
}

/**
 * Checks if the sender is a group admin (or the bot owner).
 * Sends a reply if not and returns false.
 */
async function requireAdmin(sock, msg, groupId, sender) {
  const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
  if (sender === ownerJid) return true;

  try {
    const meta = await sock.groupMetadata(groupId);
    const admins = meta.participants
      .filter((p) => p.admin === "admin" || p.admin === "superadmin")
      .map((p) => p.id);

    if (!admins.includes(sender)) {
      await sock.sendMessage(groupId, {
        text: "❌ This command is for group admins only.",
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error checking admin status:", err);
    return false;
  }
}

/**
 * Extracts mentioned JIDs from a message.
 */
function getMentioned(msg) {
  return (
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    msg.message?.imageMessage?.contextInfo?.mentionedJid ||
    msg.message?.videoMessage?.contextInfo?.mentionedJid ||
    []
  );
}

module.exports = { requireGroup, requireAdmin, getMentioned };
