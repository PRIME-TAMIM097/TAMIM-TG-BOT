const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

// ─── BOT SETTINGS ───
const BOT_TOKEN = "8643206314:AAG4W1fqTepqktrE_xzxbn4KI9GY1x1X188";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const AUTHOR = "—͟͞͞𝐓𝐀𝐌𝐈𝐌";

// ─── APIS & CONFIG ───
const DOWNLOAD_API = "https://xsaim8x-xxx-api.onrender.com/api/auto";
let cachedApiUrl = null;

const getBaseApiUrl = async () => {
  if (cachedApiUrl) return cachedApiUrl;
  const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  cachedApiUrl = res.data.mahmud;
  return cachedApiUrl;
};

const DOMAINS = [
  "facebook.com", "fb.watch", "fb.com", "youtube.com", "youtu.be",
  "tiktok.com", "instagram.com", "instagr.am", "soundcloud.com",
  "twitter.com", "x.com", "pinterest.com", "pin.it", "likee.com"
];

const BABY_TRIGGERS = ["baby", "bby", "babu", "bbu", "jan", "bot", "জান", "জানু", "বেবি", "wifey", "marin"];

const RANDOM_REPLIES = [
  "Bolo baby 😒", "I love you 😘", "babu khuda lagse🥺", "Hop beda😾, Boss বল boss😼",
  "আমাকে ডাকলে কিস করে দেবো😘", "mb ney bye", "meww 🐤", "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
  "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘", "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏", "গোসল করে আসো যাও😑😩",
  "বলেন sir__😌", "বলেন ম্যাডাম__😌", "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
  "𝗕𝗯𝘆 না জানু, বল 😌", "বেশি bby Bbby করলে leave নিবো কিন্তু 😒",
  "__বেশি বেবি বললে কামুর দিমু 🤭", "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂", "bolo baby😒",
  "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🫣", "Meow🐤", "🐤🐤",
  "হা বলো😒, কি করতে পারি😐?", "আজব তো__😒", "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤",
  "খাওয়া দাওয়া করসো 🙄", "কথা দেও আমাকে পটাবা...!! 😌", "বার বার ডাকলে মাথা গরম হয় কিন্তু 😑",
  "বলো জানু 😒", "কি হলো, মিস টিস করচ্ছো নাকি 🤣", "আমি হাজারো মশার Crush😓",
  "ছেলেদের প্রতি আমার এক আকাশ পরিমান শরম🥹🫣", "মন সুন্দর বানাও মুখের জন্য তো Snapchat আছেই! 🌚",
  "বার বার Disturb করেছিস, আমার জানুর সাথে ব্যাস্ত আসি 😋", "এই এই তোর পরীক্ষা কবে? শুধু 𝗕𝗯𝘆 করিস 😾",
  "হটাৎ আমাকে মনে পড়লো 🙄", "আমাকে না দেকে একটু পড়তে বসতেও তো পারো 🥺", "ভুলে জাও আমাকে 😞",
  "দেখা হলে কাঠগোলাপ দিও..🤗", "বলো কি করতে পারি তোমার জন্য 😚", "Meow🐤", "oi mama ar dakis na pilis 😿",
  "একটা BF খুঁজে দাও 😿", "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো 😘"
];

const replyMap = new Map();
function trackReply(messageId) {
  replyMap.set(messageId, true);
  if (replyMap.size > 300) replyMap.delete(replyMap.keys().next().value);
}

// ─── HELPERS ───
function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/i.test(url)) return "𝐘𝐨𝐮𝐓𝐮𝐛𝐞";
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) return "𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤";
  if (/tiktok\.com/i.test(url)) return "𝐓𝐢𝐤𝐓𝐨𝐤";
  if (/instagram\.com|instagr\.am/i.test(url)) return "𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦";
  return "Media";
}

function isVideoLink(text) {
  return DOMAINS.some(d => text.toLowerCase().includes(d));
}

// ─── COMMANDS ───

// 1. /start
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "User";
  const startMsg = 
    `╭━━━━❰ 𝐓𝐀𝐌𝐈𝐌 𝐁𝐎𝐓 ❱━━━━➣\n` +
    `┃\n` +
    `┃  👋 𝐇𝐞𝐥𝐥𝐨, ${name}!\n` +
    `┃  ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛᴀᴍɪᴍ's ᴡᴏʀʟᴅ.\n` +
    `┃\n` +
    `┃  💠 ᴜsᴇ /help ᴛᴏ sᴇᴇ ᴄᴍᴅs.\n` +
    `┃  💠 sᴇɴᴅ ᴀɴʏ ʟɪɴᴋ ᴛᴏ ᴅʟ.\n` +
    `┃\n` +
    `╰━━━━━━━━━━━━━━━━━━━━━➣\n` +
    `       © ᴀᴜᴛʜᴏʀ: ${AUTHOR}`;
  bot.sendMessage(msg.chat.id, startMsg, { parse_mode: "Markdown" });
});

// 2. /help
bot.onText(/\/help/, (msg) => {
  const helpMsg = 
    `╔═════ 📄 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔 ═════╗\n\n` +
    `  📥 DOWNLOADER\n` +
    `  ◈ /dl <url> - ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇᴅɪᴀ\n` +
    `  ◈ sᴇɴᴅ ᴀɴʏ ʟɪɴᴋ ᴅɪʀᴇᴄᴛʟʏ\n\n` +
    `  💬 *CHAT & AI*\n` +
    `  ◈ /chat <msg> - ᴛᴀʟᴋ ᴛᴏ ᴀɪ\n` +
    `  ◈ ᴛʀɪɢɢᴇʀs: bby, baby, jan, bot\n\n` +
    `  👤 *SYSTEM*\n` +
    `  ◈ /info - ᴏᴡɴᴇʀ ᴘʀᴏғɪʟᴇ\n` +
    `  ◈ /ping - ᴄʜᴇᴄᴋ ʟᴀᴛᴇɴᴄʏ\n\n` +
    `╚═════════════════════╝\n` +
    `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${AUTHOR}`;
  bot.sendMessage(msg.chat.id, helpMsg, { parse_mode: "Markdown" });
});

// 3. /info
bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id;
  const now = moment().tz("Asia/Dhaka");
  const uptime = process.uptime();
  const d = Math.floor(uptime / 86400);
  const h = Math.floor((uptime % 86400) / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const usedMem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  const card = `
╭━━━〔 🌸 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎 🌸 〕━━━╮

 🐣 ⌜ 𝐎𝐖𝐍𝐄𝐑 ⌝
 ━━━━━━━━━━━━━━━
 ➜ 𝐍𝐚𝐦𝐞    » 𝐓𝐀𝐌𝐈𝐌
 ➜ 𝐒𝐭𝐚𝐭𝐮𝐬  » 𝐒𝐈𝐍𝐆𝐋𝐄 😌
 ➜ 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧» 𝐑𝐀𝐉𝐒𝐇𝐀𝐇𝐈, 𝐍𝐀𝐎𝐆𝐀𝐎𝐍

 🌐 ⌜ 𝐒𝐎𝐂𝐈𝐀𝐋 ⌝
 ━━━━━━━━━━━━━━━
 ➜ 𝐅𝐁  » facebook.com/its.x.tamim
 ➜ 𝐈𝐆  » instagram.com/tamim__4047
 ➜ 𝐓𝐆  » t.me/ITSMETAMIM404

 🤖 ⌜ 𝐁𝐎𝐓 ⌝
 ━━━━━━━━━━━━━━━
 ➜ 𝐍𝐚𝐦𝐞    » 𝐓𝐀𝐌𝐈𝐌 𝐁𝐎𝐓
 ➜ 𝐔𝐩𝐭𝐢𝐦𝐞  » ${d}𝐝 ${h}𝐡 ${m}𝐦 ${s}𝐬
 ➜ 𝐌𝐞𝐦𝐨𝐫𝐲  » ${usedMem} 𝐌𝐁

 📅 ⌜ 𝐓𝐈𝐌𝐄 ⌝
 ━━━━━━━━━━━━━━━
 ➜ 𝐃𝐚𝐭𝐞  » ${now.format("DD/MM/YYYY")} [ ${now.format("dddd")} ]
 ➜ 𝐓𝐢𝐦𝐞  » ${now.format("hh:mm:ss A")}

╰━━━〔 ♡—͟͞͞𝐓𝐀𝐌𝐈𝐌 ⸙ 〕━━━╯`;

  const loading = await bot.sendMessage(chatId, "⏳ *Loading info baby...*", { parse_mode: "Markdown" });
  try {
    const filePath = path.join(__dirname, `info_${Date.now()}.mp4`);
    const res = await axios({ url: "https://files.catbox.moe/4bz3qu.mp4", method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    res.data.pipe(writer);
    writer.on("finish", async () => {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
      await bot.sendVideo(chatId, filePath, { caption: card });
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    bot.sendMessage(chatId, card);
  }
});

// 4. /ping
bot.onText(/\/ping/, (msg) => {
  const start = Date.now();
  bot.sendMessage(msg.chat.id, "🚀").then((sent) => {
    bot.editMessageText(`🚀 𝖯𝗈𝗇𝗀! \`${Date.now() - start}ms\``, {
      chat_id: msg.chat.id, message_id: sent.message_id
    });
  });
});

// ─── DOWNLOAD HANDLER ───
async function handleDownload(chatId, url) {
  const platform = detectPlatform(url);
  const loading = await bot.sendMessage(chatId, `♻️ *Downloading...*\nPlatform: ${platform}`, { parse_mode: "Markdown" });
  const filePath = path.join(__dirname, `tamim_${Date.now()}.mp4`);

  try {
    const apiRes = await axios.get(DOWNLOAD_API, { params: { url } });
    const mediaURL = apiRes.data.high_quality || apiRes.data.url || apiRes.data.result?.url || apiRes.data.data?.url;
    if (!mediaURL) throw new Error("No URL found");

    const fileRes = await axios({ method: "get", url: mediaURL, responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    await streamPipeline(fileRes.data, writer);

    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    const caption =
      `╭─ 🎀 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 ─╮\n` +
      `│\n` +
      `│ 📌 𝐓𝐢𝐭𝐥𝐞    : ${apiRes.data.title || platform}\n` +
      `│ 🌐 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦 : ${platform}\n` +
      `│ ✅ 𝐒𝐭𝐚𝐭𝐮𝐬   : 𝐒𝐮𝐜𝐜𝐞𝐬𝐬\n` +
      `│\n` +
      `│ ✨ 𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐦𝐞𝐝𝐢𝐚 𝐛𝐚𝐛𝐲 🐥\n` +
      `│\n` +
      `╰─────────────────────╯\n` +
      `♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙`;

    await bot.sendVideo(chatId, filePath, { caption, supports_streaming: true });
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    bot.sendMessage(chatId, `❌ *Download failed!*`, { parse_mode: "Markdown" });
  }
}

// ─── CHAT HANDLER ───
async function handleBabyChat(chatId, text, replyToId) {
  try {
    const baseUrl = await getBaseApiUrl();
    const res = await axios.post(`${baseUrl}/api/hinata`, { text, style: 3, attachments: [] });
    const reply = res.data?.message || "error janu🥹";
    const sent = await bot.sendMessage(chatId, reply, { reply_to_message_id: replyToId });
    trackReply(sent.message_id);
  } catch (err) {
    bot.sendMessage(chatId, "error janu🥹", { reply_to_message_id: replyToId });
  }
}

// ─── MESSAGE LISTENER ───
bot.on("message", async (msg) => {
  const text = msg.text || "";
  if (text.startsWith("/")) return;

  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch && isVideoLink(urlMatch[0])) return handleDownload(msg.chat.id, urlMatch[0]);

  if (msg.reply_to_message && replyMap.has(msg.reply_to_message.message_id)) return handleBabyChat(msg.chat.id, text, msg.message_id);

  const lower = text.toLowerCase();
  const matchedTrigger = BABY_TRIGGERS.find(w => lower.startsWith(w));
  if (matchedTrigger) {
    const after = lower.substring(matchedTrigger.length).trim();
    if (!after) {
      const reply = RANDOM_REPLIES[Math.floor(Math.random() * RANDOM_REPLIES.length)];
      const sent = await bot.sendMessage(msg.chat.id, reply, { reply_to_message_id: msg.message_id });
      trackReply(sent.message_id);
    } else {
      handleBabyChat(msg.chat.id, after, msg.message_id);
    }
  }
});

console.log(`🤖 ${AUTHOR} BOT v2.0 is running with Full Random Replies...`);
