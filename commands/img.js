const axios = require("axios");

const MAHMUD_API = "https://mahmud-infinity-api.onrender.com";

module.exports = function (bot) {

  bot.onText(/\/img (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].trim();

    const loading = await bot.sendMessage(chatId,
      `🖼️ sᴇᴀʀᴄʜɪɴɢ ɪᴍᴀɢᴇs...\n🔍 *${query}*`,
      { parse_mode: "Markdown" }
    );

    try {
      // Try Mahmud Unsplash endpoint
      const res = await axios.get(`${MAHMUD_API}/unsplash`, {
        params: { query },
        timeout: 15000
      });

      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      const data = res.data;
      const imageUrl = data?.url || data?.image || data?.result?.url || data?.urls?.regular || data?.urls?.full;

      if (!imageUrl) {
        return bot.sendMessage(chatId,
          `❌ ɴᴏ ɪᴍᴀɢᴇ ꜰᴏᴜɴᴅ ꜰᴏʀ: *${query}*`,
          { parse_mode: "Markdown" }
        );
      }

      await bot.sendPhoto(chatId, imageUrl, {
        caption:
          `╔═════ 🖼️ 𝐈𝐌𝐀𝐆𝐄 ═════╗\n\n` +
          `  🔍 ǫᴜᴇʀʏ  : *${query}*\n` +
          `  ✅ sᴛᴀᴛᴜs : ꜰᴏᴜɴᴅ\n\n` +
          `╚═════════════════════╝\n` +
          `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`,
        parse_mode: "Markdown"
      });

    } catch (err) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      // fallback: try pinterest
      try {
        const res2 = await axios.get(`${MAHMUD_API}/pinterest`, {
          params: { query },
          timeout: 15000
        });

        const imgUrl2 = res2.data?.url || res2.data?.image || res2.data?.result?.url;
        if (imgUrl2) {
          return bot.sendPhoto(chatId, imgUrl2, {
            caption:
              `╔═════ 🖼️ 𝐈𝐌𝐀𝐆𝐄 ═════╗\n\n` +
              `  🔍 ǫᴜᴇʀʏ  : *${query}*\n` +
              `  ✅ sᴛᴀᴛᴜs : ꜰᴏᴜɴᴅ\n\n` +
              `╚═════════════════════╝\n` +
              `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`,
            parse_mode: "Markdown"
          });
        }
      } catch (_) {}

      bot.sendMessage(chatId,
        `❌ *ɪᴍᴀɢᴇ ɴᴏᴛ ꜰᴏᴜɴᴅ!*\n\nᴜsᴀɢᴇ: /img <query>\nᴇxᴀᴍᴘʟᴇ: /img anime girl`,
        { parse_mode: "Markdown" }
      );
    }
  });

  // no args
  bot.onText(/^\/img$/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🖼️ *ɪᴍᴀɢᴇ sᴇᴀʀᴄʜ*\n\n` +
      `ᴜsᴀɢᴇ: /img <query>\n` +
      `ᴇxᴀᴍᴘʟᴇ: /img sunset beach`,
      { parse_mode: "Markdown" }
    );
  });

};
