const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports = function (bot) {

  bot.onText(/\/catbox|\/cb|\/cbox/, async (msg) => {
    const chatId = msg.chat.id;
    const reply = msg.reply_to_message;

    // ── must reply to a media ──
    if (!reply || (!reply.photo && !reply.video && !reply.animation && !reply.audio && !reply.document)) {
      return bot.sendMessage(chatId,
        `╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n` +
        `│ ✖ 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐦𝐞𝐝𝐢𝐚 𝐟𝐢𝐫𝐬𝐭\n` +
        `│ 💡 ɪᴍᴀɢᴇ / ᴠɪᴅᴇᴏ / ɢɪꜰ / ᴀᴜᴅɪᴏ\n` +
        `╰───────────────╯`,
        { reply_to_message_id: msg.message_id }
      );
    }

    // ── get file id & extension ──
    let fileId, ext;
    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
      ext = ".jpg";
    } else if (reply.video) {
      fileId = reply.video.file_id;
      ext = ".mp4";
    } else if (reply.animation) {
      fileId = reply.animation.file_id;
      ext = ".gif";
    } else if (reply.audio) {
      fileId = reply.audio.file_id;
      ext = ".mp3";
    } else if (reply.document) {
      fileId = reply.document.file_id;
      ext = path.extname(reply.document.file_name || "") || ".dat";
    }

    // ── animated loading frames ──
    const frames = [
      `╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ ⬇️ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴍᴇᴅɪᴀ...\n╰───────────────╯`,
      `╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ ⬆️ ᴜᴘʟᴏᴀᴅɪɴɢ ᴛᴏ ᴄᴀᴛʙᴏx...\n╰───────────────╯`,
      `╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ ⏳ ᴘʀᴏᴄᴇssɪɴɢ...\n╰───────────────╯`,
      `╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ 🔄 ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ʙᴀʙʏ~\n╰───────────────╯`,
      `╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n│ 📤 ᴀʟᴍᴏsᴛ ᴅᴏɴᴇ...\n╰───────────────╯`,
    ];

    const loading = await bot.sendMessage(chatId, frames[0], {
      reply_to_message_id: msg.message_id
    });

    // animate loading
    let frameIdx = 0;
    const interval = setInterval(async () => {
      frameIdx = (frameIdx + 1) % frames.length;
      await bot.editMessageText(frames[frameIdx], {
        chat_id: chatId,
        message_id: loading.message_id
      }).catch(() => {});
    }, 1000);

    const filePath = path.join("/tmp", `catbox_${Date.now()}${ext}`);

    try {
      // get telegram file url
      const fileInfo = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

      // download file
      const dlRes = await axios.get(fileUrl, {
        responseType: "arraybuffer",
        timeout: 60000
      });
      fs.writeFileSync(filePath, Buffer.from(dlRes.data));

      // upload to catbox
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(filePath));

      const upload = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        { headers: form.getHeaders(), timeout: 60000 }
      );

      const catboxUrl = upload.data.trim();

      clearInterval(interval);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await bot.editMessageText(
        `╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n` +
        `│ ✅ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥\n` +
        `│ 🔗 𝐔𝐫𝐥:\n` +
        `│ ${catboxUrl}\n` +
        `╰───────────────╯`,
        { chat_id: chatId, message_id: loading.message_id }
      );

    } catch (err) {
      clearInterval(interval);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      console.error("[CATBOX ERROR]", err.message);

      await bot.editMessageText(
        `╭─❍ 『 𝐂𝐀𝐓𝐁𝐎𝐗 』 ❍─╮\n` +
        `│ ❌ 𝐔𝐩𝐥𝐨𝐚𝐝 𝐅𝐚𝐢𝐥𝐞𝐝\n` +
        `│ 🔁 ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ\n` +
        `╰───────────────╯`,
        { chat_id: chatId, message_id: loading.message_id }
      ).catch(() => {});
    }
  });

};
