const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require("express");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const app = express();
const port = 5000;

app.get("/generate", async (req, res) => {
  // Tumia jina la session sawa na index.js
  const sessionId = "Peterjoramqrcode";
  const authDir = `./auth_info/${sessionId}`;

  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;
    if (qr) {
      console.log(`\n📷 Scan QR code for session: ${sessionId}\n`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log(`✅ Connected! Session saved as: ${sessionId}`);
      res.send(`✅ Session connected and saved: ${sessionId}`);
      sock.end();
    }

    if (connection === "close") {
      const shouldReconnect = update.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection closed. Reconnect?", shouldReconnect);
    }
  });

  sock.ev.on("creds.update", saveCreds);
});

app.listen(port, () => {
  console.log(`🔌 QR Session Generator running on http://localhost:${port}`);
});