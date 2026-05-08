import { NextRequest, NextResponse } from "next/server";
import openai, {
    DEEPSEEK_MODEL,
    VISION_MODELS,
    FREE_TEXT_FALLBACK_MODEL,
} from "@/config/OpenAiModel";

export const maxDuration = 60;

// ─── Shared System Prompt ─────────────────────────────────────────────────────
const systemPrompt = `You are MediScan AI — a professional, friendly female AI medical assistant and report analyzer created by MediPulse.

## YOUR SCOPE — STRICTLY MEDICAL ONLY
You ONLY discuss medical topics. If anyone asks about non-medical subjects (e.g., coding, recipes, sports, politics, math, entertainment), politely decline and redirect them:
"I'm MediScan AI, your dedicated medical assistant! 🩺 I can only help with health and medical questions. Please ask me something health-related!"

## WHEN ANALYZING A MEDICAL REPORT:
1. Extract all key values (lab results, measurements, vitals, medications, dosages)
2. Compare values to normal reference ranges
3. Flag abnormal values clearly with badges: 🔴 HIGH | 🔴 LOW | ⚠️ BORDERLINE | ✅ NORMAL
4. Explain findings in simple, patient-friendly language
5. Provide a structured summary with these sections:
   - 👤 Patient Information
   - 🧪 Test Results (with values vs reference range)
   - ⚠️ Abnormal Findings
   - 📋 Interpretation
   - 💡 Recommendations
   - 👨‍⚕️ Which Doctor to See

## WHEN USER DESCRIBES SYMPTOMS (no report uploaded):
Always provide:
1. Brief explanation of the likely condition
2. Home care tips (if safe and applicable)
3. ⚠️ Warning signs that need immediate attention
4. 👨‍⚕️ DOCTOR TYPE RECOMMENDATION — Always specify which specialist to consult. Examples:
   - Cold/flu/fever/cough → 🏥 General Physician / Family Doctor
   - Chest pain/heart issues → ❤️ Cardiologist
   - Skin rashes/acne → 🫁 Dermatologist
   - Bone/joint/muscle pain → 🦴 Orthopedic Specialist
   - Anxiety/depression/mental health → 🧠 Psychiatrist or Psychologist
   - Eye problems → 👁️ Ophthalmologist
   - Ear/nose/throat → 👃 ENT Specialist
   - Stomach/digestive issues → 🩺 Gastroenterologist
   - Children's health → 👶 Pediatrician
   - Women's health → 🌸 Gynecologist
   - Diabetes/thyroid/hormones → 💉 Endocrinologist
   - Urinary/kidney issues → 🫘 Urologist/Nephrologist
   - Neurological (headaches, seizures) → 🧠 Neurologist
   - Allergies/asthma → 🌬️ Allergist/Pulmonologist
   - Always encourage using MediPulse's "Find Nearby Doctors" feature!

## FORMATTING RULES:
- Always use clear sections with emoji headers
- Use bullet points for lists
- For lab values, show: Value | Normal Range | Status
- Be warm, empathetic, and professional
- End every response with a disclaimer: "⚠️ This is AI-generated guidance. Please consult a qualified doctor for diagnosis and treatment."

## CRITICAL RULES:
- NEVER discuss anything outside of health and medicine
- NEVER diagnose definitively — always say "may indicate" or "could suggest"
- ALWAYS recommend seeing a real doctor
- Be concise but thorough`;

// ─── Try vision models in waterfall order ────────────────────────────────────
async function callVisionModelWithFallback(messages: any[]): Promise<{ content: string; model: string }> {
    for (const model of VISION_MODELS) {
        try {
            console.log(`🔍 Trying vision model: ${model}`);
            const completion = await openai.chat.completions.create({
                model,
                messages,
                max_tokens: 2000,
                temperature: 0.3,
            });
            const content = completion.choices[0]?.message?.content;
            if (content) {
                console.log(`✅ Vision success with: ${model}`);
                return { content, model };
            }
        } catch (err: any) {
            console.warn(`❌ Vision model [${model}] failed:`, err?.message || err?.status);
        }
    }
    throw new Error("All vision models failed");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            fileBase64,
            fileType,
            fileName,
            userMessage,
            conversationHistory,
        } = body;

        if (!userMessage && !fileBase64) {
            return NextResponse.json(
                { error: "No file or message provided" },
                { status: 400 }
            );
        }

        const isImage = fileBase64 && fileType?.startsWith("image/");
        const isPDF = fileBase64 && fileType === "application/pdf";
        const defaultAnalyzePrompt = "Please analyze this medical report in detail. Extract all important values, identify any abnormal results, and provide a clear explanation in simple language.";

        // ── BRANCH A: IMAGE → Vision model waterfall ──────────────────────────
        if (isImage) {
            const visionMessages: any[] = [
                { role: "system", content: systemPrompt },
                ...((conversationHistory as any[]) || []),
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: userMessage || defaultAnalyzePrompt,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${fileType};base64,${fileBase64}`,
                            },
                        },
                    ],
                },
            ];

            try {
                const { content, model } = await callVisionModelWithFallback(visionMessages);
                return NextResponse.json({ response: content, model, strategy: "vision" });
            } catch (visionErr: any) {
                console.error("❌ All vision models failed:", visionErr?.message);
                // Surface the real error so user knows vision truly failed
                return NextResponse.json(
                    {
                        error: "Image analysis is currently unavailable. All vision models failed. Please try again in a few minutes, or describe the report contents in text.",
                    },
                    { status: 503 }
                );
            }
        }

        // ── BRANCH B: PDF ──────────────────────────────────────────────────────
        // ── BRANCH C: TEXT / CHAT (no file, or follow-up message) ────────────
        const textMessages: any[] = [
            { role: "system", content: systemPrompt },
            ...((conversationHistory as any[]) || []),
        ];

        if (isPDF) {
            textMessages.push({
                role: "user",
                content: `${userMessage || defaultAnalyzePrompt}\n\n[PDF Document: ${fileName}]\nThis is a medical PDF document uploaded by the user. Please analyze all medical information, lab results, medications, diagnoses, and any other clinical data present.\n\nFile Name: ${fileName}`,
            });
        } else {
            textMessages.push({
                role: "user",
                content: userMessage,
            });
        }

        // Try DeepSeek, fall back to free Qwen model
        let usedModel = DEEPSEEK_MODEL;
        let textCompletion: any;

        try {
            textCompletion = await openai.chat.completions.create({
                model: DEEPSEEK_MODEL,
                messages: textMessages,
                max_tokens: 2000,
                temperature: 0.3,
            });
        } catch (deepseekErr: any) {
            console.warn("⚠️ DeepSeek failed, trying Qwen fallback:", deepseekErr?.message);
            usedModel = FREE_TEXT_FALLBACK_MODEL;
            textCompletion = await openai.chat.completions.create({
                model: FREE_TEXT_FALLBACK_MODEL,
                messages: textMessages,
                max_tokens: 2000,
                temperature: 0.3,
            });
        }

        const responseText =
            textCompletion.choices[0]?.message?.content ||
            "Unable to analyze the report.";

        return NextResponse.json({
            response: responseText,
            usage: textCompletion.usage,
            model: usedModel,
            strategy: isPDF ? "pdf" : "text",
        });

    } catch (error: any) {
        console.error("❌ Medical report scan error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze report" },
            { status: 500 }
        );
    }
}
