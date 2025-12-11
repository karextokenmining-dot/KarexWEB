// Telegram Bot - Karex Token Mini App
const { Telegraf, Markup } = require('telegraf');
const mysql = require('mysql2/promise');
require('dotenv').config(); // .env dosyası ile token ve DB bilgilerini alacağız

// Telegram Bot Token
const bot = new Telegraf(process.env.BOT_TOKEN);

// Veritabanı bağlantısı
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

// /start komutu
bot.start(async (ctx) => {
    const telegram_id = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    // Kullanıcıyı veritabanına ekle
    await db.query(
        'INSERT IGNORE INTO users (telegram_id, username) VALUES (?, ?)',
        [telegram_id, username]
    );

    await ctx.reply(`Selam ${username}! Kazım yapmak için aşağıdaki butona tıkla.`,
        Markup.inlineKeyboard([
            Markup.button.callback('Kazım Yap', 'mine')
        ])
    );
});

// Click mining
bot.action('mine', async (ctx) => {
    const telegram_id = ctx.from.id;
    // 0.1 - 0.5 TonCoin rastgele
    const amount = (Math.random() * 0.4 + 0.1).toFixed(2);

    // Bakiye güncelle
    await db.query(
        'UPDATE users SET balance = balance + ? WHERE telegram_id = ?',
        [amount, telegram_id]
    );

    // Mining history kaydı
    await db.query(
        'INSERT INTO mining_history (telegram_id, amount) VALUES (?, ?)',
        [telegram_id, amount]
    );

    await ctx.answerCbQuery(`Kazandın: ${amount} TonCoin!`);
});

bot.launch();
console.log("Karex Token Bot çalışıyor!");
