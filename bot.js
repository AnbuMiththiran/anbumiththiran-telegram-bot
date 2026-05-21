
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import cron from 'node-cron';

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const bot = new TelegramBot(TOKEN, { polling: true });

const topics = [
    'Vijay Tamil Nadu politics',
    'PM Modi'
];

async function fetchNews(query) {

    try {

        const today = new Date().toISOString().split('T')[0];

        const url =
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&from=${today}&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`;

        const response = await axios.get(url);

        return response.data.articles || [];

    } catch (error) {

        console.error(`Error fetching news for ${query}:`, error.message);

        return [];
    }
}

function escapeHTML(text) {

    if (!text) return '';

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function sendDailyNews(chatId) {

    try {

        let finalMessage =
            `📰 <b>Daily Political News Update</b>\n\n`;

        for (const topic of topics) {

            const news = await fetchNews(topic);

            finalMessage += `━━━━━━━━━━━━━━\n`;
            finalMessage += `🔍 <b>${escapeHTML(topic)}</b>\n\n`;

            if (news.length === 0) {

                finalMessage += `No news found.\n\n`;

                continue;
            }

            news.forEach((article, index) => {

                finalMessage +=
                    `<b>${index + 1}. ${escapeHTML(article.title)}</b>\n`;

                finalMessage +=
                    `${escapeHTML(article.source.name)}\n`;

                if (article.url) {
                    finalMessage += `${article.url}\n`;
                }

                finalMessage += `\n`;
            });
        }

        await bot.sendMessage(chatId, finalMessage, {
            parse_mode: 'HTML',
            disable_web_page_preview: false
        });

        console.log('News sent successfully.');

    } catch (error) {

        console.error('Error sending news:', error.message);
    }
}

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(
        msg.chat.id,
        `✅ Political News Bot Started.\n\nUse /news to get latest updates.`
    );
});

bot.onText(/\/news/, async (msg) => {

    await bot.sendMessage(
        msg.chat.id,
        'Fetching latest news...'
    );

    await sendDailyNews(msg.chat.id);
});

// Runs every day at 8:00 AM IST
cron.schedule(
    '0 8 * * *',
    async () => {

        console.log('Running scheduled news update...');

        await sendDailyNews(CHAT_ID);

    },
    {
        timezone: 'Asia/Kolkata'
    }
);

console.log('Bot is running...');
