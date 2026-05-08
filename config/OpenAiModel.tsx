import OpenAI from "openai";

// ─── Shared OpenRouter client ─────────────────────────────────────────────────
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export const geminiVisionClient = openai; // same client, different model

// ─── Model Constants (all verified working on OpenRouter) ─────────────────────

// 📄 TEXT / PDF / CHAT — DeepSeek Chat V3 (strong medical reasoning)
export const DEEPSEEK_MODEL = "deepseek/deepseek-chat";

// 🖼️ IMAGE VISION — Waterfall: try each until one works
// Meta Llama 3.2 Vision → Qwen2-VL → Llama 3.2 90B (paid fallback)
export const VISION_MODELS = [
  "meta-llama/llama-3.2-11b-vision-instruct:free",   // ✅ Free, true vision model
  "qwen/qwen2-vl-7b-instruct:free",                   // ✅ Free, Qwen VL vision model
  "meta-llama/llama-3.2-90b-vision-instruct",          // Paid fallback, very capable
];

// 💬 FREE TEXT FALLBACK — if DeepSeek fails
export const FREE_TEXT_FALLBACK_MODEL = "qwen/qwen-2.5-72b-instruct:free";

// Keep named export for backwards compatibility
export const GEMINI_VISION_MODEL = VISION_MODELS[0];

export default openai;
