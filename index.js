const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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

    // COMANDO ID GRUPPO
    if (body === '!id') {
        msg.reply(`ID Chat: ${chat.id._serialized}`);
    }

    // MINIGIOCO: Dado
    if (body === '!dado') {
        const numero = Math.floor(Math.random() * 6) + 1;
        msg.reply(`🎲 Hai lanciato un **${numero}**!`);
    }

    // MINIGIOCO: Testa o Croce
    if (body === '!moneta') {
        const risultato = Math.random() < 0.5 ? '🪙 TESTA!' : '🪙 CROCE!';
        msg.reply(risultato);
    }

    // MODERAZIONE: Ban/Kick (Funziona se il bot è Admin)
    if (chat.isGroup && (body.startsWith('!ban') || body.startsWith('!kick'))) {
        const authorId = msg.author || msg.from;
        const isAdmin = chat.participants.some(p => p.id._serialized === authorId && p.isAdmin);

        if (!isAdmin) {
            return msg.reply('❌ Solo gli admin possono usare questo comando!');
        }

        let targetUser = msg.mentionedIds[0];
        if (!targetUser && msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            targetUser = quotedMsg.author || quotedMsg.from;
        }

        if (targetUser) {
            try {
                await chat.removeParticipants([targetUser]);
                msg.reply('🔨 Utente rimosso dal gruppo!');
            } catch (err) {
                msg.reply('⚠️ Assicurati che il bot sia Amministratore del gruppo!');
            }
        } else {
            msg.reply('👉 Menziona un utente o rispondi al suo messaggio per bannarlo.');
        }
    }
});

client.initialize();
