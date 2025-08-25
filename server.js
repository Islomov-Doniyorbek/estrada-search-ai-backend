import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 🔹 Search pages
const pages = [ /* ... siz yozgan pages massiv ... */ ];

// 🔹 normalizeQuery
async function normalizeQuery(query) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `So'zni to'g'rilang va faqat to'g'rilangan variantini chiqaring: ${query}` }] }
        ]
      })
    }
  );

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || query;
}

// 🔹 Search endpoint
app.get("/api/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Query required" });

  const fixedQuery = await normalizeQuery(q);

  const match = pages.find(p =>
    p.content.toLowerCase().includes(fixedQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(fixedQuery.toLowerCase())
  );

  if (match) {
    return res.json({ found: true, path: match.path, fixedQuery });
  }

  res.json({
    found: false,
    fixedQuery,
    suggestedPath: null
  });
});

// 🔹 Chatbot qismini Express ichida yozamiz
const faqs = [
  { keys: ["qabul", "hujjat"], answer: "Qabul hujjatlari 10-iyuldan 20-avgustgacha davom etadi." },
  { keys: ["to'lov", "narx"], answer: "O'qish to'lovi 12 mln so'mdan boshlanadi." },
  { keys: ["kafedra", "fakultet", "yo'nalish"], answer: "Institutda \"Estrada cholg'u ijrochiligi\" va \"Estrada xonandaligi\" fakultetlari mavjud." },
  { keys: ["manzil", "adres"], answer: "Bizning manzil: Toshkent shahri, Universitet ko'chasi 12-uy." }
];

app.post("/chat", (req, res) => {
  const { question } = req.body;
  const text = question?.toLowerCase() || "";

  let answer = "Kechirasiz, bu savol bo‘yicha ma’lumot topilmadi.";
  for (let faq of faqs) {
    if (faq.keys.some(k => text.includes(k))) {
      answer = faq.answer;
      break;
    }
  }

  res.json({ answer });
});

// 🔹 Server start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlayapti...`);
});
