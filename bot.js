const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = '@AnbudanMiththiranBot';

const bot = new TelegramBot(TOKEN);

const FILE = 'lastpost.txt';

async function checkPost() {
  try {
    const { data } = await axios.get(
      'https://www.anbumiththiran.in/index.html'
    );

    const $ = cheerio.load(data);

    const latest = $('a[href*="post.html?id="]')
      .first()
      .attr('href');

    if (!latest) return;

    let old = '';

    if (fs.existsSync(FILE)) {
      old = fs.readFileSync(FILE, 'utf8');
    }

    if (latest !== old) {
      fs.writeFileSync(FILE, latest);

      const full =
        'https://www.anbumiththiran.in/' + latest;

      await bot.sendMessage(
        CHAT_ID,
        `🆕 புதிய பதிவு!\n\n📖 ${full}`
      );

      console.log('Posted:', full);
    }
  } catch (e) {
    console.log(e);
  }
}

checkPost();
