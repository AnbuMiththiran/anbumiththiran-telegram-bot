import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const bot = new TelegramBot(TOKEN, { polling: true });

async function fetchNews(query) {
    try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`;

        const response = await axios.get(url);

        return response.data.articles || [];
    } catch (error) {
        console.error(`Error fetching news for ${query}:`, error.message);
        return [];
    }
}

async function sendDailyNews() {
    try {
        const topics = [
            "Vijay Tamil Nadu politics",
            "PM Modi"
        ];

        let finalMessage = `📰 *Daily Political News Update*\n\n`;

        for (const topic of topics) {
            const news = await fetchNews(topic);

            finalMessage += `━━━━━━━━━━━━━━\n`;
            finalMessage += `🔍 *${topic}*\n\n`;

            if (news.length === 0) {
                finalMessage += `No news found.\n\n`;
                continue;
            }

            news.forEach((article, index) => {
                finalMessage += `*${index + 1}. ${article.title}*\n`;
                finalMessage += `${article.source.name}\n`;

                if (article.url) {
                    finalMessage += `${article.url}\n`;
                }

                finalMessage += `\n`;
            });
        }

        await bot.sendMessage(CHAT_ID, finalMessage, {
            parse_mode: 'Markdown'
        });

        console.log("Daily news sent successfully.");

    } catch (error) {
        console.error("Error sending daily news:", error.message);
    }
}

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        `✅ CM Vijay & PM Modi News Bot Started.\n\nYou will receive daily news updates automatically.`
    );
});

bot.onText(/\/news/, async (msg) => {
    bot.sendMessage(msg.chat.id, "Fetching latest news...");

    await sendDailyNews();
});

// Daily at 8:00 AM
cron.schedule('0 8 * * *', async () => {
    console.log("Running scheduled news fetch...");
    await sendDailyNews();
});

console.log("Bot is running...");
