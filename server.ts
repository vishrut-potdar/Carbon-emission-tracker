import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use((_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

app.use(express.json());

const PORT = 3000;

// Initialize Gemini safely
const geminiApiKey = process.env.GEMINI_API_KEY;

// Lazy client generation, fail gracefully if keys are missing
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    if (!geminiApiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined!");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// API endpoint to parse dictated log
app.post("/api/gemini/parse-log", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text query" });
    }

    const client = getGeminiClient();
    if (!client) {
      return res.status(500).json({ 
        error: "Gemini API key is not configured. Please supply the GEMINI_API_KEY secret." 
      });
    }

    const promptText = `
Analyze the following user statement describing a carbon-related activity, and parse it into a structured carbon data payload.
User Statement: "${text}"

Available Categories and matched parameter requirements:
1. Category 'commute':
   - Description: customized short explanation matching the Eco Slate journal aesthetic (e.g., "Evening commute home on passenger rail corridor" or "Standard gasoline car commute")
   - commuteType: 'drive-ice', 'drive-ev', 'rail', 'bus', 'flight-domestic', 'flight-intl'
   - distanceKm: estimated numerical distance in kilometers (e.g. 15)

2. Category 'diet':
   - Description: customized short explanation matching the Eco Slate journal aesthetic (e.g., "Ate a vegetable-centric meal" or "Sustenance with beef protein")
   - dietType: 'vegan', 'vegetarian', 'mediterranean', 'poultry-centric', 'beef-centric'
   - dietDays: integer number of days (usually 1, unless they imply more)

3. Category 'procurement':
   - Description: customized short explanation matching the Eco Slate journal aesthetic (e.g., "Acquired fine physical garments" or "Microchip tech unit purchase")
   - procurementType: 'garments', 'electronics', 'books', 'appliances', 'furniture', 'general'
   - quantity: integer quantity of items (e.g. 1)

Your output must identify which category this fits best, design a brief high-quality description, select the correct sub-type, and fill in the details.
    `.trim();

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["category", "description"],
          properties: {
            category: {
              type: Type.STRING,
              description: "Must be exactly one of: 'commute', 'diet', 'procurement'"
            },
            description: {
              type: Type.STRING,
              description: "A short human-friendly summary of the action, matching the library or ledger wabi-sabi tone."
            },
            distanceKm: {
              type: Type.NUMBER,
              description: "For commute category, estimated distance in kilometers. Omit if not applicable."
            },
            commuteType: {
              type: Type.STRING,
              description: "For commute category, must be exactly one of the listed modes. Omit if not applicable."
            },
            dietType: {
              type: Type.STRING,
              description: "For diet category, must be exactly one of the listed profiles. Omit if not applicable."
            },
            dietDays: {
              type: Type.INTEGER,
              description: "For diet category, number of days. Defaults to 1 if not stated. Omit if not applicable."
            },
            procurementType: {
              type: Type.STRING,
              description: "For procurement category, must be exactly one of the listed categories. Omit if not applicable."
            },
            quantity: {
              type: Type.INTEGER,
              description: "For procurement category, quantity of items. Defaults to 1 if not stated. Omit if not applicable."
            }
          }
        }
      }
    });

    const parsedJsonStr = response.text?.trim() || "{}";
    const resultObj = JSON.parse(parsedJsonStr);
    return res.json(resultObj);
  } catch (error: any) {
    console.error("Error in parse-log API:", error);
    return res.status(500).json({ error: error.message || "Failed to process request" });
  }
});

// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
