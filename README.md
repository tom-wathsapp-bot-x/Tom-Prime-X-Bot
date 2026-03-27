# Tom's WhatsApp Group Bot

A powerful, easy-to-set-up WhatsApp group management bot built with Node.js and [Baileys](https://github.com/WhiskeySockets/Baileys).

**Created by Tom**

---

## Features

| Feature | Command / Trigger |
|---|---|
| 📋 Command menu | `.menu` |
| 📢 Tag all members | `.tagall [message]` |
| 👋 Welcome new members | Auto (when someone joins) |
| 👋 Goodbye message | Auto (when someone leaves) |
| 🔗 Anti-link protection | Auto + `.antilink on/off` |
| 🚫 Anti-spam protection | Auto + `.antispam on/off` |
| 👢 Kick a member | `.kick @user` |
| ⬆️ Promote to admin | `.promote @user` |
| ⬇️ Demote from admin | `.demote @user` |
| 🔔 Toggle welcome/goodbye | `.welcome on/off` |

---

## Requirements

- **Node.js 18 or higher** — Download from [nodejs.org](https://nodejs.org)
- An active **WhatsApp account** to use as the bot number

---

## Setup (Quick Start)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the bot

Open `config.js` and update the following:

```js
BOT_NAME: "Tom's Bot",        // Your bot's display name
BOT_PREFIX: ".",               // Command prefix (.menu, .kick, etc.)
OWNER_NUMBER: "1234567890",    // Your WhatsApp number (with country code, NO +)
CONNECTION_METHOD: "qr",       // "qr" to scan QR code, or "link" for pairing code
```

### 4. Start the bot

```bash
npm start
```

---

## Connecting to WhatsApp

### Option A: QR Code (Default)

1. Set `CONNECTION_METHOD: "qr"` in `config.js`
2. Run `npm start`
3. Scan the QR code shown in the terminal using WhatsApp:
   - Open WhatsApp → tap ⋮ (3 dots) → **Linked Devices** → **Link a Device**
4. The bot will say `✅ Connected!` when ready

### Option B: Pairing Code (Phone Link)

1. Set `CONNECTION_METHOD: "link"` in `config.js`
2. Set `PAIRING_NUMBER` to your WhatsApp number (with country code, no `+`)
3. Run `npm start`
4. A **8-digit code** will appear in the terminal (e.g. `ABCD-1234`)
5. In WhatsApp → **Linked Devices** → **Link with phone number** → enter the code

---

## Commands Reference

> All admin commands require the bot to be a group admin.

### General
| Command | Description |
|---|---|
| `.menu` | Shows all available commands |

### Group Management (Admin only)
| Command | Description |
|---|---|
| `.tagall` | Tags all group members |
| `.tagall Hey everyone!` | Tags all with a custom message |
| `.kick @user` | Removes the tagged user from the group |
| `.promote @user` | Promotes tagged user to group admin |
| `.demote @user` | Removes admin role from tagged user |

### Group Settings (Admin only)
| Command | Description |
|---|---|
| `.antilink on` | Enable anti-link protection |
| `.antilink off` | Disable anti-link protection |
| `.antispam on` | Enable anti-spam protection |
| `.antispam off` | Disable anti-spam protection |
| `.welcome on` | Enable welcome & goodbye messages |
| `.welcome off` | Disable welcome & goodbye messages |

---

## Important Notes

- **Make the bot a group admin** — Most features (kick, promote, demote, anti-link removal) require the bot to have admin privileges in the group.
- **Session folder is private** — The `session/` folder stores your login. Never upload it to GitHub. It is already in `.gitignore`.
- **One number per bot** — The WhatsApp number you connect becomes the bot. You won't be able to use it on your phone normally while it's connected.

---

## Folder Structure

```
├── config.js              ← All settings are here
├── src/
│   ├── index.js           ← Bot entry point
│   ├── commands/          ← One file per command
│   │   ├── index.js
│   │   ├── menu.js
│   │   ├── tagall.js
│   │   ├── kick.js
│   │   ├── promote.js
│   │   ├── demote.js
│   │   ├── antilink.js
│   │   ├── antispam.js
│   │   └── welcome.js
│   ├── handlers/
│   │   ├── messageHandler.js   ← Routes messages to commands
│   │   └── groupHandler.js     ← Handles join/leave events
│   └── utils/
│       ├── guards.js       ← Admin & group checks
│       ├── helpers.js      ← URL detection, command parsing
│       ├── antiLink.js     ← Anti-link logic
│       └── antiSpam.js     ← Anti-spam logic
├── session/               ← Login session (auto-created, gitignored)
├── .gitignore
└── package.json
```

---

## Adding New Commands

1. Create a new file in `src/commands/`, e.g. `src/commands/greet.js`:

```js
module.exports = async function greet({ sock, groupId, args }) {
  await sock.sendMessage(groupId, { text: `Hello, ${args[0] || "world"}!` });
};
```

2. Register it in `src/commands/index.js`:

```js
const greet = require("./greet");
module.exports = { ..., greet };
```

3. Use it in WhatsApp: `.greet Tom`

---

## License

MIT — Free to use, share, and modify.
