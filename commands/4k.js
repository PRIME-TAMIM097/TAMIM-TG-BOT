const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = function (bot) {

  // /4k reply to image — optional args: type level
  // Example: /4k 2 high
  bot.onText(/\/4k(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const args = match[1].trim().split(/\s+/).filter(Boolean);

    // ── must be a reply to a photo ──
    const reply = msg.reply_to_message;
    if (!reply || !reply.photo) {
      return bot.sendMessage(chatId,
        `╭─❍「 ⚠️ 𝐈𝐌𝐀𝐆𝐄 𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃 」❍─╮\n` +
        `│ 🖼️ 𝐑𝐞𝐩𝐥𝐲 𝐓𝐨 𝐀𝐧 𝐈𝐦𝐚𝐠𝐞\n` +
        `│ 💡 ᴇxᴀᴍᴘʟᴇ: /4k 2 high\n` +
        `╰───────────────⭓`
      );
    }

    const type = args[0] && !isNaN(args[0]) ? args[0] : "2";
    const level = args[1] && ["low", "medium", "high"].includes(args[1]?.toLowerCase())
      ? args[1].toLowerCase()
      : "low";

    // get highest quality photo file_id
    const photos = reply.photo;
    const fileId = photos[photos.length - 1].file_id;

    const loading = await bot.sendMessage(chatId,
      `╭─❍「 🔄 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆 」❍─╮\n` +
      `│ 🤖 𝐈𝐇𝐚𝐧𝐜𝐞𝐫 𝐀𝐈 𝐄𝐧𝐡𝐚𝐧𝐜𝐢𝐧𝐠...\n` +
      `│ 🎚️ 𝐓𝐲𝐩𝐞  : ${type}\n` +
      `│ 📊 𝐋𝐞𝐯𝐞𝐥  : ${level.toUpperCase()}\n` +
      `│ ⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭...\n` +
      `╰───────────────⭓`,
      { reply_to_message_id: msg.message_id }
    );

    try {
      // get file url from telegram
      const fileInfo = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

      // call iHancer API
      const apiUrl = `https://arychauhann.onrender.com/api/ihancer?url=${encodeURIComponent(fileUrl)}&type=${type}&level=${level}`;

      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 60000
      });

      const filePath = path.join("/tmp", `ihancer_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(response.data));

      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      await bot.sendPhoto(chatId, filePath, {
        caption:
          `╭─❍「 ✅ 𝐄𝐍𝐇𝐀𝐍𝐂𝐄𝐃 4𝐊 」❍─╮\n` +
          `│ ✨ 𝐘𝐨𝐮𝐫 𝐈𝐦𝐚𝐠𝐞 𝐈𝐬 𝐑𝐞𝐚𝐝𝐲\n` +
          `│ 🎚️ 𝐓𝐲𝐩𝐞  : ${type}\n` +
          `│ 📊 𝐋𝐞𝐯𝐞𝐥  : ${level.toUpperCase()}\n` +
          `│ 💎 𝐔𝐩𝐬𝐜𝐚𝐥𝐞𝐝 𝐁𝐲 𝐈𝐇𝐚𝐧𝐜𝐞𝐫 𝐀𝐈\n` +
          `╰───────────────⭓`,
        reply_to_message_id: msg.message_id
      });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (error) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
      console.error("4k error:", error.message);

      bot.sendMessage(chatId,
        `╭─❍「 ❌ 𝐄𝐑𝐑𝐎𝐑 」❍─╮\n` +
        `│ 🚫 𝐅𝐚𝐢𝐥𝐞𝐝 𝐓𝐨 𝐄𝐧𝐡𝐚𝐧𝐜𝐞\n` +
        `│ 🔁 𝐓𝐫𝐲 𝐀𝐠𝐚𝐢𝐧 𝐋𝐚𝐭𝐞𝐫\n` +
        `╰───────────────⭓`,
        { reply_to_message_id: msg.message_id }
      );
    }
  });

};
