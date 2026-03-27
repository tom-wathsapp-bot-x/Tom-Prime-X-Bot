const config = require("../../config");

/**
 * Handles group participant updates:
 * - Welcome message when someone joins
 * - Goodbye message when someone leaves
 */
async function handleGroupUpdate(sock, update) {
  try {
    const { id: groupId, participants, action } = update;

    const meta = await sock.groupMetadata(groupId).catch(() => null);
    if (!meta) return;

    const groupName = meta.subject;
    const memberCount = meta.participants.length;

    for (const participant of participants) {
      const number = participant.replace("@s.whatsapp.net", "");

      if (action === "add" && config.FEATURES.WELCOME) {
        const welcomeText = config.WELCOME_MESSAGE
          .replace("{name}", number)
          .replace("{number}", number)
          .replace("{group}", groupName)
          .replace("{members}", memberCount);

        await sock.sendMessage(groupId, {
          text: welcomeText,
          mentions: [participant],
        });
      }

      if (action === "remove" && config.FEATURES.GOODBYE) {
        const goodbyeText = config.GOODBYE_MESSAGE
          .replace("{name}", number)
          .replace("{number}", number)
          .replace("{group}", groupName)
          .replace("{members}", memberCount);

        await sock.sendMessage(groupId, {
          text: goodbyeText,
          mentions: [participant],
        });
      }
    }
  } catch (err) {
    console.error("Error in handleGroupUpdate:", err);
  }
}

module.exports = { handleGroupUpdate };
