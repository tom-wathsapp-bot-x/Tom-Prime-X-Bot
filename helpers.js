/**
 * Parses a raw message body into a command name and arguments array.
 *
 * Example:
 *   getCommand(".kick @user1 @user2", ".") → { command: "kick", args: ["@user1", "@user2"] }
 */
function getCommand(body, prefix) {
  const withoutPrefix = body.slice(prefix.length).trim();
  const parts = withoutPrefix.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  return { command, args };
}

/**
 * Returns true if the given string contains a URL-like pattern.
 */
function containsLink(text) {
  const urlPattern =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|net|org|io|me|co|ly|in|pk|ng|gh|za|info|online|site|app|dev|xyz)[^\s]*)/gi;
  return urlPattern.test(text);
}

/**
 * Formats a WhatsApp JID into a readable phone number string.
 * "15551234567@s.whatsapp.net" → "15551234567"
 */
function formatNumber(jid) {
  return jid.replace(/@.+/, "");
}

module.exports = { getCommand, containsLink, formatNumber };
