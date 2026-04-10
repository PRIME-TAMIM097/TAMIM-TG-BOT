const axios = require("axios");

module.exports = function (bot) {

  bot.onText(/\/lyrics (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].trim();
    const parts = query.split(" ");
    const artist = parts[0];
    const song = parts.slice(1).join(" ") || parts[0];

    const loading = await bot.sendMessage(chatId,
      `🎵 sᴇᴀʀᴄʜɪɴɢ ʟʏʀɪᴄs...\n🔍 ${query}`
    );

    try {
      const res = await axios.get(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`,
        { timeout: 15000 }
      );

      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      const lyrics = res.data?.lyrics;
      if (!lyrics) throw new Error("No lyrics");

      const trimmed = lyrics.length > 3500
        ? lyrics.substring(0, 3500) + "\n\n... *(ᴛʀᴜɴᴄᴀᴛᴇᴅ)*"
        : lyrics;

      bot.sendMessage(chatId,
        `╔═════ 🎵 𝐋𝐘𝐑𝐈𝐂𝐒 ═════╗\n\n` +
        `  🎤 ${query}\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `${trimmed}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `╚═════════════════════╝\n` +
        `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`
      );

    } catch (err) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
      bot.sendMessage(chatId,
        `❌ ʟʏʀɪᴄs ɴᴏᴛ ꜰᴏᴜɴᴅ!\n\nᴜsᴀɢᴇ: /lyrics <artist> <song>\nᴇxᴀᴍᴘʟᴇ: /lyrics Ed Sheeran Shape of You`
      );
    }
  });

  bot.onText(/^\/lyrics$/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🎵 ᴜsᴀɢᴇ: /lyrics <artist> <song>\nᴇxᴀᴍᴘʟᴇ: /lyrics Ed Sheeran Shape of You`
    );
  });

};
