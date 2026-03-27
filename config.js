/**
 * ============================================================
 *   Tom's WhatsApp Group Bot - Configuration File
 *   Edit this file to customize your bot settings.
 * ============================================================
 */

module.exports = {
  // ─── Bot Identity ──────────────────────────────────────────
  BOT_NAME: "Tom's Bot",
  BOT_PREFIX: ".",        // Command prefix. E.g. ".menu", ".tagall"
  OWNER_NUMBER: "8801892625209",  // Your WhatsApp number (with country code, no +)

  // ─── Connection Method ─────────────────────────────────────
  // "qr"   → Scan a QR code in the terminal when the bot starts
  // "link" → Get a pairing code you type into WhatsApp on your phone
  CONNECTION_METHOD: "qr",

  // If using "link" method, put your number here (with country code, no +)
  PAIRING_NUMBER: "8801714821271",

  // ─── Group Features ────────────────────────────────────────
  FEATURES: {
    WELCOME: true,          // Send welcome message when someone joins
    GOODBYE: true,          // Send goodbye message when someone leaves
    ANTI_LINK: true,        // Remove messages that contain links
    ANTI_SPAM: true,        // Remove repeated/spam messages
  },

  // ─── Anti-Spam Settings ────────────────────────────────────
  ANTI_SPAM: {
    MAX_MESSAGES: 5,        // Max messages allowed within the time window
    TIME_WINDOW_MS: 5000,   // Time window in milliseconds (5 seconds)
    WARN_BEFORE_KICK: true, // Warn user before kicking them
  },

  // ─── Anti-Link Settings ────────────────────────────────────
  ANTI_LINK: {
    WARN_BEFORE_KICK: true, // Warn user before kicking them
    ALLOW_ADMINS: true,     // Allow admins to post links
  },

  // ─── Welcome & Goodbye Messages ────────────────────────────
  // Available placeholders:
  //   {name}    → The user's name
  //   {group}   → The group name
  //   {members} → Current number of group members
  WELCOME_MESSAGE: `👋 Welcome to *{group}*, @{number}!\n\nWe now have *{members}* members.\nPlease read the group rules and enjoy your stay! 🎉`,
  GOODBYE_MESSAGE: `👋 *@{number}* has left *{group}*.\n\nWe'll miss you! The group now has *{members}* members.`,

  // ─── Session Storage ───────────────────────────────────────
  // Folder where your login session is saved.
  // Do NOT share or upload this folder to GitHub!
  SESSION_FOLDER: "./session",

  // ─── Logging ───────────────────────────────────────────────
  LOG_LEVEL: "info",  // "debug" | "info" | "warn" | "error"
};
