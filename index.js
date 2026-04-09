const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

const BOT_TOKEN = "8643206314:AAG4W1fqTepqktrE_xzxbn4KI9GY1x1X188";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ─── APIS ───
const DOWNLOAD_API = "https://xsaim8x-xxx-api.onrender.com/api/auto";

let cachedApiUrl = null;
const getBaseApiUrl = async () => {
  if (cachedApiUrl) return cachedApiUrl;
  const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  cachedApiUrl = res.data.mahmud;
  return cachedApiUrl;
};

// ─── DOMAINS (autodl.js) ───
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

// ─── BABY TRIGGERS (baby.js) ───
const BABY_TRIGGERS = [
  "baby", "bby", "babu", "bbu", "jan", "bot",
  "জান", "জানু", "বেবি", "wifey", "marin"
];

// ─── RANDOM REPLIES (baby.js) ───
const RANDOM_REPLIES = [
  "Bolo baby 😒", "I love you 😘",
  "babu khuda lagse🥺", "Hop beda😾, Boss বল boss😼",
  "আমাকে ডাকলে কিস করে দেবো😘",
  "mb ney bye", "meww 🐤",
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
  "মন সুন্দর বানাও মুখের জন্য তো Snapchat আছেই! 🌚",
  "বার বার Disturb করেছিস, আমার জানুর সাথে ব্যাস্ত আসি 😋",
  "এই এই তোর পরীক্ষা কবে? শুধু 𝗕𝗯𝘆 করিস 😾",
  "হটাৎ আমাকে মনে পড়লো 🙄",
  "আমাকে না দেকে একটু পড়তে বসতেও তো পারো 🥺",
  "ভুলে জাও আমাকে 😞",
  "দেখা হলে কাঠগোলাপ দিও..🤗",
  "বলো কি করতে পারি তোমার জন্য 😚",
  "Meow🐤", "oi mama ar dakis na pilis 😿",
  "একটা BF খুঁজে দাও 😿",
  "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো 😘"
];

// ─── reply tracking (baby.js onReply system) ───
const replyMap = new Map();

function trackReply(messageId) {
  replyMap.set(messageId, true);
  if (replyMap.size > 300) {
    const first = replyMap.keys().next().value;
    replyMap.delete(first);
  }
}

// ─── HELPERS ───
function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/i.test(url)) return "𝐘𝐨𝐮𝐓𝐮𝐛𝐞";
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) return "𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤";
  if (/tiktok\.com/i.test(url)) return "𝐓𝐢𝐤𝐓𝐨𝐤";
  if (/instagram\.com|instagr\.am/i.test(url)) return "𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦";
  if (/spotify\.com/i.test(url)) return "Spotify";
  if (/soundcloud\.com/i.test(url)) return "SoundCloud";
  if (/twitter\.com|x\.com/i.test(url)) return "Twitter/X";
  return "Media";
}

function isVideoLink(text) {
  return DOMAINS.some(d => text.toLowerCase().includes(d));
}

// ─── /start ───
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "User";
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "N/A";

  const welcomeMsg = 
    `╭━━━━❰ 𝐓𝐀𝐌𝐈𝐌 𝐁𝐎𝐓 ❱━━━━➣
` +
    `┃
` +
    `┃  👋 𝐇𝐞𝐥𝐥𝐨, ${name}!
` +
    `┃  ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ᴍᴏsᴛ
` +
    `┃  ᴘᴏᴡᴇʀғᴜʟ ᴍᴇᴅɪᴀ ʙᴏᴛ.
` +
    `┃
` +
    `┃  ┏━━━━━━━━━━━━━━━━━━┓
` +
    `┃  ┃  👤 𝐔𝐬𝐞𝐫: ${name}
` +
    `┃  ┃  🆔 𝐈𝐃: ${userId}
` +
    `┃  ┃  🌐 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${username}
` +
    `┃  ┗━━━━━━━━━━━━━━━━━━┛
` +
    `┃
` +
    `┃  ✨ ɪ ᴄᴀɴ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏs ғʀᴏᴍ
` +
    `┃  ғᴀᴄᴇʙᴏᴏᴋ, ʏᴛ, ᴛɪᴋᴛᴏᴋ & ᴍᴏʀᴇ!
` +
    `┃
` +
    `┃  💬 ᴀʟsᴏ, ɪ ᴄᴀɴ ᴄʜᴀᴛ ʟɪᴋᴇ ᴀ ʙʙʏ.
` +
    `┃  ᴛʏᴘᴇ /help ᴛᴏ sᴇᴇ ᴍʏ ᴘᴏᴡᴇʀ.
` +
    `┃
` +
    `┃  🔗 t.me/ITSMETAMIM404
` +
    `╰━━━━━━━━━━━━━━━━━━━━━➣
` +
    `       © ᴍᴀᴅᴇ ʙʏ ᴛᴀᴍɪᴍ`;

  bot.sendMessage(msg.chat.id, welcomeMsg, { parse_mode: "Markdown" });
});

  await bot.sendMessage(msg.chat.id,
`╭──────────────────────╮
│  🎀🌸 ᴡᴇʟᴄᴏᴍᴇ, ${name}! 🌸🎀  │
╰──────────────────────╯

✨ ʜᴇʟʟᴏ ʙᴀʙʏ~ ɪ'ᴍ ʏᴏᴜʀ

🤖 ʏᴏᴜʀ ʙᴀʙʏ ʙᴏᴛ 🍓🌷🎀

ɪ ᴡᴀs ᴍᴀᴅᴇ ᴊᴜsᴛ ꜰᴏʀ ʏᴏᴜ~
ᴛᴏ ᴄʜᴀᴛ, ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏs
ᴀɴᴅ ᴀʟᴡᴀʏs ʙᴇ ʙʏ ʏᴏᴜʀ sɪᴅᴇ 🥺💕

▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸
🌸 ᴡʜᴀᴛ ɪ ᴄᴀɴ ᴅᴏ
▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸

📥 sᴇɴᴅ ᴀɴʏ ᴠɪᴅᴇᴏ ʟɪɴᴋ
   ɪ'ʟʟ ᴅᴏᴡɴʟᴏᴀᴅ ɪᴛ ꜰᴏʀ ʏᴏᴜ 🎬

💬 sᴀʏ ʙʙʏ / ʙᴀʙʏ / ᴊᴀɴ
   ɪ'ᴍ ᴀʟᴡᴀʏs ʜᴇʀᴇ 🥺

📋 ᴛʏᴘᴇ /ʜᴇʟᴘ ᴛᴏ sᴇᴇ ᴀʟʟ ᴄᴍᴅs~

▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸
♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙ | ᴛᴀᴍɪᴍ ʙᴏᴛ 🌸
🔗 t.me/ITSMETAMIM404`,
    { parse_mode: "Markdown" }
  );
});

  await bot.sendMessage(msg.chat.id,
`╭──────────────────────╮
│  🎀🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄, ${name}! 🌸🎀  │
╰──────────────────────╯

✨ 𝐇𝐞𝐥𝐥𝐨 𝐛𝐚𝐛𝐲~ আমি তোমার

🤖 ʏᴏᴜʀ ʙᴀʙʏ ʙᴏᴛ 🍓🌷🎀

তোমার জন্যই বানানো হয়েছি~
তোমার সাথে কথা বলতে, ভিডিও ডাউনলোড করতে
আর সবসময় পাশে থাকতে 🥺💕

▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸
🌸 𝐖𝐇𝐀𝐓 𝐈 𝐂𝐀𝐍 𝐃𝐎
▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸

📥 যেকোনো ভিডিও লিংক পাঠাও
   আমি ডাউনলোড করে দেবো 🎬

💬 bby / baby / jan বলে ডাকো
   আমি সাথে আছি সবসময় 🥺

📋 /help লিখলে সব commands দেখো~

▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸
♡—͟͞͞ᴛꫝ֟፝ؖ۬ᴍɪᴍ ⸙ | 𝐓𝐀𝐌𝐈𝐌 𝐁𝐎𝐓 🌸
🔗 t.me/ITSMETAMIM404`,
    { parse_mode: "Markdown" }
  );
});

// ─── /help ───
bot.onText(/\/help/, (msg) => {
  const helpMsg = 
    `╔═════ 📄 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔 ═════╗

` +
    `  📥 ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ᴄᴏᴍᴍᴀɴᴅs
` +
    `  ━━━━━━━━━━━━━━━━━━━
` +
    `  ◈ /dl <url> - ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇᴅɪᴀ
` +
    `  ◈ ᴊᴜsᴛ sᴇɴᴅ ᴀɴʏ ʟɪɴᴋ ᴅɪʀᴇᴄᴛʟʏ

` +
    `  💬 ᴄʜᴀᴛ & ᴀɪ ᴄᴏᴍᴍᴀɴᴅs
` +
    `  ━━━━━━━━━━━━━━━━━━━
` +
    `  ◈ /chat <msg> - ᴛᴀʟᴋ ᴛᴏ ʜɪɴᴀᴛᴀ
` +
    `  ◈ ᴛʀɪɢɢᴇʀs: bby, baby, jan, bot

` +
    `  ⚙️ ᴏᴛʜᴇʀ ᴄᴏᴍᴍᴀɴᴅs
` +
    `  ━━━━━━━━━━━━━━━━━━━
` +
    `  ◈ /start - ʀᴇsᴛᴀʀᴛ ᴛʜᴇ ʙᴏᴛ
` +
    `  ◈ /info  - ʏᴏᴜʀ ᴀᴄᴄᴏᴜɴᴛ ɪɴꜰᴏ
` +
    `  ◈ /ping  - ᴄʜᴇᴄᴋ ʙᴏᴛ sᴘᴇᴇᴅ

` +
    `  🔗 t.me/ITSMETAMIM404
` +
    `╚═════════════════════╝
` +
    `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`;

  bot.sendMessage(msg.chat.id, helpMsg, { parse_mode: "Markdown" });
});

// ─── /info ───
bot.onText(/\/info/, (msg) => {
  const name = msg.from.first_name || "User";
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "N/A";
  const lang = msg.from.language_code || "N/A";

  bot.sendMessage(msg.chat.id,
    `╔═════ 👤 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎 ═════╗\n\n` +
    `  ┃  👤 𝐍𝐚𝐦𝐞     : ${name}\n` +
    `  ┃  🆔 𝐔𝐬𝐞𝐫 𝐈𝐃  : ${userId}\n` +
    `  ┃  🌐 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 : ${username}\n` +
    `  ┃  🗣️ 𝐋𝐚𝐧𝐠     : ${lang}\n\n` +
    `╚═════════════════════╝\n` +
    `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`,
    { parse_mode: "Markdown" }
  );
});

// ─── /ping ───
bot.onText(/\/ping/, async (msg) => {
  const start = Date.now();
  const sent = await bot.sendMessage(msg.chat.id, `🏓 ᴘɪɴɢɪɴɢ...`);
  const ping = Date.now() - start;
  await bot.editMessageText(
    `╔═════ 🏓 𝐏𝐈𝐍𝐆 ═════╗\n\n` +
    `  ┃  ⚡ sᴘᴇᴇᴅ  : ${ping}ᴍs\n` +
    `  ┃  ✅ sᴛᴀᴛᴜs : ᴏɴʟɪɴᴇ\n\n` +
    `╚══════════════════╝\n` +
    `       ᴛᴀᴍɪᴍ ʙᴏᴛ 🌸`,
    { chat_id: msg.chat.id, message_id: sent.message_id, parse_mode: "Markdown" }
  );
});

// ─── /dl ───
bot.onText(/\/dl (.+)/, async (msg, match) => {
  await handleDownload(msg.chat.id, match[1].trim());
});

// ─── /chat ───
bot.onText(/\/chat (.+)/, async (msg, match) => {
  await handleBabyChat(msg.chat.id, match[1].trim(), msg.message_id);
});

// ─── AUTO DETECT (video link + baby trigger + onReply) ───
bot.on("message", async (msg) => {
  const text = msg.text || "";
  if (text.startsWith("/")) return;

  const lower = text.toLowerCase().trim();

  // 1. Video link check
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch && isVideoLink(urlMatch[0])) {
    await handleDownload(msg.chat.id, urlMatch[0]);
    return;
  }

  // 2. onReply — user replied to bot message (baby.js onReply logic)
  if (msg.reply_to_message && replyMap.has(msg.reply_to_message.message_id)) {
    await handleBabyChat(msg.chat.id, lower || "meow", msg.message_id);
    return;
  }

  // 3. Baby trigger word (baby.js onChat logic)
  const matchedTrigger = BABY_TRIGGERS.find(w => lower.startsWith(w));
  if (matchedTrigger) {
    const afterTrigger = lower.substring(matchedTrigger.length).trim();
    if (!afterTrigger) {
      // only trigger word → random reply
      const reply = RANDOM_REPLIES[Math.floor(Math.random() * RANDOM_REPLIES.length)];
      const sent = await bot.sendMessage(msg.chat.id, reply, {
        reply_to_message_id: msg.message_id
      });
      trackReply(sent.message_id);
    } else {
      // trigger + message → hinata API
      await handleBabyChat(msg.chat.id, afterTrigger, msg.message_id);
    }
  }
});

// ─── DOWNLOAD HANDLER ───
async function handleDownload(chatId, url) {
  if (!isVideoLink(url)) {
    return bot.sendMessage(chatId,
      `❌ *Unsupported link!*\nSupported: YouTube, Facebook, TikTok, Instagram, Twitter, Spotify & more`,
      { parse_mode: "Markdown" }
    );
  }

  const platform = detectPlatform(url);
  const loading = await bot.sendMessage(chatId,
    `♻️ *Downloading...*\nPlatform: ${platform}`,
    { parse_mode: "Markdown" }
  );

  const isAudio = url.includes("spotify") || url.includes("soundcloud");
  const ext = isAudio ? "mp3" : "mp4";
  const filePath = path.join("/tmp", `tamim_${Date.now()}.${ext}`);

  try {
    const apiRes = await axios.get(DOWNLOAD_API, {
      params: { url },
      timeout: 30000
    });
    const data = apiRes.data;

    const mediaURL = data.high_quality || data.url ||
      (data.result && data.result.url) ||
      (data.data && data.data.url);

    if (!mediaURL) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
      return bot.sendMessage(chatId, `⚠️ *Could not extract URL!* Try a different link.`, { parse_mode: "Markdown" });
    }

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
      await bot.sendVideo(chatId, filePath, { caption, supports_streaming: true });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Download error:", err.message);
    bot.sendMessage(chatId, `❌ *Download failed!*\n\`${err.message.slice(0, 200)}\``, { parse_mode: "Markdown" });
  }
}

// ─── BABY CHAT HANDLER (baby.js hinata API) ───
async function handleBabyChat(chatId, text, replyToId) {
  try {
    const baseUrl = await getBaseApiUrl();
    const res = await axios.post(`${baseUrl}/api/hinata`, {
      text: text,
      style: 3,
      attachments: []
    }, { timeout: 30000 });

    const reply = res.data?.message;
    if (!reply) return bot.sendMessage(chatId, "error janu🥹");

    const opts = replyToId ? { reply_to_message_id: replyToId } : {};
    const sent = await bot.sendMessage(chatId, reply, opts);
    trackReply(sent.message_id); // track so replies continue chat

  } catch (err) {
    console.error("Chat error:", err.message);
    const opts = replyToId ? { reply_to_message_id: replyToId } : {};
    bot.sendMessage(chatId, "error janu🥹", opts);
  }
}

console.log("🤖 TAMIM BOT v2.0 is running...");
