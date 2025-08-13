import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const pages = [ /* sizning sahifalar ro'yxati */ ];

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://institut-fd2l.vercel.app"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// AI orqali qidiruv so'zini normallashtirish
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

// 🔹 1) Suggestions endpoint (variantlar chiqadi)
app.get("/api/suggestions", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  const fixedQuery = await normalizeQuery(q);

  const suggestions = pages.filter(p =>
    p.content.toLowerCase().includes(fixedQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(fixedQuery.toLowerCase())
  )
  .map(p => ({ title: p.title, path: p.path }))
  .slice(0, 5);

  res.json(suggestions);
});

// 🔹 2) Search endpoint (bitta sahifaga yo‘naltiradi)
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
    suggestedPath: null,
    suggestion: null
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
