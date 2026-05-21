
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import cron from 'node-cron';

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const bot = new TelegramBot(TOKEN, { polling: true });

const topics = [
    'Narendra Modi India news',
    'PM Modi government update',
    'Tamil Nadu CM Vijay news',
    'Joseph Vijay Tamil Nadu politics',
    'Tamil Nadu current affairs'
];

async function fetchNews(query) {
    try {
        const date = new Date();
        date.setDate(date.getDate() - 2);
        const fromDate = date.toISOString().split('T')[0];

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&from=${fromDate}&apiKey=${NEWS_API_KEY}`;

        const res = await axios.get(url);

        let articles = res.data.articles || [];

        if (articles.length === 0) {
            const fallback = await axios.get(
                `https://newsapi.org/v2/top-headlines?country=in&pageSize=5&apiKey=${NEWS_API_KEY}`
            );
            articles = fallback.data.articles || [];
        }

        return articles;

    } catch (err) {
        console.error("Fetch error:", err.message);
        return [];
    }
}

function clean(text = '') {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function sendNews(chatId) {
    try {
        let msg = `📰 <b>Hourly Current Affairs Update</b>\n\n`;

        for (const topic of topics) {
            const news = await fetchNews(topic);

            msg += `━━━━━━━━━━━━━━\n`;
            msg += `🔍 <b>${clean(topic)}</b>\n\n`;

            if (!news.length) {
                msg += `No updates found.\n\n`;
                continue;
            }

            news.forEach((a, i) => {
                msg += `<b>${i + 1}. ${clean(a.title)}</b>\n`;
                msg += `📰 ${clean(a.source.name)}\n`;

                if (a.url) msg += `${a.url}\n`;

                msg += `\n`;
            });
        }

        await bot.sendMessage(chatId, msg, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        });

        console.log("News sent successfully");

    } catch (err) {
        console.error("Send error:", err.message);
    }
}

// /start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
        "✅ Bot Started!\nHourly PM Modi & CM Vijay updates enabled."
    );
});

// /news command
bot.onText(/\/news/, async (msg) => {
    await bot.sendMessage(msg.chat.id, "Fetching news...");
    await sendNews(msg.chat.id);
});

// ⏰ every 1 hour
cron.schedule('0 * * * *', async () => {
    console.log("Running hourly update...");
    await sendNews(CHAT_ID);
}, {
    timezone: "Asia/Kolkata"
});

console.log("Bot is running...");
```
