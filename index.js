const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const BOT_TOKEN = "8643206314:AAG4W1fqTepqktrE_xzxbn4KI9GY1x1X188";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/facebook\.com|fb\.watch/i.test(url)) return "facebook";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/instagram\.com/i.test(url)) return "instagram";
  return null;
}

// ─── /start ───
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "Friend";
  bot.sendMessage(msg.chat.id,
    `✨ *Welcome, ${name}!*\n\n` +
    `🤖 I'm *TAMIM BOT* — your Telegram assistant!\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `📥 *Video Download*\n` +
    `➜ Just send any video link!\n` +
    `➜ YouTube, Facebook, TikTok, Instagram\n\n` +
    `💬 *AI Chat*\n` +
    `➜ /chat <your message>\n` +
    `➜ Or just text me anything!\n\n` +
    `📋 *Commands*\n` +
    `➜ /help — All commands\n` +
    `➜ /dl <url> — Download video\n` +
    `➜ /chat <msg> — Chat with AI\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `_Made with ❤️ by Tamim_`,
    { parse_mode: "Markdown" }
  );
});

// ─── /help ───
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📋 *TAMIM BOT — Help Menu*\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `📥 *Downloader*\n` +
    `➜ /dl <url> — Download video\n` +
    `➜ Or just send the link directly!\n\n` +
    `🌐 *Supported Platforms*\n` +
    `➜ YouTube\n➜ Facebook\n➜ TikTok\n➜ Instagram\n\n` +
    `💬 *AI Chat*\n` +
    `➜ /chat <message>\n` +
    `➜ Or just send any text!\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `_TAMIM BOT v2.0_`,
    { parse_mode: "Markdown" }
  );
});

// ─── /dl ───
bot.onText(/\/dl (.+)/, async (msg, match) => {
  await handleDownload(msg.chat.id, match[1].trim());
});

// ─── /chat ───
bot.onText(/\/chat (.+)/, async (msg, match) => {
  await handleChat(msg.chat.id, match[1].trim(), msg.from.first_name || "Friend");
});

// ─── Auto detect ───
bot.on("message", async (msg) => {
  const text = msg.text || "";
  if (text.startsWith("/")) return;

  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch && detectPlatform(urlMatch[0])) {
    await handleDownload(msg.chat.id, urlMatch[0]);
    return;
  }

  if (text.trim()) {
    await handleChat(msg.chat.id, text.trim(), msg.from.first_name || "Friend");
  }
});

// ─── DOWNLOAD HANDLER ───
async function handleDownload(chatId, url) {
  const platform = detectPlatform(url);
  if (!platform) {
    return bot.sendMessage(chatId,
      `❌ *Unsupported link!*\nSupported: YouTube, Facebook, TikTok, Instagram`,
      { parse_mode: "Markdown" }
    );
  }

  const loading = await bot.sendMessage(chatId,
    `⏳ *Downloading...*\nPlatform: \`${platform.toUpperCase()}\``,
    { parse_mode: "Markdown" }
  );

  const tmpFile = path.join("/tmp", `tamim_${Date.now()}.mp4`);

  try {
    await new Promise((resolve, reject) => {
      execFile("yt-dlp", [
        "-f", "best[ext=mp4]/best",
        "--no-playlist",
        "--max-filesize", "49m",
        "-o", tmpFile,
        url
      ], { timeout: 120000 }, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve();
      });
    });

    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

    if (!fs.existsSync(tmpFile)) {
      return bot.sendMessage(chatId, `❌ *Download failed!*`, { parse_mode: "Markdown" });
    }

    await bot.sendVideo(chatId, tmpFile, {
      caption: `✅ *Downloaded successfully!*\n\n_TAMIM BOT_`,
      parse_mode: "Markdown",
      supports_streaming: true
    });

    fs.unlinkSync(tmpFile);

  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    console.error("Download error:", err.message);
    bot.sendMessage(chatId,
      `❌ *Download failed!*\n\n\`${err.message.slice(0, 200)}\``,
      { parse_mode: "Markdown" }
    );
  }
}

// ─── CHAT HANDLER ───
async function handleChat(chatId, query, name) {
  if (!GEMINI_API_KEY) {
    return bot.sendMessage(chatId,
      `❌ *AI not configured!*\nSet \`GEMINI_API_KEY\` in environment variables.\nGet free key: https://aistudio.google.com/`,
      { parse_mode: "Markdown" }
    );
  }

  const loading = await bot.sendMessage(chatId, `💭 *Thinking...*`, { parse_mode: "Markdown" });

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `You are a friendly cute AI assistant named "Baby Bot" created by Tamim. Reply in a warm and helpful way. User name: ${name}\n\nUser: ${query}`
          }]
        }]
      },
      { timeout: 30000 }
    );

    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

    const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return bot.sendMessage(chatId, `❌ No response from AI.`);

    bot.sendMessage(chatId,
      `💬 *Baby Bot*\n\n${reply}`,
      { parse_mode: "Markdown" }
    );

  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    console.error("Chat error:", err.message);
    bot.sendMessage(chatId,
      `❌ *AI Error!*\n\`${err.message.slice(0, 200)}\``,
      { parse_mode: "Markdown" }
    );
  }
}

console.log("🤖 TAMIM BOT v2.0 is running...");
