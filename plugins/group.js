/**
 * ============================================================
 *   Tom's WhatsApp Bot — Group Plugins
 *   ALL group commands are here in one place.
 *   Created by Tom
 * ============================================================
 *
 *  How to add a new command:
 *  1. Add it to the `commands` object at the bottom of this file
 *  2. Write the handler function above it
 *  3. Done — no other files to touch
 * ============================================================
 */

const config = require("../config");
const play = require("play-dl");
const { requireGroup, requireAdmin, getMentioned } = require("../src/utils/guards");
const { containsLink } = require("../src/utils/helpers");
const NodeCache = require("node-cache");

// ─── Internal state (in-memory, resets on restart) ───────────
const spamCache   = new NodeCache({ stdTTL: 60 });
const spamWarns   = new Map();
const linkWarns   = new Map();
const wordWarns   = new Map();

// ─── Helper: send a reply to the group ───────────────────────
async function reply(sock, groupId, text, mentions = []) {
  await sock.sendMessage(groupId, { text, mentions });
}

// ─── Helper: small delay to avoid flooding WhatsApp ──────────
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ═════════════════════════════════════════════════════════════
//  COMMAND HANDLERS
// ═════════════════════════════════════════════════════════════

// ─── .menu ────────────────────────────────────────────────────
async function menu({ sock, msg, groupId, isGroup }) {
  const p = config.BOT_PREFIX;
  const text = `
╔══════════════════════════╗
║   *${config.BOT_NAME}*
║   Created by *Tom*
╚══════════════════════════╝

*👥 Group Management*
▸ \`${p}tagall [msg]\` — Tag everyone
▸ \`${p}kick @user\` — Remove member
▸ \`${p}promote @user\` — Make admin
▸ \`${p}demote @user\` — Remove admin
▸ \`${p}mute\` — Only admins can chat
▸ \`${p}open\` — Everyone can chat

*🛡️ Protections*
▸ \`${p}antilink on/off\` — Block links
▸ \`${p}antispam on/off\` — Block spam
▸ \`${p}antiword on/off\` — Block bad words
▸ \`${p}addword [word]\` — Add banned word
▸ \`${p}removeword [word]\` — Remove banned word
▸ \`${p}badwords\` — List banned words

*👋 Welcome & Goodbye*
▸ \`${p}welcome on/off\` — Toggle welcome msg
▸ \`${p}goodbye on/off\` — Toggle goodbye msg

*🎵 Media*
▸ \`${p}play [song name]\` — Send audio

*ℹ️ General*
▸ \`${p}menu\` — Show this menu
▸ \`${p}bot\` — Bot info

_Admin commands require group admin rights._
`.trim();

  const target = isGroup ? groupId : msg.key.remoteJid;
  await reply(sock, target, text);
}

// ─── .bot ─────────────────────────────────────────────────────
async function bot({ sock, msg, groupId, isGroup }) {
  const target = isGroup ? groupId : msg.key.remoteJid;
  const text = `
*🤖 ${config.BOT_NAME}*

👤 *Owner:* Tom
⚙️ *Prefix:* ${config.BOT_PREFIX}
📡 *Status:* Online
🔗 *Library:* Baileys (multi-device)

_Type ${config.BOT_PREFIX}menu to see all commands._
`.trim();
  await reply(sock, target, text);
}

// ─── .tagall ──────────────────────────────────────────────────
async function tagall({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const meta     = await sock.groupMetadata(groupId);
  const members  = meta.participants;
  const mentions = members.map((m) => m.id);
  const custom   = args.join(" ") || "📢 Attention everyone!";

  const text =
    `*${custom}*\n\n` +
    members.map((m, i) => `${i + 1}. @${m.id.replace("@s.whatsapp.net", "")}`).join("\n");

  await sock.sendMessage(groupId, { text, mentions });
}

// ─── .kick ────────────────────────────────────────────────────
async function kick({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const targets = getMentioned(msg);
  if (!targets.length) {
    return reply(sock, groupId, "❌ Mention the user to kick.\nExample: `.kick @user`");
  }

  try {
    await sock.groupParticipantsUpdate(groupId, targets, "remove");
    const names = targets.map((t) => `@${t.replace("@s.whatsapp.net", "")}`).join(", ");
    await reply(sock, groupId, `✅ ${names} has been removed.`, targets);
  } catch {
    await reply(sock, groupId, "❌ Failed to kick. Make sure the bot is an admin.");
  }
}

// ─── .promote ─────────────────────────────────────────────────
async function promote({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const targets = getMentioned(msg);
  if (!targets.length) {
    return reply(sock, groupId, "❌ Mention the user to promote.\nExample: `.promote @user`");
  }

  try {
    await sock.groupParticipantsUpdate(groupId, targets, "promote");
    const names = targets.map((t) => `@${t.replace("@s.whatsapp.net", "")}`).join(", ");
    await reply(sock, groupId, `⬆️ ${names} is now a group admin.`, targets);
  } catch {
    await reply(sock, groupId, "❌ Failed to promote. Make sure the bot is an admin.");
  }
}

// ─── .demote ──────────────────────────────────────────────────
async function demote({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const targets = getMentioned(msg);
  if (!targets.length) {
    return reply(sock, groupId, "❌ Mention the user to demote.\nExample: `.demote @user`");
  }

  try {
    await sock.groupParticipantsUpdate(groupId, targets, "demote");
    const names = targets.map((t) => `@${t.replace("@s.whatsapp.net", "")}`).join(", ");
    await reply(sock, groupId, `⬇️ ${names} has been removed from admin.`, targets);
  } catch {
    await reply(sock, groupId, "❌ Failed to demote. Make sure the bot is an admin.");
  }
}

// ─── .mute ────────────────────────────────────────────────────
async function mute({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  try {
    await sock.groupSettingUpdate(groupId, "announcement");
    await reply(sock, groupId, "🔇 Group muted. Only admins can send messages now.");
  } catch {
    await reply(sock, groupId, "❌ Failed to mute. Make sure the bot is an admin.");
  }
}

// ─── .open ────────────────────────────────────────────────────
async function open({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  try {
    await sock.groupSettingUpdate(groupId, "not_announcement");
    await reply(sock, groupId, "🔓 Group opened. Everyone can send messages now.");
  } catch {
    await reply(sock, groupId, "❌ Failed to open the group. Make sure the bot is an admin.");
  }
}

// ─── .antilink ────────────────────────────────────────────────
async function antilink({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const action = (args[0] || "").toLowerCase();
  if (action !== "on" && action !== "off") {
    return reply(
      sock, groupId,
      `ℹ️ Usage: \`.antilink on\` or \`.antilink off\`\nCurrently: *${config.FEATURES.ANTI_LINK ? "ON" : "OFF"}*`
    );
  }

  config.FEATURES.ANTI_LINK = action === "on";
  await reply(sock, groupId, `🔗 Anti-Link is now *${action.toUpperCase()}*.`);
}

// ─── .antispam ────────────────────────────────────────────────
async function antispam({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const action = (args[0] || "").toLowerCase();
  if (action !== "on" && action !== "off") {
    return reply(
      sock, groupId,
      `ℹ️ Usage: \`.antispam on\` or \`.antispam off\`\nCurrently: *${config.FEATURES.ANTI_SPAM ? "ON" : "OFF"}*`
    );
  }

  config.FEATURES.ANTI_SPAM = action === "on";
  await reply(sock, groupId, `🚫 Anti-Spam is now *${action.toUpperCase()}*.`);
}

// ─── .antiword ────────────────────────────────────────────────
async function antiword({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const action = (args[0] || "").toLowerCase();
  if (action !== "on" && action !== "off") {
    return reply(
      sock, groupId,
      `ℹ️ Usage: \`.antiword on\` or \`.antiword off\`\nCurrently: *${config.FEATURES.ANTI_WORD ? "ON" : "OFF"}*`
    );
  }

  config.FEATURES.ANTI_WORD = action === "on";
  await reply(sock, groupId, `🤬 Anti-Word filter is now *${action.toUpperCase()}*.`);
}

// ─── .addword ─────────────────────────────────────────────────
async function addword({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const word = args[0]?.toLowerCase();
  if (!word) {
    return reply(sock, groupId, "❌ Please provide a word.\nExample: `.addword badword`");
  }

  if (!config.BANNED_WORDS.includes(word)) {
    config.BANNED_WORDS.push(word);
  }

  await reply(sock, groupId, `✅ "*${word}*" has been added to the banned words list.`);
}

// ─── .removeword ──────────────────────────────────────────────
async function removeword({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const word = args[0]?.toLowerCase();
  if (!word) {
    return reply(sock, groupId, "❌ Please provide a word.\nExample: `.removeword badword`");
  }

  const index = config.BANNED_WORDS.indexOf(word);
  if (index === -1) {
    return reply(sock, groupId, `⚠️ "*${word}*" is not in the banned words list.`);
  }

  config.BANNED_WORDS.splice(index, 1);
  await reply(sock, groupId, `✅ "*${word}*" has been removed from the banned words list.`);
}

// ─── .badwords ────────────────────────────────────────────────
async function badwords({ sock, msg, groupId, isGroup, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  if (!config.BANNED_WORDS.length) {
    return reply(sock, groupId, "📋 No banned words have been set yet.\nUse `.addword [word]` to add one.");
  }

  const list = config.BANNED_WORDS.map((w, i) => `${i + 1}. ${w}`).join("\n");
  await reply(sock, groupId, `📋 *Banned Words List:*\n\n${list}`);
}

// ─── .welcome ─────────────────────────────────────────────────
async function welcome({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const action = (args[0] || "").toLowerCase();
  if (action !== "on" && action !== "off") {
    return reply(
      sock, groupId,
      `ℹ️ Usage: \`.welcome on\` or \`.welcome off\`\nCurrently: *${config.FEATURES.WELCOME ? "ON" : "OFF"}*`
    );
  }

  config.FEATURES.WELCOME = action === "on";
  await reply(sock, groupId, `👋 Welcome messages are now *${action.toUpperCase()}*.`);
}

// ─── .goodbye ─────────────────────────────────────────────────
async function goodbye({ sock, msg, groupId, isGroup, args, sender }) {
  if (!requireGroup(sock, msg, isGroup)) return;
  if (!(await requireAdmin(sock, msg, groupId, sender))) return;

  const action = (args[0] || "").toLowerCase();
  if (action !== "on" && action !== "off") {
    return reply(
      sock, groupId,
      `ℹ️ Usage: \`.goodbye on\` or \`.goodbye off\`\nCurrently: *${config.FEATURES.GOODBYE ? "ON" : "OFF"}*`
    );
  }

  config.FEATURES.GOODBYE = action === "on";
  await reply(sock, groupId, `👋 Goodbye messages are now *${action.toUpperCase()}*.`);
}

// ─── .play ────────────────────────────────────────────────────
async function playSong({ sock, msg, groupId, isGroup, args }) {
  if (!requireGroup(sock, msg, isGroup)) return;

  const query = args.join(" ").trim();
  if (!query) {
    return reply(sock, groupId, "❌ Please provide a song name.\nExample: `.play Afrobeat mix`");
  }

  await reply(sock, groupId, `🔍 Searching for: *${query}*...`);

  try {
    const results = await play.search(query, { source: { youtube: "video" }, limit: 1 });
    if (!results || results.length === 0) {
      return reply(sock, groupId, "❌ No results found. Try a different song name.");
    }

    const video = results[0];
    if (video.durationInSec > 600) {
      return reply(sock, groupId, "❌ Song is too long (max 10 minutes). Try a shorter one.");
    }

    await reply(
      sock, groupId,
      `🎵 *Now sending:* ${video.title}\n⏱️ Duration: ${Math.floor(video.durationInSec / 60)}:${String(video.durationInSec % 60).padStart(2, "0")}\n\n_Please wait..._`
    );

    const stream = await play.stream(video.url, { quality: 2 });

    await sock.sendMessage(groupId, {
      audio: { stream: stream.stream },
      mimetype: "audio/mp4",
      ptt: false,
    });
  } catch (err) {
    console.error("Play command error:", err);
    await reply(sock, groupId, "❌ Could not download the song. Try again or use a different name.");
  }
}

// ═════════════════════════════════════════════════════════════
//  AUTO-PROTECTION HANDLERS
//  Called from messageHandler.js for every group message
// ═════════════════════════════════════════════════════════════

async function runAntiLink(sock, msg, sender, groupId, body) {
  if (!body || !containsLink(body)) return false;

  try {
    const meta   = await sock.groupMetadata(groupId);
    const admins = meta.participants
      .filter((p) => p.admin)
      .map((p) => p.id);

    if (config.ANTI_LINK.ALLOW_ADMINS && admins.includes(sender)) return false;

    await sock.sendMessage(groupId, { delete: msg.key });

    const number = sender.replace("@s.whatsapp.net", "");
    const count  = (linkWarns.get(sender) || 0) + 1;
    linkWarns.set(sender, count);

    if (config.ANTI_LINK.WARN_BEFORE_KICK && count < 2) {
      await reply(
        sock, groupId,
        `⚠️ @${number}, links are *not allowed* in this group!\nWarning *${count}/2* — next time you will be removed.`,
        [sender]
      );
    } else {
      linkWarns.delete(sender);
      await reply(sock, groupId, `🚫 @${number} was removed for sending links.`, [sender]);
      await delay(500);
      await sock.groupParticipantsUpdate(groupId, [sender], "remove");
    }
    return true;
  } catch (err) {
    console.error("Anti-link error:", err);
    return false;
  }
}

async function runAntiSpam(sock, msg, sender, groupId) {
  const key  = `${groupId}:${sender}`;
  const now  = Date.now();
  const { MAX_MESSAGES, TIME_WINDOW_MS, WARN_BEFORE_KICK } = config.ANTI_SPAM;

  const timestamps = (spamCache.get(key) || []).filter((t) => now - t < TIME_WINDOW_MS);
  timestamps.push(now);
  spamCache.set(key, timestamps);

  if (timestamps.length <= MAX_MESSAGES) return false;
  spamCache.set(key, []);

  try {
    const meta   = await sock.groupMetadata(groupId);
    const admins = meta.participants.filter((p) => p.admin).map((p) => p.id);
    if (admins.includes(sender)) return false;

    const number  = sender.replace("@s.whatsapp.net", "");
    const warnKey = `spam:${groupId}:${sender}`;
    const warns   = (spamWarns.get(warnKey) || 0) + 1;

    if (WARN_BEFORE_KICK && warns < 2) {
      spamWarns.set(warnKey, warns);
      await reply(
        sock, groupId,
        `⚠️ @${number}, you are sending messages too fast! Slow down.\nWarning *${warns}/2*.`,
        [sender]
      );
    } else {
      spamWarns.delete(warnKey);
      await reply(sock, groupId, `🚫 @${number} was removed for spamming.`, [sender]);
      await delay(500);
      await sock.groupParticipantsUpdate(groupId, [sender], "remove");
    }
    return true;
  } catch (err) {
    console.error("Anti-spam error:", err);
    return false;
  }
}

async function runAntiWord(sock, msg, sender, groupId, body) {
  if (!body || !config.BANNED_WORDS.length) return false;

  const lower     = body.toLowerCase();
  const foundWord = config.BANNED_WORDS.find((w) => lower.includes(w));
  if (!foundWord) return false;

  try {
    const meta   = await sock.groupMetadata(groupId);
    const admins = meta.participants.filter((p) => p.admin).map((p) => p.id);
    if (admins.includes(sender)) return false;

    await sock.sendMessage(groupId, { delete: msg.key });

    const number  = sender.replace("@s.whatsapp.net", "");
    const warnKey = `word:${groupId}:${sender}`;
    const count   = (wordWarns.get(warnKey) || 0) + 1;
    wordWarns.set(warnKey, count);

    if (count < 2) {
      await reply(
        sock, groupId,
        `⚠️ @${number}, watch your language! That word is not allowed here.\nWarning *${count}/2*.`,
        [sender]
      );
    } else {
      wordWarns.delete(warnKey);
      await reply(sock, groupId, `🚫 @${number} was removed for using banned words.`, [sender]);
      await delay(500);
      await sock.groupParticipantsUpdate(groupId, [sender], "remove");
    }
    return true;
  } catch (err) {
    console.error("Anti-word error:", err);
    return false;
  }
}

// ═════════════════════════════════════════════════════════════
//  EXPORTS
// ═════════════════════════════════════════════════════════════

const commands = {
  menu,
  bot,
  tagall,
  tag: tagall,
  kick,
  remove: kick,
  promote,
  demote,
  mute,
  open,
  antilink,
  antispam,
  antiword,
  addword,
  removeword,
  badwords,
  welcome,
  goodbye,
  play: playSong,
};

module.exports = {
  commands,
  runAntiLink,
  runAntiSpam,
  runAntiWord,
};
