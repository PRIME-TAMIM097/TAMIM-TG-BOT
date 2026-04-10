const axios = require("axios");

module.exports = function (bot) {

  bot.onText(/\/weather (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1].trim();

    const loading = await bot.sendMessage(chatId,
      `🌤️ ꜰᴇᴛᴄʜɪɴɢ ᴡᴇᴀᴛʜᴇʀ...\n📍 *${city}*`,
      { parse_mode: "Markdown" }
    );

    try {
      // wttr.in — free, no API key needed
      const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
        timeout: 15000
      });

      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      const data = res.data;
      const current = data?.current_condition?.[0];
      const area = data?.nearest_area?.[0];

      if (!current) {
        return bot.sendMessage(chatId,
          `❌ ᴄɪᴛʏ ɴᴏᴛ ꜰᴏᴜɴᴅ: *${city}*`,
          { parse_mode: "Markdown" }
        );
      }

      const tempC = current.temp_C;
      const tempF = current.temp_F;
      const feels = current.FeelsLikeC;
      const humidity = current.humidity;
      const windSpeed = current.windspeedKmph;
      const desc = current.weatherDesc?.[0]?.value || "N/A";
      const visibility = current.visibility;
      const uvIndex = current.uvIndex;

      const areaName = area?.areaName?.[0]?.value || city;
      const country = area?.country?.[0]?.value || "";

      // weather emoji
      const descLower = desc.toLowerCase();
      let emoji = "🌤️";
      if (descLower.includes("sunny") || descLower.includes("clear")) emoji = "☀️";
      else if (descLower.includes("rain") || descLower.includes("drizzle")) emoji = "🌧️";
      else if (descLower.includes("thunder") || descLower.includes("storm")) emoji = "⛈️";
      else if (descLower.includes("snow") || descLower.includes("blizzard")) emoji = "❄️";
      else if (descLower.includes("cloud") || descLower.includes("overcast")) emoji = "☁️";
      else if (descLower.includes("fog") || descLower.includes("mist")) emoji = "🌫️";
      else if (descLower.includes("wind")) emoji = "🌬️";

      bot.sendMessage(chatId,
        `╔═════ ${emoji} 𝐖𝐄𝐀𝐓𝐇𝐄𝐑 ═════╗\n\n` +
        `  📍 ʟᴏᴄᴀᴛɪᴏɴ  : *${areaName}, ${country}*\n` +
        `  ${emoji} ᴄᴏɴᴅɪᴛɪᴏɴ : ${desc}\n\n` +
        `  ━━━━━━━━━━━━━━━━━━━\n` +
        `  🌡️ ᴛᴇᴍᴘ      : ${tempC}°C / ${tempF}°F\n` +
        `  🤔 ꜰᴇᴇʟs ʟɪᴋᴇ : ${feels}°C\n` +
        `  💧 ʜᴜᴍɪᴅɪᴛʏ  : ${humidity}%\n` +
        `  💨 ᴡɪɴᴅ      : ${windSpeed} ᴋᴍ/ʜ\n` +
        `  👁️ ᴠɪsɪʙɪʟɪᴛʏ : ${visibility} ᴋᴍ\n` +
        `  ☀️ ᴜᴠ ɪɴᴅᴇx  : ${uvIndex}\n` +
        `  ━━━━━━━━━━━━━━━━━━━\n\n` +
        `╚═════════════════════╝\n` +
        `       ⚡ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴛᴀᴍɪᴍ`,
        { parse_mode: "Markdown" }
      );

    } catch (err) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
      console.error("Weather error:", err.message);
      bot.sendMessage(chatId,
        `❌ *ᴡᴇᴀᴛʜᴇʀ ɴᴏᴛ ꜰᴏᴜɴᴅ!*\n\nᴜsᴀɢᴇ: /weather <city>\nᴇxᴀᴍᴘʟᴇ: /weather Dhaka`,
        { parse_mode: "Markdown" }
      );
    }
  });

  // no args
  bot.onText(/^\/weather$/, (msg) => {
    bot.sendMessage(msg.chat.id,
      `🌤️ *ᴡᴇᴀᴛʜᴇʀ ᴄᴏᴍᴍᴀɴᴅ*\n\n` +
      `ᴜsᴀɢᴇ: /weather <city>\n` +
      `ᴇxᴀᴍᴘʟᴇ: /weather Dhaka`,
      { parse_mode: "Markdown" }
    );
  });

};
