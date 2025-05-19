// filepath: [session-generator.js](http://_vscodecontentref_/1)
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require("express");
const QRCode = require("qrcode"); // badilisha hapa
const fs = require("fs");

const app = express();
const port = 5000;

app.get("/generate", async (req, res) => {
  const sessionId = "Peterjoramqrcode";
  const authDir = `./auth_info/${sessionId}`;

  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // usionyeshe tena terminal
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;
    if (qr) {
      // Tuma QR code kama image kwenye browser
      const qrImage = await QRCode.toDataURL(qr);
      res.send(`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f9f9f9;">
    <h2 style="margin-bottom:24px;">Scan this QR Code with WhatsAppBot</h2>
    <img src="${qrImage}" style="width:320px;height:320px;box-shadow:0 4px 24px #0002;border-radius:16px;background:#fff;padding:16px;" />
    <p style="margin-top:24px;color:#555;">Open WhatsApp &gt; Menu &gt; Linked Devices &gt; Scan QR</p>
  </div>
      `);
    }

    if (connection === "open") {
      console.log(`✅ Connected! Session saved as: ${sessionId}`);
      // usitume tena response hapa, tayari imetumwa
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