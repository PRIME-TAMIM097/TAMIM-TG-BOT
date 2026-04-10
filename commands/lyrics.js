const axios = require("axios");

module.exports = function (bot) {

  bot.onText(/\/lyrics (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].trim();

    const loading = await bot.sendMessage(chatId,
      `🎵 sᴇᴀʀᴄʜɪɴɢ ʟʏʀɪᴄs...\n🔍 *${query}*`,
      { parse_mode: "Markdown" }
    );

    try {
      // lyrics.ovh free API
      const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query.split(" ").slice(0, -1).join(" ") || query)}/${encodeURIComponent(query.split(" ").pop())}`, {
        timeout: 15000
      });

      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      const lyrics = res.data?.lyrics;
      if (!lyrics) {
        return bot.sendMessage(chatId,
          `❌ ɴᴏ ʟʏʀɪᴄs ꜰᴏᴜɴᴅ ꜰᴏʀ: *${query}*\n\nᴛʀʏ: /lyrics <artist> <song>`,
          { parse_mode: "Markdown" }
        );
      }

      // trim if too long
      const trimmed = lyrics.length > 3500
        ? lyrics.substring(0, 3500) + "\n\n... *(ᴛʀᴜɴᴄᴀᴛᴇᴅ)*"
        : lyrics;

      bot.sendMessage(chatId,
        `╔═════ 🎵 𝐋𝐘𝐑𝐈𝐂𝐒 ═════╗\n\n` +
        `  🎤 *${query}*\n\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `${trimmed}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `╚═════════════════════╝\n` +
        `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`,
        { parse_mode: "Markdown" }
      );

    } catch (err) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      // fallback: try searching with full query as artist/song
      try {
        const parts = query.split(" ");
        const artist = parts[0];
        const song = parts.slice(1).join(" ") || parts[0];

        const res2 = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`, {
          timeout: 15000
        });

        const lyrics2 = res2.data?.lyrics;
        if (lyrics2) {
          const trimmed2 = lyrics2.length > 3500
            ? lyrics2.substring(0, 3500) + "\n\n... *(ᴛʀᴜɴᴄᴀᴛᴇᴅ)*"
            : lyrics2;

          return bot.sendMessage(chatId,
            `╔═════ 🎵 𝐋𝐘𝐑𝐈𝐂𝐒 ═════╗\n\n` +
            `  🎤 *${query}*\n\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `${trimmed2}\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `╚═════════════════════╝\n` +
            `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`,
            { parse_mode: "Markdown" }
          );
        }
      } catch (_) {}

      bot.sendMessage(chatId,
        `❌ *ʟʏʀɪᴄs ɴᴏᴛ ꜰᴏᴜɴᴅ!*\n\nᴜsᴀɢᴇ: /lyrics <artist> <song>\nᴇxᴀᴍᴘʟᴇ: /lyrics Ed Sheeran Shape of You`,
        { parse_mode: "Markdown" }
      );
    }
  });

  // no args
  bot.onText(/^\/lyrics$/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🎵 *ʟʏʀɪᴄs ᴄᴏᴍᴍᴀɴᴅ*\n\n` +
      `ᴜsᴀɢᴇ: /lyrics <artist> <song>\n` +
      `ᴇxᴀᴍᴘʟᴇ: /lyrics Ed Sheeran Shape of You`,
      { parse_mode: "Markdown" }
    );
  });

};
