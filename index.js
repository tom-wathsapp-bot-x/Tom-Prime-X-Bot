const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const fs = require("fs-extra");
const config = require("../config");
const { handleMessage } = require("./handlers/messageHandler");
const { handleGroupUpdate } = require("./handlers/groupHandler");

const logger = pino({
  level: config.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

async function startBot() {
  await fs.ensureDir(config.SESSION_FOLDER);

  const { state, saveCreds } = await useMultiFileAuthState(
    config.SESSION_FOLDER
  );
  const { version } = await fetchLatestBaileysVersion();

  logger.info(`Starting ${config.BOT_NAME}...`);
  logger.info(`Using WA version: ${version.join(".")}`);
  logger.info(`Connection method: ${config.CONNECTION_METHOD}`);

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: [config.BOT_NAME, "Chrome", "1.0.0"],
    markOnlineOnConnect: true,
  });

  // ─── Connection Events ───────────────────────────────────────
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      if (config.CONNECTION_METHOD === "qr") {
        console.log("\n");
        logger.info("Scan the QR code below with WhatsApp:");
        console.log("\n");
        qrcode.generate(qr, { small: true });
        console.log("\n");
      } else if (
        config.CONNECTION_METHOD === "link" &&
        !sock.authState.creds.registered
      ) {
        const pairingNumber = config.PAIRING_NUMBER.replace(/[^0-9]/g, "");
        try {
          const code = await sock.requestPairingCode(pairingNumber);
          const formatted = code?.match(/.{1,4}/g)?.join("-") || code;
          logger.info("──────────────────────────────────────");
          logger.info(`Your pairing code: ${formatted}`);
          logger.info(
            "Go to WhatsApp → Settings → Linked Devices → Link with phone number"
          );
          logger.info("──────────────────────────────────────");
        } catch (err) {
          logger.error({ err }, "Failed to get pairing code");
        }
      }
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;

      if (reason === DisconnectReason.loggedOut) {
        logger.warn(
          "Logged out from WhatsApp. Deleting session and restarting..."
        );
        await fs.remove(config.SESSION_FOLDER);
      } else {
        logger.warn(
          { reason },
          "Connection closed. Reconnecting in 3 seconds..."
        );
      }

      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      }
    }

    if (connection === "open") {
      logger.info(`✅ ${config.BOT_NAME} is now connected to WhatsApp!`);
      logger.info(`Prefix: "${config.BOT_PREFIX}"  |  Owner: ${config.OWNER_NUMBER}`);
    }
  });

  // ─── Save Credentials ────────────────────────────────────────
  sock.ev.on("creds.update", saveCreds);

  // ─── Incoming Messages ───────────────────────────────────────
  sock.ev.on("messages.upsert", async (m) => {
    await handleMessage(sock, m);
  });

  // ─── Group Participant Updates (join/leave) ───────────────────
  sock.ev.on("group-participants.update", async (update) => {
    await handleGroupUpdate(sock, update);
  });
}

startBot().catch((err) => {
  console.error("Failed to start bot:", err);
  process.exit(1);
});
