require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;
const app = express();
app.use(express.json());
const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};
let contador = 1;
app.post(URI, async (req, res) => {
  console.log(req.body);
  const chatId = req.body.message.chat.id;
  const text = req.body.message.text;
  const city = text.substring(2);
  if (text === `1-${city}`) {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=1c469ae9a4c936151e9de2662410aa05`
      )
      .then((response) => {
        console.log(response);
        axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `El clima principalmente esta ${response.data.weather[0].main}, la temperatura actual es ${response.data.main.temp}F, con una sensación térmica de ${response.data.main.feels_like}F, con máximas de ${response.data.main.temp_max}F y con minimas de ${response.data.main.temp_min}F`,
        });
      });
  } else if (text === "2") {
    ++contador;
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: contador,
    });
  } else {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Marca 1-TuCiudad para ver el tiempo y 2 para el contador",
    });
  }
  return res.send();
});
app.listen(process.env.PORT || 5000, async () => {
  console.log("server running on port", process.env.PORT || 5000);
  await init();
});
