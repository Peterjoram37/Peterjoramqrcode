const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

const sessionName = "Peterjoramqrcode";
const { state, saveCreds } = await useMultiFileAuthState(`./auth_info/${sessionName}`);

const sock = makeWASocket({
  auth: state,
  // ...
});
