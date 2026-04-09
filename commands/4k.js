const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "4k",
  description: "Upscale image to 4K",

  run: async (bot, msg, args) => {
    const chatId = msg.chat.id;

    // ✅ Check reply image
    if (!msg.reply_to_message || !msg.reply_to_message.photo) {
      return bot.sendMessage(chatId,
`╭─❍「 ⚠️ 𝐈𝐌𝐀𝐆𝐄 𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃 」❍─╮
│ 🖼️ 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞
│ 💡 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: /4𝐤 2 𝐡𝐢𝐠𝐡
╰───────────────⭓`);
    }

    const type = args[0] && !isNaN(args[0]) ? args[0] : 2;
    const level = ["low", "medium", "high"].includes(args[1]?.toLowerCase())
      ? args[1].toLowerCase()
      : "low";

    try {
      // 📥 Get image from Telegram
      const fileId = msg.reply_to_message.photo.slice(-1)[0].file_id;
      const file = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

      const apiUrl = `https://arychauhann.onrender.com/api/ihancer?url=${encodeURIComponent(fileUrl)}&type=${type}&level=${level}`;

      // 🔄 Processing message
      const processingMsg = await bot.sendMessage(chatId,
`╭─❍「 🔄 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆 」❍─╮
│ 🤖 𝐈𝐇𝐚𝐧𝐜𝐞𝐫 𝐀𝐈 𝐄𝐧𝐡𝐚𝐧𝐜𝐢𝐧𝐠...
│ 🎚️ 𝐓𝐲𝐩𝐞 : ${type}
│ 📊 𝐋𝐞𝐯𝐞𝐥 : ${level.toUpperCase()}
│ ⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭...
╰───────────────⭓`);

      // 📡 API call
      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer"
      });

      const filePath = path.join(__dirname, `ihancer_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(response.data));

      // ✅ Send enhanced image
      await bot.sendPhoto(chatId, filePath, {
        caption:
`╭─❍「 ✅ 𝐄𝐍𝐇𝐀𝐍𝐂𝐄𝐃 4𝐊 」❍─╮
│ ✨ 𝐘𝐨𝐮𝐫 𝐈𝐦𝐚𝐠𝐞 𝐈𝐬 𝐑𝐞𝐚𝐝𝐲
│ 🎚️ 𝐓𝐲𝐩𝐞 : ${type}
│ 📊 𝐋𝐞𝐯𝐞𝐥 : ${level.toUpperCase()}
│ 💎 𝐔𝐩𝐬𝐜𝐚𝐥𝐞𝐝 𝐁𝐲 𝐈𝐇𝐚𝐧𝐜𝐞𝐫 𝐀𝐈
╰───────────────⭓`
      });

      // 🧹 Clean file
      fs.unlinkSync(filePath);

      // ❌ Delete processing msg
      bot.deleteMessage(chatId, processingMsg.message_id);

    } catch (err) {
      console.error("4k error:", err.message);

      bot.sendMessage(chatId,
`╭─❍「 ❌ 𝐄𝐑𝐑𝐎𝐑 」❍─╮
│ 🚫 𝐅𝐚𝐢𝐥𝐞𝐝 𝐓𝐨 𝐄𝐧𝐡𝐚𝐧𝐜𝐞
│ 🔁 𝐓𝐫𝐲 𝐀𝐠𝐚𝐢𝐧 𝐋𝐚𝐭𝐞𝐫
╰───────────────⭓`);
    }
  }
};
