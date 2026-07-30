const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const http = require('http');

// Server HTTP per mantenere attivo il Web Service su Render
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot WhatsApp Online!');
}).listen(process.env.PORT || 3000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });


    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('--- SCANSIONA QUESTO CODICE QR ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('🤖 Bot WhatsApp pronto e attivo!');
        } else if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Connessione chiusa. Riconnessione:', shouldReconnect);
            if (shouldReconnect) startBot();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;

            const from = msg.key.remoteJid;
            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase();

            // COMANDO: Dado
            if (text === '!dado') {
                const numero = Math.floor(Math.random() * 6) + 1;
                await sock.sendMessage(from, { text: `🎲 Hai lanciato un **${numero}**!` });
            }

            // COMANDO: Moneta
            if (text === '!moneta') {
                const risultato = Math.random() < 0.5 ? '🪙 TESTA!' : '🪙 CROCE!';
                await sock.sendMessage(from, { text: risultato });
            }
        }
    });
}

startBot();
