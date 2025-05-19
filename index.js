const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

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