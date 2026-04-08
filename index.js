const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const BOT_TOKEN = "8643206314:AAG4W1fqTepqktrE_xzxbn4KI9GY1x1X188";
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const DOWNLOAD_API = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/main/baseApiUrl.json";
const BBY_API = "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json";
const YTB_API = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/main/baseApiUrl.json";

// ─────────────────────────────────────────
//  HELPER: detect platform from URL
// ─────────────────────────────────────────
function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/facebook\.com|fb\.watch/i.test(url)) return "facebook";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/instagram\.com/i.test(url)) return "instagram";
  return null;
}

// ─────────────────────────────────────────
//  HELPER: send loading message
// ─────────────────────────────────────────
async function sendLoading(chatId, text = "⏳ Processing...") {
  return bot.sendMessage(chatId, text);
}

// ─────────────────────────────────────────
//  /start command
// ─────────────────────────────────────────
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "Friend";
  bot.sendMessage(
    msg.chat.id,
    `✨ *Welcome, ${name}!*\n\n` +
    `🤖 I'm *TAMIM BOT* — your all-in-one Telegram assistant!\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `📥 *Video Download*\n` +
    `➜ Just send any video link!\n` +
    `Supports: YouTube, Facebook, TikTok, Instagram\n\n` +
    `💬 *AI Chat*\n` +
    `➜ /chat <your message>\n\n` +
    `📋 *Commands*\n` +
    `➜ /help — See all commands\n` +
    `➜ /dl <url> — Download video\n` +
    `➜ /chat <msg> — Chat with AI\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `_Made with ❤️ by Tamim_`,
    { parse_mode: "Markdown" }
  );
});

// ─────────────────────────────────────────
//  /help command
// ─────────────────────────────────────────
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `📋 *TAMIM BOT — Help Menu*\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `📥 *Downloader*\n` +
    `➜ /dl <url>\n` +
    `➜ or just send the link directly\n\n` +
    `🌐 *Supported Platforms*\n` +
    `➜ YouTube\n` +
    `➜ Facebook\n` +
    `➜ TikTok\n` +
    `➜ Instagram\n\n` +
    `💬 *AI Chat*\n` +
    `➜ /chat <your message>\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `_TAMIM BOT v1.0_`,
    { parse_mode: "Markdown" }
  );
});

// ─────────────────────────────────────────
//  VIDEO DOWNLOADER — /dl command
// ─────────────────────────────────────────
bot.onText(/\/dl (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1].trim();
  await handleDownload(chatId, url);
});

// ─────────────────────────────────────────
//  VIDEO DOWNLOADER — auto detect link in message
// ─────────────────────────────────────────
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  // skip if it's a command
  if (text.startsWith("/")) return;

  // check if message contains a supported video URL
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    const url = urlMatch[0];
    const platform = detectPlatform(url);
    if (platform) {
      await handleDownload(chatId, url);
      return;
    }
  }

  // if no URL, treat as AI chat
  if (text.trim()) {
    await handleChat(chatId, text.trim(), msg.from.first_name || "Friend");
  }
});

// ─────────────────────────────────────────
//  /chat command
// ─────────────────────────────────────────
bot.onText(/\/chat (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();
  await handleChat(chatId, query, msg.from.first_name || "Friend");
});

// ─────────────────────────────────────────
//  DOWNLOAD HANDLER
// ─────────────────────────────────────────
async function handleDownload(chatId, url) {
  const platform = detectPlatform(url);

  if (!platform) {
    return bot.sendMessage(chatId,
      `❌ *Unsupported link!*\n\n` +
      `Supported: YouTube, Facebook, TikTok, Instagram`,
      { parse_mode: "Markdown" }
    );
  }

  const loading = await sendLoading(chatId,
    `⏳ *Fetching video...*\nPlatform: ${platform.toUpperCase()}`,
  );

  try {
    let videoUrl = null;
    let title = "Video";
    let thumb = null;

    // ── YouTube ──
    if (platform === "youtube") {
      const res = await axios.get(`${YTB_API}/ytdl`, {
        params: { url },
        timeout: 30000
      });
      const data = res.data;
      videoUrl = data?.video || data?.url || data?.downloadUrl || data?.result?.url;
      title = data?.title || "YouTube Video";
      thumb = data?.thumbnail || data?.thumb;
    }

    // ── Facebook ──
    else if (platform === "facebook") {
      const res = await axios.get(`${DIPTO_API}/fbdl`, {
        params: { url },
        timeout: 30000
      });
      const data = res.data;
      videoUrl = data?.hd || data?.sd || data?.url || data?.result?.hd || data?.result?.sd;
      title = data?.title || "Facebook Video";
      thumb = data?.thumbnail || data?.thumb;
    }

    // ── TikTok ──
    else if (platform === "tiktok") {
      const res = await axios.get(`${DIPTO_API}/tiktokdl`, {
        params: { url },
        timeout: 30000
      });
      const data = res.data;
      videoUrl = data?.video || data?.url || data?.noWatermark || data?.result?.url;
      title = data?.title || "TikTok Video";
      thumb = data?.thumbnail || data?.cover;
    }

    // ── Instagram ──
    else if (platform === "instagram") {
      const res = await axios.get(`${DIPTO_API}/igdl`, {
        params: { url },
        timeout: 30000
      });
      const data = res.data;
      videoUrl = data?.video || data?.url || data?.result?.url;
      title = data?.title || "Instagram Video";
      thumb = data?.thumbnail || data?.thumb;
    }

    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

    if (!videoUrl) {
      return bot.sendMessage(chatId,
        `❌ *Download failed!*\n\nCould not extract video URL.\nTry a different link.`,
        { parse_mode: "Markdown" }
      );
    }

    await bot.sendMessage(chatId,
      `✅ *Video found!*\n\n📌 *${title}*\n\n⏳ Sending video...`,
      { parse_mode: "Markdown" }
    );

    await bot.sendVideo(chatId, videoUrl, {
      caption: `🎬 *${title}*\n\n_Downloaded by TAMIM BOT_`,
      parse_mode: "Markdown",
      supports_streaming: true
    });

  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    console.error("Download error:", err.message);
    bot.sendMessage(chatId,
      `❌ *Error occurred!*\n\n\`${err.message}\`\n\nTry again later.`,
      { parse_mode: "Markdown" }
    );
  }
}

// ─────────────────────────────────────────
//  CHAT HANDLER
// ─────────────────────────────────────────
async function handleChat(chatId, query, name) {
  const loading = await sendLoading(chatId, "💭 *Thinking...*");

  try {
    // Try Mahmud Gemini AI endpoint
    const res = await axios.get(`${MAHMUD_API}/gemini`, {
      params: { query, name },
      timeout: 30000
    });

    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

    const data = res.data;
    const reply = data?.response || data?.reply || data?.result || data?.message || data?.answer;

    if (!reply) {
      return bot.sendMessage(chatId,
        `❌ No response from AI. Try again!`
      );
    }

    bot.sendMessage(chatId,
      `💬 *AI Response*\n\n${reply}`,
      { parse_mode: "Markdown" }
    );

  } catch (err) {
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    console.error("Chat error:", err.message);

    // fallback to JAN API
    try {
      const res2 = await axios.get(`${MAHMUD_API}/jan`, {
        params: { query, name },
        timeout: 20000
      });
      const reply2 = res2.data?.response || res2.data?.reply || res2.data?.result;
      if (reply2) {
        return bot.sendMessage(chatId,
          `💬 *AI Response*\n\n${reply2}`,
          { parse_mode: "Markdown" }
        );
      }
    } catch (_) {}

    bot.sendMessage(chatId,
      `❌ *AI Error!*\n\n\`${err.message}\`\n\nTry again later.`,
      { parse_mode: "Markdown" }
    );
  }
}

console.log("🤖 TAMIM BOT is running...");
