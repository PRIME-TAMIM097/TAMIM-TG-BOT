const axios = require("axios");

module.exports = function (bot) {

  bot.onText(/\/img (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].trim();

    const loading = await bot.sendMessage(chatId,
      `🖼️ sᴇᴀʀᴄʜɪɴɢ...\n🔍 ${query}`
    );

    try {
      const res = await axios.get(`https://mahmud-infinity-api.onrender.com/unsplash`, {
        params: { query },
        timeout: 15000
      });

      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      const data = res.data;
      const imageUrl = data?.url || data?.image || data?.result?.url;

      if (!imageUrl) throw new Error("No image found");

      await bot.sendPhoto(chatId, imageUrl, {
        caption:
          `╔═════ 🖼️ 𝐈𝐌𝐀𝐆𝐄 ═════╗\n\n` +
          `  🔍 ǫᴜᴇʀʏ : ${query}\n` +
          `  ✅ sᴛᴀᴛᴜs : ꜰᴏᴜɴᴅ\n\n` +
          `╚═════════════════════╝\n` +
          `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`
      });

    } catch (err) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
      bot.sendMessage(chatId,
        `❌ ɪᴍᴀɢᴇ ɴᴏᴛ ꜰᴏᴜɴᴅ!\n\nᴜsᴀɢᴇ: /img <query>\nᴇxᴀᴍᴘʟᴇ: /img anime sunset`
      );
    }
  });

  bot.onText(/^\/img$/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🖼️ ᴜsᴀɢᴇ: /img <query>\nᴇxᴀᴍᴘʟᴇ: /img anime sunset`
    );
  });

};
