const config = require("../../config");

/**
 * .menu — Shows all available commands
 */
module.exports = async function menu({ sock, msg, groupId, isGroup }) {
  const prefix = config.BOT_PREFIX;
  const botName = config.BOT_NAME;

  const menuText = `
╔══════════════════════════╗
║   *${botName}*
╚══════════════════════════╝

*👥 Group Management*
▸ \`${prefix}tagall\` — Tag all members
▸ \`${prefix}kick @user\` — Remove a member
▸ \`${prefix}promote @user\` — Make someone admin
▸ \`${prefix}demote @user\` — Remove admin role

*🛡️ Group Protections*
▸ \`${prefix}antilink on/off\` — Toggle anti-link
▸ \`${prefix}antispam on/off\` — Toggle anti-spam
▸ \`${prefix}welcome on/off\` — Toggle welcome messages

*ℹ️ General*
▸ \`${prefix}menu\` — Show this menu

_All admin commands require group admin privileges._
`.trim();

  const target = isGroup ? groupId : msg.key.remoteJid;
  await sock.sendMessage(target, { text: menuText });
};
