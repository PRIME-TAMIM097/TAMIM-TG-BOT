const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

const BOT_TOKEN = "8643206314:AAG4W1fqTepqktrE_xzxbn4KI9GY1x1X188";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ─────────────────────────────────────────
//  DOWNLOAD API (from autodl.js)
// ─────────────────────────────────────────
const DOWNLOAD_API = "https://xsaim8x-xxx-api.onrender.com/api/auto";

const DOMAINS = [
  "facebook.com", "fb.watch", "fb.com",
  "youtube.com", "youtu.be",
  "tiktok.com",
  "instagram.com", "instagr.am",
  "spotify.com", "soundcloud.com",
  "twitter.com", "x.com",
  "pinterest.com", "pin.it",
  "likee.com", "likee.video"
];

// ─────────────────────────────────────────
//  BABY CHAT API (from baby.js)
// ─────────────────────────────────────────
let cachedApiUrl = null;
const getBaseApiUrl = async () => {
  if (cachedApiUrl) return cachedApiUrl;
  const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  cachedApiUrl = res.data.mahmud;
  return cachedApiUrl;
};

// baby trigger words (from baby.js)
const BABY_TRIGGERS = [
  "baby", "bby", "babu", "bbu", "jan", "bot",
  "জান", "জানু", "বেবি", "wifey", "marin"
];

// random replies when only trigger word sent (from baby.js)
const RANDOM_REPLIES = [
  "Bolo baby 😒", "I love you 😘", "type /chat hi",
  "babu khuda lagse🥺", "Hop beda😾, Boss বল boss😼",
  "আমাকে ডাকলে কিস করে দেবো😘",
  "mb ney bye", "meww",
  "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
  "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘", "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏",
  "গোসল করে আসো যাও😑😩",
  "বলেন sir__😌", "বলেন ম্যাডাম__😌",
  "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
  "𝗕𝗯𝘆 না জানু, বল 😌",
  "বেশি bby Bbby করলে leave নিবো কিন্তু 😒",
  "__বেশি বেবি বললে কামুর দিমু 🤭",
  "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂",
  "bolo baby😒",
  "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🫣",
  "Meow🐤", "🐤🐤",
  "হা বলো😒, কি করতে পারি😐?",
  "আজব তো__😒",
  "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤",
  "খাওয়া দাওয়া করসো 🙄",
  "কথা দেও আমাকে পটাবা...!! 😌",
  "বার বার ডাকলে মাথা গরম হয় কিন্তু 😑",
  "বলো জানু 😒",
  "কি হলো, মিস টিস করচ্ছো নাকি 🤣",
  "আমি হাজারো মশার Crush😓",
  "ছেলেদের প্রতি আমার এক আকাশ পরিমান শরম🥹🫣",
  "মন সুন্দর বানাও মুখের জন্য তো Snapchat আছেই! 🌚"
];

// ─────────────────────────────────────────
//  HELPER: detect platform
// ─────────────────────────────────────────
function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/i.test(url)) return "𝐘𝐨𝐮𝐓𝐮𝐛𝐞";
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) return "𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤";
  if (/tiktok\.com/i.test(url)) return "𝐓𝐢𝐤𝐓𝐨𝐤";
  if (/instagram\.com|instagr\.am/i.test(url)) return "𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦";
  if (/spotify\.com/i.test(url)) return "Spotify";
  if (/soundcloud\.com/i.test(url)) return "SoundCloud";
  if (/twitter\.com|x\.com/i.test(url)) return "Twitter/X";
  return null;
}

function isVideoLink(text) {
  return DOMAINS.some(d => text.toLowerCase().includes(d));
}

// ─────────────────────────────────────────
//  /start
// ─────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "Friend";
  bot.sendMessage(msg.chat.id,
    `✨ *Welcome, ${name}!*\n\n` +
    `🤖 I'm *TAMIM BOT* — your Telegram assistant!\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `📥 *Video Download*\n` +
    `➜ Just send any video link!\n` +
    `➜ YouTube, Facebook, TikTok, Instagram & more\n\n` +
    `💬 *AI Chat*\n` +
    `➜ Say: bby, baby, jan, bot...\n` +
    `➜ Or use /chat <message>\n\n` +
    `📋 *Commands*\n` +
    `➜ /help — All commands\n` +
    `➜ /dl <url> — Download video\n` +
    `➜ /chat <msg> — Chat with AI\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `_Made with ❤️ by Tamim_`,
    { parse_mode: "Markdown" }
  );
});

// ─────────────────────────────────────────
//  /help
// ─────────────────────────────────────────
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📋 *TAMIM BOT — Help Menu*\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `📥 *Downloader*\n` +
    `➜ /dl <url>\n` +
    `➜ Or just send the link!\n\n` +
    `🌐 *Supported Platforms*\n` +
    `➜ YouTube, Facebook, TikTok\n` +
    `➜ Instagram, Twitter, Spotify & more\n\n` +
    `💬 *AI Chat (Baby Bot)*\n` +
    `➜ /chat <message>\n` +
    `➜ Say: bby, baby, jan, bot...\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `_TAMIM BOT v2.0_`,
    { parse_mode: "Markdown" }
  );
});

// ─────────────────────────────────────────
//  /dl command
// ─────────────────────────────────────────
bot.onText(/\/dl (.+)/, async (msg, match) => {
  await handleDownload(msg.chat.id, match[1].trim());
});

// ─────────────────────────────────────────
//  /chat command
// ─────────────────────────────────────────
bot.onText(/\/chat (.+)/, async (msg, match) => {
  await handleBabyChat(msg.chat.id, match[1].trim());
});

// ─────────────────────────────────────────
//  Auto detect message
// ─────────────────────────────────────────
bot.on("message", async (msg) => {
  const text = msg.text || "";
  if (text.startsWith("/")) return;

  // 1. Check if video link
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch && isVideoLink(urlMatch[0])) {
    await handleDownload(msg.chat.id, urlMatch[0]);
    return;
  }

  // 2. Check if baby trigger word
  const lower = text.toLowerCase().trim();
  const matchedTrigger = BABY_TRIGGERS.find(w => lower.startsWith(w));
  if (matchedTrigger) {
    const afterTrigger = lower.substring(matchedTrigger.length).trim();
    if (!afterTrigger) {
      // only trigger word — send random reply (from baby.js onChat logic)
      const reply = RANDOM_REPLIES[Math.floor(Math.random() * RANDOM_REPLIES.length)];
      return bot.sendMessage(msg.chat.id, reply);
    } else {
      // trigger + message — send to hinata API
      await handleBabyChat(msg.chat.id, afterTrigger);
      return;
    }
  }
});

// ─────────────────────────────────────────
//  DOWNLOAD HANDLER (autodl.js logic)
// ─────────────────────────────────────────
async function handleDownload(chatId, url) {
  if (!isVideoLink(url)) {
    return bot.sendMessage(chatId,
      `❌ *Unsupported link!*\nSupported: YouTube, Facebook, TikTok, Instagram, Twitter, Spotify & more`,
      { parse_mode: "Markdown" }
    );
  }

  const platform = detectPlatform(url) || "Media";
  const loading = await bot.sendMessage(chatId,
    `♻️ *Downloading...*\nPlatform: ${platform}`,
    { parse_mode: "Markdown" }
  );

  const tmpDir = "/tmp";
  const isAudio = url.includes("spotify") || url.includes("soundcloud");
  const ext = isAudio ? "mp3" : "mp4";
  const filePath = path.join(tmpDir, `tamim_${Date.now()}.${ext}`);

  try {
    // Call download API (from autodl.js)
    const apiRes = await axios.get(DOWNLOAD_API, {
      params: { url },
      timeout: 30000
    });
    const data = apiRes.data;

    // Extract media URL (from autodl.js logic)
    const mediaURL = data.high_quality || data.url ||
      (data.result && data.result.url) ||
      (data.data && data.data.url);

    if (!mediaURL) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
      return bot.sendMessage(chatId,
        `⚠️ *Could not extract video URL!*\nTry a different link.`,
        { parse_mode: "Markdown" }
      );
    }

    // Download the file (from autodl.js stream logic)
    const fileRes = await axios({
      method: "get",
      url: mediaURL,
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 60000
    });

    const writer = fs.createWriteStream(filePath);
    await streamPipeline(fileRes.data, writer);

    const title = data.title || data.caption || platform;

    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

    // Caption (styled like autodl.js messageBody)
    const caption =
      `╭─ 🎀 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 ─╮\n` +
      `│\n` +
      `│ 📌 𝐓𝐢𝐭𝐥𝐞    : ${title}\n` +
      `│ 🌐 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : ${platform}\n` +
      `│ 📦 𝐓𝐲𝐩𝐞     : ${isAudio ? "𝐀𝐮𝐝𝐢𝐨 🎧" : "𝐕𝐢𝐝𝐞𝐨 🎬"}\n` +
      `│ ✅ 𝐒𝐭𝐚𝐭𝐮𝐬   : 𝐒𝐮𝐜𝐜𝐞𝐬𝐬\n` +
      `│\n` +
      `│ ✨ 𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐦𝐞𝐝𝐢𝐚 𝐛𝐚𝐛𝐲 🐥\n` +
      `│\n` +
      `╰─────────────────────╯\n` +
      `♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙`;

    if (isAudio) {
      await bot.sendAudio(chatId, filePath, { caption });
    } else {
      await bot.sendVideo(chatId, filePath, {
        caption,
        supports_streaming: true
      });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Download error:", err.message);
    bot.sendMessage(chatId,
      `❌ *Download failed!*\n\`${err.message.slice(0, 200)}\``,
      { parse_mode: "Markdown" }
    );
  }
}

// ─────────────────────────────────────────
//  BABY CHAT HANDLER (baby.js hinata API logic)
// ─────────────────────────────────────────
async function handleBabyChat(chatId, text) {
  try {
    const baseUrl = await getBaseApiUrl();
    const res = await axios.post(`${baseUrl}/api/hinata`, {
      text,
      style: 3,
      attachments: []
    }, { timeout: 30000 });

    const reply = res.data?.message;
    if (!reply) return bot.sendMessage(chatId, "error janu🥹");

    bot.sendMessage(chatId, reply);

  } catch (err) {
    console.error("Chat error:", err.message);
    bot.sendMessage(chatId, "error janu🥹");
  }
}

console.log("🤖 TAMIM BOT v2.0 is running...");
