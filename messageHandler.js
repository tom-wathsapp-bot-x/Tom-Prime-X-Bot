const config = require("../../config");
const { getCommand } = require("../utils/helpers");
const { antiLink } = require("../utils/antiLink");
const { antiSpam } = require("../utils/antiSpam");
const commands = require("../commands");

/**
 * Main message handler — routes every incoming message
 * to the appropriate command or protection module.
 */
async function handleMessage(sock, m) {
  try {
    const msg = m.messages[0];
    if (!msg || msg.key.fromMe) return;

    const isGroup = msg.key.remoteJid?.endsWith("@g.us");
    const sender = msg.key.participant || msg.key.remoteJid;
    const groupId = msg.key.remoteJid;

    // Extract the text content from any message type
    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      "";

    const isCommand = body.startsWith(config.BOT_PREFIX);

    // ─── Group-only protections ───────────────────────────────
    if (isGroup) {
      // Anti-link check
      if (config.FEATURES.ANTI_LINK) {
        const handled = await antiLink(sock, msg, sender, groupId, body);
        if (handled) return;
      }

      // Anti-spam check
      if (config.FEATURES.ANTI_SPAM) {
        const handled = await antiSpam(sock, msg, sender, groupId);
        if (handled) return;
      }
    }

    // ─── Command handling ─────────────────────────────────────
    if (!isCommand) return;

    const { command, args } = getCommand(body, config.BOT_PREFIX);

    const ctx = {
      sock,
      msg,
      sender,
      groupId,
      isGroup,
      args,
      body,
      command,
    };

    const handler = commands[command];
    if (handler) {
      await handler(ctx);
    }
  } catch (err) {
    console.error("Error in handleMessage:", err);
  }
}

module.exports = { handleMessage };
