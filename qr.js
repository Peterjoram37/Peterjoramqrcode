// filepath: [session-generator.js](http://_vscodecontentref_/1)
const express = require("express");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");

const router = express.Router();

function makeid(length = 8) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

router.get("/", async (req, res) => {
  const id = makeid();
  const authDir = path.join(__dirname, "temp", id);
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  let sent = false;

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;
    if (qr && !sent) {
      sent = true;
      const qrImage = await QRCode.toDataURL(qr);
      res.send(`
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f9f9f9;">
          <h2 style="margin-bottom:24px;">Scan this QR Code with WhatsApp</h2>
          <img src="${qrImage}" style="width:320px;height:320px;box-shadow:0 4px 24px #0002;border-radius:16px;background:#fff;padding:16px;" />
          <p style="margin-top:24px;color:#555;">Open WhatsApp &gt; Menu &gt; Linked Devices &gt; Scan QR</p>
        </div>
      `);
    }

    if (connection === "open") {
      // Soma credentials na tuma kwa aliyescan
      await delay(2000);
      const credsPath = path.join(authDir, "creds.json");
      if (fs.existsSync(credsPath)) {
        const data = fs.readFileSync(credsPath);
        const b64data = Buffer.from(data).toString("base64");
        await sock.sendMessage(sock.user.id, { text: `SESSION BASE64:\n${b64data}` });
      }
      await delay(1000);
      await sock.ws.close();
      removeDir(authDir);
    }
  });

  sock.ev.on("creds.update", saveCreds);
});

module.exports = router;