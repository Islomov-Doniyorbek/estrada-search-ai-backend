import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const pages = [
  { 
    title: "About Us", 
    path: "/Talim/Bakalavr", 
    content: "Qabul dasturlari. Bakalavriyat ta'lim yo'nalishlari uchun o'quv dasturlari" 
  },
  { 
    title: "Contact", 
    path: "/Qabul/Qabulkvotalari", 
    content: "2024-2025 o‘quv yilida bakalavriat ta’lim yo‘nalishlari uchun qabul kvotasi. 2024-2025 o‘quv yilida magistratura ta’lim yo‘nalishlari uchun qabul kvotasi" 
  },
  { 
    title: "Contact", 
    path: "/Qabul/XorijiyStudentlar", 
    content: "Xorijiy Fuqarolar uchun Qabul" 
  },
  { 
    title: "Contact", 
    path: "/Qabul/Kuzatuv", 
    content: "kasbiy (ijodiy) imtihonlar" 
  },
  { 
    title: "Contact", 
    path: "/Institut/fakultet", 
    content: "Fakultet va kafedralar. Estrada cholgʻu ijrochiligi fakulteti  Estrada cholg‘ularida ijrochilik Estrada ijrochiligi pedagoglari tayyorlash Kompozitorlik va aranjirovka Orkestr dirijyorligi Fakultetlararo fortepiano ijrochiligi Estrada xonandaligi fakulteti  Estrada xonandaligi Musiqiy ovoz rejissorligi Musiqiy nazariy va tarixiy fanlar O‘zbek tili, sport va ijtimoiy fanlar" 
  },
  { 
    title: "Products", 
    path: "/Institut/Rahbariyat", 
    content: "instituti rektori prorektor" 
  },
  { 
    title: "tarix", 
    path: "/Institut/Tarix", 
    content: "institut tarixi 1885 1997 2002 2021 2022 2023 Prezident qarori" 
  },
  { 
    title: "tarix", 
    path: "/Institut/Meyoriy Huquqiy Hujjatlar", 
    content: "Me'yoriy-huquqiy hujjatlar ustav" 
  },
  { 
    title: "tarix", 
    path: "/Institut/Xalqaro hamkorlik", 
    content: "Xalqaro hamkorlik" 
  },
  { 
    title: "tarix", 
    path: "/Institut/Botir Zokirov Hayoti va Ijodi", 
    content: "Botir Zokirov Hayoti va Ijodi" 
  },
  { 
    title: "tarix", 
    path: "/Talim/DarsJadvali", 
    content: "dars jadvali" 
  },
  { 
    title: "tarix", 
    path: "/Talim/Bitiruvchilar", 
    content: "Bitiruvchilar" 
  },
  { 
    title: "tarix", 
    path: "/Activity/Activity", 
    content: "Ilmiy tadqiqot" 
  },
  { 
    title: "tarix", 
    path: "/Activity/ActiveCouncil", 
    content: "Ilmiy kengashlar" 
  },
  { 
    title: "tarix", 
    path: "/Activity/ActiveCouncil", 
    content: "Ilmiy kengashlar" 
  },
  { 
    title: "tarix", 
    path: "/Activity/Article", 
    content: "Ilmiy jurnallar ilmiy maqolalar" 
  },
  { 
    title: "tarix", 
    path: "/Activity/Projects", 
    content: "Ilmiy loyihalar " 
  },
  { 
    title: "tarix", 
    path: "/News/Allnews", 
    content: "Yangiliklar" 
  },
  { 
    title: "tarix", 
    path: "/News/Events", 
    content: "Tadbirlar" 
  },
  { 
    title: "tarix", 
    path: "/News/Connect", 
    content: "Bog‘lanish ma’lumotlari faks" 
  },
  { 
    title: "tarix", 
    path: "/News/Documents", 
    content: "Imtihon Natijalari" 
  },
  { 
    title: "tarix", 
    path: "/Qabul/Callcentr", 
    content: "Call Centr “Registrator ofisi”" 
  },
  { 
    title: "tarix", 
    path: "/Students/Ecostudentds", 
    content: "Ekofaol talabalar" 
  },
  { 
    title: "tarix", 
    path: "/Students/Grand", 
    content: "Grant uchun ariza" 
  },
  { 
    title: "tarix", 
    path: "/Students/Yutuqlar", 
    content: "Talabalar yutuqlari" 
  },
  { 
    title: "tarix", 
    path: "/Students/Tests", 
    content: "Grant uchun test" 
  },
  { 
    title: "Botir Zokirov", 
    path: "/dashboard", 
    content: "Botir Zokirov — o‘zbek estrada san’atining afsonaviy xonandasi va aktyori." 
  }
];

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
