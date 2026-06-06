import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client securely
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn("GEMINI_API_KEY is not defined in environment variables. AI operations will use offline mode fallback.");
}

// -------------------------------------------------------------
// SECURE SERVER-SIDE ENDPOINTS PROXYING GEMINI API
// -------------------------------------------------------------

// 1. Personalized Learning Recommendations
app.post("/api/recommendations", async (req, res) => {
  try {
    const { studentName, averageQuizScore, studyTimeHours, activeStreakDays, subjectName } = req.body;

    if (!ai) {
      return res.json({
        recommendation: `Hello ${studentName || "Student"}, based on your current studies in ${subjectName || "your courses"}, we recommend dedicating 2 more hours to solving problem sets. (Note: Secure AI server recommendation engine is currently in standalone mode).`,
        tips: ["Spend 15 mins daily reviewing Dirac matrices.", "Attempt challenging quiz options at least twice."]
      });
    }

    const prompt = `Analyze this student performance metrics for course "${subjectName || "Science/CS"}":
    - Name: ${studentName || "Anonymous"}
    - Average Quiz Score: ${averageQuizScore || 75}%
    - Weekly Studying Time: ${studyTimeHours || 10} hours
    - Daily Consecutive Study Streak: ${activeStreakDays || 3} days.
    
    Provide a highly personalized study path recommendation in plain English. Keep it motivating, compact (under 120 words), and provide 3 actionable, highly specific tactical tips (not generic of "study hard", make them related to physics, algorithms, math vectors, or computer science concepts based on the subject).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an Elite Academic Advisor specializing in high-performance computer science and engineering learning path recommendations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["recommendation", "tips"],
          properties: {
            recommendation: {
              type: Type.STRING,
              description: "Motivating personalized textual summary describing exact learning insights and paths to optimize scores."
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly three highly tactical computer science or physics learning study habit bullets matching user metrics."
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No textual response from Gemini");
    }

    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Gemini Recommendations Error:", error);
    res.status(500).json({ error: "Failed to generate AI recommendations", detail: error.message });
  }
});

// 2. Interactive Unit Quiz Generator
app.post("/api/quiz-generate", async (req, res) => {
  try {
    const { topic, subject } = req.body;

    if (!ai) {
      // In standalone fallback, construct a customized interactive quiz
      return res.json({
        title: `AI-Generated ${topic || "Fundamentals"} Quiz`,
        topic: topic || "Fundamentals",
        questions: [
          {
            id: "ae_1",
            question: `In standard terms, what characterizes ${topic || "this topic"} system operations?`,
            options: ["Linear algebraic projection vectors", "Greedy polynomial search paths", "Dynamic scale scaling parameters", "None of the above"],
            correctOptionIndex: 0,
            explanation: "Linear algebraic representations define quantum and digital computations."
          },
          {
            id: "ae_2",
            question: "Why does the optimization state depend on boundary inputs?",
            options: ["Recursive memoization blocks", "State complexity limits", "Standard data normalization", "Temporal data latency"],
            correctOptionIndex: 0,
            explanation: "Overlapping subproblems are cached by dynamic registers."
          }
        ]
      });
    }

    const prompt = `Generate an advanced academic interactive quiz for the subject "${subject || "Advanced Science"}" and core topic topic "${topic || "Quantum/DSA Theory"}".
    Provide exactly three high-quality, challenging multiple-choice questions. 
    Include four plausible options for each, designate the correctOptionIndex (0-3), and supply a very detailed explanation for why that specific option is correct.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI Examination Professor. Output high-clarity technical evaluation papers with authentic engineering rigor, avoid trivial questions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "topic", "questions"],
          properties: {
            title: { type: Type.STRING, description: "A highly descriptive title for this Quiz exam sheet." },
            topic: { type: Type.STRING, description: "Sub-topic of study." },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "question", "options", "correctOptionIndex", "explanation"],
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING, description: "A challenging academic question outlining a specific hypothetical problem or formula." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 multiple choice options."
                  },
                  correctOptionIndex: { type: Type.INTEGER, description: "0-indexed position (0, 1, 2, or 3) of the correct answer." },
                  explanation: { type: Type.STRING, description: "Detailed scientific, computational, or mechanical explanation of the correct choice." }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response string from Gemini Quiz generator");
    }

    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Gemini Quiz Generator Error:", error);
    res.status(500).json({ error: "Failed to generate dynamic AI quiz exam", detail: error.message });
  }
});

// 3. AI Tutor Chat Assist
app.post("/api/tutor-chat", async (req, res) => {
  try {
    const { unitTitle, chatHistory, userMessage } = req.body;

    if (!ai) {
      return res.json({
        reply: `Excellent query on ${unitTitle || "the topic"}. In quantum dualities or algorithmic complexities, caching states is vital. (AI Tutor is currently operating in local mode; set GEMINI_API_KEY in secrets to activate real-time interactions).`
      });
    }

    // Build chat structure
    const historyPrompt = (chatHistory || []).map((msg: any) => `${msg.sender === "user" ? "Student" : "Tutor"}: ${msg.text}`).join("\n");
    const fullPrompt = `Subject Unit of Study: ${unitTitle || "Engineering Concepts"}.
    Conversation History:
    ${historyPrompt}
    Student: ${userMessage}
    Tutor:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: "You are SocraticTutor, a world-class kind but intellectually demanding Socratic academic helper. Instead of giving code copy-pastes instantly, explain algebraic, mathematical, and logical principles of quantum mechanics or algorithms simply. Use markdown format. Keep answers concise under 180 words."
      }
    });

    res.json({ reply: response.text || "I apologize, my tutor circuits were interrupted. How can I guide you next?" });
  } catch (error: any) {
    console.error("AI Tutor Error:", error);
    res.status(500).json({ error: "AI Tutor routing failure", detail: error.message });
  }
});

// -------------------------------------------------------------
// VITE AND STATIC ASSETS SERVING BUILD ENGINE
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Mounted static file client server from ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Open-EdTech Personalized Student Learning Platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
