const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const http = require('http');

// Server fittizio per attivare il piano GRATUITO di Render (Web Service)
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot WhatsApp Online!');
}).listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('--- CODICE QR PRONTO ---');
});

client.on('ready', () => {
    console.log('🤖 Bot WhatsApp pronto e attivo!');
});

client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const body = msg.body.toLowerCase();

    if (body === '!dado') {
        const numero = Math.floor(Math.random() * 6) + 1;
        msg.reply(`🎲 Hai lanciato un **${numero}**!`);
    }

    if (body === '!moneta') {
        const risultato = Math.random() < 0.5 ? '🪙 TESTA!' : '🪙 CROCE!';
        msg.reply(risultato);
    }
});

client.initialize();
