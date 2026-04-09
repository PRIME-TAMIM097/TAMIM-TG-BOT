const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);

const BOT_TOKEN = "8643206314:AAG4W1fqTepqktrE_xzxbn4KI9GY1x1X188";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ─── ᴀᴘɪs ───
const DOWNLOAD_API = "https://xsaim8x-xxx-api.onrender.com/api/auto";

let cachedApiUrl = null;
const getBaseApiUrl = async () => {
  if (cachedApiUrl) return cachedApiUrl;
  const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  cachedApiUrl = res.data.mahmud;
  return cachedApiUrl;
};

// ─── ᴅᴏᴍᴀɪɴs ───
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

// ─── ʙᴀʙʏ ᴛʀɪɢɢᴇʀs ───
const BABY_TRIGGERS = [
  "baby", "bby", "babu", "bbu", "jan", "bot",
  "wifey", "marin"
];

// ─── ʀᴀɴᴅᴏᴍ ʀᴇᴘʟɪᴇs ───
const RANDOM_REPLIES = [
  "ᴛᴇʟʟ ᴍᴇ ʙᴀʙʏ 😒", "ɪ ʟᴏᴠᴇ ʏᴏᴜ 😘",
  "ʙᴀʙʏ ɪ'ᴍ ʜᴜɴɢʀʏ 🥺", "sᴀʏ ʙᴏss 😼",
  "ᴋɪss ʏᴏᴜ ʙᴀʙʏ 😘",
  "ᴍʙ ʙʏᴇ", "ᴍᴇᴡᴡ 🐤",
  "ᴡʜᴀᴛ ᴅᴏ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ sᴀʏ? 🤭",
  "ɪ ʟᴏᴠᴇ ʏᴏᴜ 😘😘", "ɪ ʜᴀᴛᴇ ʏᴏᴜ 😏😏",
  "ɢᴏ ᴛᴀᴋᴇ ᴀ sʜᴏᴡᴇʀ 😑",
  "sᴀʏ sɪʀ 😌", "sᴀʏ ᴍᴀᴅᴀᴍ 😌",
  "ɪ ᴅᴏɴ'ᴛ ᴛᴀʟᴋ ᴛᴏ sᴏᴍᴇᴏɴᴇ ᴇʟsᴇ's sᴛᴜғғ 😏",
  "sᴀʏ ᴊᴀɴᴜ ɴᴏᴛ ʙʙʏ 😌",
  "sᴛᴏᴘ ᴄᴀʟʟɪɴɢ ᴍᴇ ʙʙʏ 😒",
  "ᴅᴏɴ'ᴛ ᴄᴀʟʟ ᴍᴇ ʙᴀʙʏ ᴛᴏᴏ ᴍᴜᴄʜ 🤭",
  "ʏᴏᴜ ᴅᴏɴ'ᴛ ʜᴀᴠᴇ ɢғ sᴏ ᴄᴀʟʟɪɴɢ ᴍᴇ? 😂",
  "ᴛᴇʟʟ ᴍᴇ ʙᴀʙʏ 😒",
  "ᴍᴇᴏᴡ 🐤", "🐤🐤",
  "ʏᴇs ᴛᴇʟʟ ᴍᴇ 😒",
  "ᴡᴇɪʀᴅ 😒",
  "ᴀssᴀʟᴀᴍᴜᴀʟᴀɪᴋᴜᴍ 🐤",
  "ᴅɪᴅ ʏᴏᴜ ᴇᴀᴛ? 🙄",
  "ʏᴏᴜ ᴡᴀɴɴᴀ ᴅᴀᴛᴇ ᴍᴇ? 😌",
  "ᴄᴀʟʟɪɴɢ ᴀɢᴀɪɴ ᴀɴᴅ ᴀɢᴀɪɴ ᴍᴀᴋᴇs ᴍᴇ ᴀɴɢʀʏ 😑",
  "ᴛᴇʟʟ ᴍᴇ ᴊᴀɴᴜ 😒",
  "ᴡʜᴀᴛ ʜᴀᴘᴘᴇɴᴇᴅ, ᴍɪssɪɴɢ ᴍᴇ? 🤣",
  "ɪ'ᴍ ᴄʀᴜsʜ ᴏғ ᴛʜᴏᴜsᴀɴᴅs 😓",
  "ɪ'ᴍ sʜʏ ᴡɪᴛʜ ʙᴏʏs 🥹",
  "ᴍᴀᴋᴇ ʏᴏᴜʀ ʜᴇᴀʀᴛ ʙᴇᴀᴜᴛɪғᴜʟ, sɴᴀᴘᴄʜᴀᴛ ɪs ғᴏʀ ғᴀᴄᴇ! 🌚",
  "sᴛᴏᴘ ᴅɪsᴛᴜʀʙɪɴɢ, ʙᴜsʏ ᴡɪᴛʜ ᴍʏ ᴊᴀɴᴜ 😋",
  "ʜᴇʏ ᴡʜᴇɴ's ʏᴏᴜʀ ᴇxᴀᴍ? ᴊᴜsᴛ ᴅᴏɪɴɢ ʙʙʏ ʙʙʏ 😾",
  "sᴜᴅᴅᴇɴʟʏ ʀᴇᴍᴇᴍʙᴇʀᴇᴅ ᴍᴇ? 🙄",
  "ʏᴏᴜ ᴄᴏᴜʟᴅ sᴛᴜᴅʏ ɪɴsᴛᴇᴀᴅ ᴏғ ᴄᴀʟʟɪɴɢ ᴍᴇ 🥺",
  "ғᴏʀɢᴇᴛ ᴍᴇ 😞",
  "ɢɪᴠᴇ ᴍᴇ ʀᴏsᴇs ᴡʜᴇɴ ᴡᴇ ᴍᴇᴇᴛ 🤗",
  "ᴛᴇʟʟ ᴍᴇ ᴡʜᴀᴛ ᴄᴀɴ ɪ ᴅᴏ ғᴏʀ ʏᴏᴜ 😚",
  "ᴍᴇᴏᴡ 🐤", "ʜᴇʏ sᴛᴏᴘ ᴄᴀʟʟɪɴɢ ᴍᴇ 😿",
  "ғɪɴᴅ ᴍᴇ ᴀ ʙғ 😿",
  "sᴀʏ ʙᴏᴡ ɴᴏᴛ ʙʙʏ 😘"
];

// ─── ʀᴇᴘʟʏ ᴛʀᴀᴄᴋɪɴɢ ───
const replyMap = new Map();

function trackReply(messageId) {
  replyMap.set(messageId, true);
  if (replyMap.size > 300) {
    const first = replyMap.keys().next().value;
    replyMap.delete(first);
  }
}

// ─── ʜᴇʟᴘᴇʀs ───
function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/i.test(url)) return "ʏᴏᴜᴛᴜʙᴇ";
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) return "ғᴀᴄᴇʙᴏᴏᴋ";
  if (/tiktok\.com/i.test(url)) return "ᴛɪᴋᴛᴏᴋ";
  if (/instagram\.com|instagr\.am/i.test(url)) return "ɪɴsᴛᴀɢʀᴀᴍ";
  if (/spotify\.com/i.test(url)) return "sᴘᴏᴛɪғʏ";
  if (/soundcloud\.com/i.test(url)) return "sᴏᴜɴᴅᴄʟᴏᴜᴅ";
  if (/twitter\.com|x\.com/i.test(url)) return "ᴛᴡɪᴛᴛᴇʀ/x";
  return "ᴍᴇᴅɪᴀ";
}

function isVideoLink(text) {
  return DOMAINS.some(d => text.toLowerCase().includes(d));
}

// ─── /sᴛᴀʀᴛ ───
bot.onText(/\/start/, async (msg) => {
  const name = msg.from.first_name || "ᴜsᴇʀ";
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "ɴ/ᴀ";

  const welcomeMsg = 
`╭━━━━❰ ᴛᴀᴍɪᴍ ʙᴏᴛ ❱━━━━➣
┃
┃  👋 ʜᴇʟʟᴏ, ${name}!
┃  ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ᴍᴏsᴛ
┃  ᴘᴏᴡᴇʀғᴜʟ ᴍᴇᴅɪᴀ ʙᴏᴛ.
┃
┃  ┏━━━━━━━━━━━━━━━━━━┓
┃  ┃  👤 ᴜsᴇʀ: ${name}
┃  ┃  🆔 ɪᴅ: ${userId}
┃  ┃  🌐 ᴜsᴇʀɴᴀᴍᴇ: ${username}
┃  ┗━━━━━━━━━━━━━━━━━━┛
┃
┃  ✨ ɪ ᴄᴀɴ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴅᴇᴏs ғʀᴏᴍ
┃  ғᴀᴄᴇʙᴏᴏᴋ, ʏᴛ, ᴛɪᴋᴛᴏᴋ & ᴍᴏʀᴇ!
┃
┃  💬 ᴀʟsᴏ, ɪ ᴄᴀɴ ᴄʜᴀᴛ ʟɪᴋᴇ ᴀ ʙᴀʙʏ.
┃  ᴛʏᴘᴇ /ʜᴇʟᴘ ᴛᴏ sᴇᴇ ᴍʏ ᴘᴏᴡᴇʀ.
┃
┃  🔗 ᴛ.ᴍᴇ/ɪᴛsᴍᴇᴛᴀᴍɪᴍ404
╰━━━━━━━━━━━━━━━━━━━━━➣
       © ᴍᴀᴅᴇ ʙʏ ᴛᴀᴍɪᴍ`;

  await bot.sendMessage(msg.chat.id, welcomeMsg);
});

// ─── /ʜᴇʟᴘ ───
bot.onText(/\/help/, (msg) => {
  const helpMsg = 
`╔═════ 📄 ʜᴇʟᴘ ᴍᴇɴᴜ ═════╗

  📥 ᴅᴏᴡɴʟᴏᴀᴅᴇʀ ᴄᴏᴍᴍᴀɴᴅs
  ━━━━━━━━━━━━━━━━━━━
  ◈ /ᴅʟ <ᴜʀʟ> - ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇᴅɪᴀ
  ◈ ᴊᴜsᴛ sᴇɴᴅ ᴀɴʏ ʟɪɴᴋ ᴅɪʀᴇᴄᴛʟʏ

  💬 ᴄʜᴀᴛ & ᴀɪ ᴄᴏᴍᴍᴀɴᴅs
  ━━━━━━━━━━━━━━━━━━━
  ◈ /ᴄʜᴀᴛ <ᴍsɢ> - ᴛᴀʟᴋ ᴛᴏ ʜɪɴᴀᴛᴀ
  ◈ ᴛʀɪɢɢᴇʀs: ʙʙʏ, ʙᴀʙʏ, ᴊᴀɴ, ʙᴏᴛ

  ⚙️ ᴏᴛʜᴇʀ ᴄᴏᴍᴍᴀɴᴅs
  ━━━━━━━━━━━━━━━━━━━
  ◈ /sᴛᴀʀᴛ - ʀᴇsᴛᴀʀᴛ ᴛʜᴇ ʙᴏᴛ
  ◈ /ɪɴғᴏ  - ʏᴏᴜʀ ᴀᴄᴄᴏᴜɴᴛ ɪɴғᴏ
  ◈ /ᴘɪɴɢ  - ᴄʜᴇᴄᴋ ʙᴏᴛ sᴘᴇᴇᴅ

  🔗 ᴛ.ᴍᴇ/ɪᴛsᴍᴇᴛᴀᴍɪᴍ404
╚═════════════════════╝
       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`;

  bot.sendMessage(msg.chat.id, helpMsg);
});

// ─── /ɪɴғᴏ ───
bot.onText(/\/info/, (msg) => {
  const name = msg.from.first_name || "ᴜsᴇʀ";
  const userId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "ɴ/ᴀ";
  const lang = msg.from.language_code || "ɴ/ᴀ";

  bot.sendMessage(msg.chat.id,
`╔═════ 👤 ᴜsᴇʀ ɪɴғᴏ ═════╗

  ┃  👤 ɴᴀᴍᴇ     : ${name}
  ┃  🆔 ᴜsᴇʀ ɪᴅ  : ${userId}
  ┃  🌐 ᴜsᴇʀɴᴀᴍᴇ : ${username}
  ┃  🗣️ ʟᴀɴɢ     : ${lang}

╚═════════════════════╝
       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`
  );
});

// ─── /ᴘɪɴɢ ───
bot.onText(/\/ping/, async (msg) => {
  const start = Date.now();
  const sent = await bot.sendMessage(msg.chat.id, `🏓 ᴘɪɴɢɪɴɢ...`);
  const ping = Date.now() - start;
  await bot.editMessageText(
`╔═════ 🏓 ᴘɪɴɢ ═════╗

  ┃  ⚡ sᴘᴇᴇᴅ  : ${ping}ᴍs
  ┃  ✅ sᴛᴀᴛᴜs : ᴏɴʟɪɴᴇ

╚══════════════════╝
       ᴛᴀᴍɪᴍ ʙᴏᴛ 🌸`,
    { chat_id: msg.chat.id, message_id: sent.message_id }
  );
});

// ─── /ᴅʟ ───
bot.onText(/\/dl (.+)/, async (msg, match) => {
  await handleDownload(msg.chat.id, match[1].trim());
});

// ─── /ᴄʜᴀᴛ ───
bot.onText(/\/chat (.+)/, async (msg, match) => {
  await handleBabyChat(msg.chat.id, match[1].trim(), msg.message_id);
});

// ─── ᴀᴜᴛᴏ ᴅᴇᴛᴇᴄᴛ ───
bot.on("message", async (msg) => {
  const text = msg.text || "";
  if (text.startsWith("/")) return;

  const lower = text.toLowerCase().trim();

  // 1. ᴠɪᴅᴇᴏ ʟɪɴᴋ ᴄʜᴇᴄᴋ
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch && isVideoLink(urlMatch[0])) {
    await handleDownload(msg.chat.id, urlMatch[0]);
    return;
  }

  // 2. ᴏɴʀᴇᴘʟʏ — ᴜsᴇʀ ʀᴇᴘʟɪᴇᴅ ᴛᴏ ʙᴏᴛ ᴍᴇssᴀɢᴇ
  if (msg.reply_to_message && replyMap.has(msg.reply_to_message.message_id)) {
    await handleBabyChat(msg.chat.id, lower || "ᴍᴇᴏᴡ", msg.message_id);
    return;
  }

  // 3. ʙᴀʙʏ ᴛʀɪɢɢᴇʀ ᴡᴏʀᴅ
  const matchedTrigger = BABY_TRIGGERS.find(w => lower.startsWith(w));
  if (matchedTrigger) {
    const afterTrigger = lower.substring(matchedTrigger.length).trim();
    if (!afterTrigger) {
      const reply = RANDOM_REPLIES[Math.floor(Math.random() * RANDOM_REPLIES.length)];
      const sent = await bot.sendMessage(msg.chat.id, reply, {
        reply_to_message_id: msg.message_id
      });
      trackReply(sent.message_id);
    } else {
      await handleBabyChat(msg.chat.id, afterTrigger, msg.message_id);
    }
  }
});

// ─── ᴅᴏᴡɴʟᴏᴀᴅ ʜᴀɴᴅʟᴇʀ ───
async function handleDownload(chatId, url) {
  if (!isVideoLink(url)) {
    return bot.sendMessage(chatId,
      `❌ ᴜɴsᴜᴘᴘᴏʀᴛᴇᴅ ʟɪɴᴋ!\nsᴜᴘᴘᴏʀᴛᴇᴅ: ʏᴏᴜᴛᴜʙᴇ, ғᴀᴄᴇʙᴏᴏᴋ, ᴛɪᴋᴛᴏᴋ, ɪɴsᴛᴀɢʀᴀᴍ, ᴛᴡɪᴛᴛᴇʀ, sᴘᴏᴛɪғʏ & ᴍᴏʀᴇ`
    );
  }

  const platform = detectPlatform(url);
  const loading = await bot.sendMessage(chatId,
    `♻️ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ...\nᴘʟᴀᴛғᴏʀᴍ: ${platform}`
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
      return bot.sendMessage(chatId, `⚠️ ᴄᴏᴜʟᴅ ɴᴏᴛ ᴇxᴛʀᴀᴄᴛ ᴜʀʟ! ᴛʀʏ ᴀ ᴅɪғғᴇʀᴇɴᴛ ʟɪɴᴋ.`);
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
`╭─ 🎀 ᴅᴏᴡɴʟᴏᴀᴅ ᴄᴏᴍᴘʟᴇᴛᴇ ─╮
│
│ 📌 ᴛɪᴛʟᴇ    : ${title}
│ 🌐 ᴘʟᴀᴛғᴏʀᴍ : ${platform}
│ 📦 ᴛʏᴘᴇ     : ${isAudio ? "ᴀᴜᴅɪᴏ 🎧" : "ᴠɪᴅᴇᴏ 🎬"}
│ ✅ sᴛᴀᴛᴜs   : sᴜᴄᴄᴇss
│
│ ✨ ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴍᴇᴅɪᴀ ʙᴀʙʏ 🐥
│
╰─────────────────────╯
♡— ᴛᴀᴍɪᴍ ⸙`;

    if (isAudio) {
      await bot.sendAudio(chatId, filePath, { caption });
    } else {
      await bot.sendVideo(chatId, filePath, { caption, supports_streaming: true });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("ᴅᴏᴡɴʟᴏᴀᴅ ᴇʀʀᴏʀ:", err.message);
    bot.sendMessage(chatId, `❌ ᴅᴏᴡɴʟᴏᴀᴅ ғᴀɪʟᴇᴅ!\n${err.message.slice(0, 200)}`);
  }
}

// ─── ʙᴀʙʏ ᴄʜᴀᴛ ʜᴀɴᴅʟᴇʀ ───
async function handleBabyChat(chatId, text, replyToId) {
  try {
    const baseUrl = await getBaseApiUrl();
    const res = await axios.post(`${baseUrl}/api/hinata`, {
      text: text,
      style: 3,
      attachments: []
    }, { timeout: 30000 });

    const reply = res.data?.message;
    if (!reply) return bot.sendMessage(chatId, "ᴇʀʀᴏʀ ᴊᴀɴᴜ 🥹");

    const opts = replyToId ? { reply_to_message_id: replyToId } : {};
    const sent = await bot.sendMessage(chatId, reply, opts);
    trackReply(sent.message_id);

  } catch (err) {
    console.error("ᴄʜᴀᴛ ᴇʀʀᴏʀ:", err.message);
    const opts = replyToId ? { reply_to_message_id: replyToId } : {};
    bot.sendMessage(chatId, "ᴇʀʀᴏʀ ᴊᴀɴᴜ 🥹", opts);
  }
}

console.log("🤖 ᴛᴀᴍɪᴍ ʙᴏᴛ ᴠ2.0 ɪs ʀᴜɴɴɪɴɢ...");
