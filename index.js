const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require('express');
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

let server = require('./qr'); // au './qr' kama umeipa jina hilo
let code = require('./code'); // hakikisha code.js ipo

require('events').EventEmitter.defaultMaxListeners = 500;

app.use('/qr', server);
app.use('/code', code);

app.use('/pair', async (req, res, next) => {
  res.sendFile(__path + '/pair.html');
});
app.use('/', async (req, res, next) => {
  res.sendFile(__path + '/main.html');
});

app.get('/qr', (req, res) => {
  res.sendFile(__path + '/qr.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`
Don't Forgot To Give Star

 Server running on http://localhost:` + PORT)
});

module.exports = app;

async function startBot() {
  const sessionName = "Peterjoramqrcode";
  const { state, saveCreds } = await useMultiFileAuthState(`./auth_info/${sessionName}`);

  const sock = makeWASocket({
    auth: state,
    // ongeza options nyingine kama unahitaji
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "open") {
      console.log("✅ Bot imeunganishwa na WhatsApp!");
    }
    if (connection === "close") {
      console.log("❌ Connection closed.");
    }
  });
}

startBot();