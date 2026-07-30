const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

async function startBot() {
    // Gestione della sessione
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // Deseleziona il QR Code ASCII
    });

    // Se non è ancora collegato a WhatsApp, richiede il Pairing Code
    if (!sock.authState.creds.registered) {
        // ⚠️ INSERISCI IL TUO NUMERO CON PREFISSO (es. 393123456789 per l'Italia)
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

    // Gestione degli eventi di connessione
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connessione chiusa. Riconnessione in corso...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot connesso con successo a WhatsApp!');
        }
    });

    // Salva le credenziali aggiornate
    sock.ev.on('creds.update', saveCreds);
}

startBot();
