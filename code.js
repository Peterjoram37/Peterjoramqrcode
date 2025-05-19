const express = require('express');
const { default: Peter_Tech, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers } = require("maher-zubair-baileys");
const pino = require("pino");
const fs = require('fs');
const { makeid } = require('./id');
const router = express.Router();

function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
};

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    if (!num) return res.json({ code: "No number provided" });

    async function GET_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let PairCodeSock = Venocyber_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: ["Chrome (Linux)", "", ""]
            });

            if(!PairCodeSock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g,'');
                const code = await PairCodeSock.requestPairingCode(num);
                if(!res.headersSent){
                    await res.json({ code });
                }
            }

            PairCodeSock.ev.on('creds.update', saveCreds);
            PairCodeSock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection == "open") {
                    await delay(100);
                    await PairCodeSock.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    GET_PAIR_CODE();
                }
            });
        } catch (err) {
            await removeFile('./temp/' + id);
            if(!res.headersSent){
                await res.json({ code: "Service Unavailable" });
            }
        }
    }
    return await GET_PAIR_CODE();
});

module.exports = router;