const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function startBot() {
    // 🧹 Pulisce automaticamente la sessione vecchia all'avvio per evitare errori
    const sessionDir = 'auth_info_baileys';
    if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log("🧹 Vecchia sessione pulita con successo!");
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    if (!sock.authState.creds.registered) {
        // ⚠️ Inserisci qui il tuo numero con prefisso (es. 39 per l'Italia), senza il +
        const phoneNumber = "393505980684"; 

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log("\n=================================");
                console.log(`IL TUO CODICE WHATSAPP È: ${code}`);
                console.log("=================================\n");
            } catch (error) {
                console.error("Errore nella richiesta del codice:", error);
            }
        }, 5000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot connesso con successo a WhatsApp!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startBot();
