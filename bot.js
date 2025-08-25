// chatbot.js
import http from "http";

// Kalit so'zlar va javoblar
const faqs = [
  { keys: ["qabul", "hujjat"], answer: "Qabul hujjatlari 10-iyuldan 20-avgustgacha davom etadi." },
  { keys: ["to'lov", "narx"], answer: "O'qish to'lovi 12 mln so'mdan boshlanadi." },
  { keys: ["kafedra", "fakultet", "yo'nalish"], answer: "Institutda \"Estrada cholg'u ijrochiligi\" va \"Estrada xonandaligi\" fakultetlari mavjud. " },
  { keys: ["manzil", "adres"], answer: "Bizning manzil: Toshkent shahri, Universitet ko'chasi 12-uy." }
];

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/chat") {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => {
      const { question } = JSON.parse(body);
      const text = question.toLowerCase();

      let answer = "Kechirasiz, bu savol bo‘yicha ma’lumot topilmadi.";
      for (let faq of faqs) {
        if (faq.keys.some(k => text.includes(k))) {
          answer = faq.answer;
          break;
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ answer }));
    });
  }
});


server.listen(5000, () => {
  console.log("Chatbot server 5000-portda ishlayapti...");
});
