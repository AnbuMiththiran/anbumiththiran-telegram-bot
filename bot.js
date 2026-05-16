const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const CHANNEL = process.env.CHANNEL;
const SITE = "https://www.anbumiththiran.in/index.html";

// store last published post
let lastPost = "";

/* =========================
   GET LATEST POST FROM SITE
========================= */
async function getLatestPost() {
  try {
    const { data } = await axios.get(SITE);
    const $ = cheerio.load(data);

    const link = $('a[href*="post.html?id="]').first().attr("href");
    if (!link) return null;

    return "https://www.anbumiththiran.in/" + link;
  } catch (err) {
    console.error("Error fetching site:", err.message);
    return null;
  }
}

/* =========================
   COMMAND: /postnow
========================= */
bot.onText(/\/postnow/, async (msg) => {
  const chatId = msg.chat.id;
  const post = await getLatestPost();

  if (!post) {
    return bot.sendMessage(chatId, "❌ No post found");
  }

  if (post === lastPost) {
    return bot.sendMessage(chatId, "ℹ️ Already posted this link");
  }

  await bot.sendMessage(CHANNEL, `🆕 New Post\n\n${post}`);
  lastPost = post;

  bot.sendMessage(chatId, "✅ Posted to channel");
});

/* =========================
   COMMAND: /latest
========================= */
bot.onText(/\/latest/, async (msg) => {
  const chatId = msg.chat.id;
  const post = await getLatestPost();

  if (!post) {
    return bot.sendMessage(chatId, "❌ No post found");
  }

  bot.sendMessage(chatId, `📌 Latest Post:\n\n${post}`);
});

/* =========================
   AUTO CHECK EVERY 1 MIN
========================= */
setInterval(async () => {
  try {
    const post = await getLatestPost();

    if (post && post !== lastPost) {
      lastPost = post;
      await bot.sendMessage(CHANNEL, `🆕 Auto New Post\n\n${post}`);
      console.log("Posted:", post);
    } else {
      console.log("No new post found");
    }
  } catch (err) {
    console.error("Auto-check error:", err.message);
  }
}, 60000);

console.log("Bot running...");
