const axios = require("axios");

module.exports = function (bot) {

  bot.onText(/\/weather (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1].trim();

    const loading = await bot.sendMessage(chatId,
      `🌤️ ꜰᴇᴛᴄʜɪɴɢ ᴡᴇᴀᴛʜᴇʀ...\n📍 ${city}`
    );

    try {
      const res = await axios.get(
        `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
        { timeout: 15000 }
      );

      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      const current = res.data?.current_condition?.[0];
      const area = res.data?.nearest_area?.[0];
      if (!current) throw new Error("City not found");

      const tempC = current.temp_C;
      const tempF = current.temp_F;
      const feels = current.FeelsLikeC;
      const humidity = current.humidity;
      const wind = current.windspeedKmph;
      const desc = current.weatherDesc?.[0]?.value || "N/A";
      const areaName = area?.areaName?.[0]?.value || city;
      const country = area?.country?.[0]?.value || "";

      const d = desc.toLowerCase();
      let emoji = "🌤️";
      if (d.includes("sunny") || d.includes("clear")) emoji = "☀️";
      else if (d.includes("rain") || d.includes("drizzle")) emoji = "🌧️";
      else if (d.includes("thunder") || d.includes("storm")) emoji = "⛈️";
      else if (d.includes("snow")) emoji = "❄️";
      else if (d.includes("cloud") || d.includes("overcast")) emoji = "☁️";
      else if (d.includes("fog") || d.includes("mist")) emoji = "🌫️";

      bot.sendMessage(chatId,
        `╔═════ ${emoji} 𝐖𝐄𝐀𝐓𝐇𝐄𝐑 ═════╗\n\n` +
        `  📍 ${areaName}, ${country}\n` +
        `  ${emoji} ${desc}\n\n` +
        `  ━━━━━━━━━━━━━━━━━━━\n` +
        `  🌡️ ᴛᴇᴍᴘ      : ${tempC}°C / ${tempF}°F\n` +
        `  🤔 ꜰᴇᴇʟs ʟɪᴋᴇ : ${feels}°C\n` +
        `  💧 ʜᴜᴍɪᴅɪᴛʏ  : ${humidity}%\n` +
        `  💨 ᴡɪɴᴅ      : ${wind} ᴋᴍ/ʜ\n` +
        `  ━━━━━━━━━━━━━━━━━━━\n\n` +
        `╚═════════════════════╝\n` +
        `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`
      );

    } catch (err) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
      bot.sendMessage(chatId,
        `❌ ᴄɪᴛʏ ɴᴏᴛ ꜰᴏᴜɴᴅ!\n\nᴜsᴀɢᴇ: /weather <city>\nᴇxᴀᴍᴘʟᴇ: /weather Dhaka`
      );
    }
  });

  bot.onText(/^\/weather$/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🌤️ ᴜsᴀɢᴇ: /weather <city>\nᴇxᴀᴍᴘʟᴇ: /weather Dhaka`
    );
  });

};
