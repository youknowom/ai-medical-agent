import { NextRequest, NextResponse } from "next/server";
import openai from "@/config/OpenAiModel";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileBase64, fileType, fileName, userMessage, conversationHistory } = body;

        if (!userMessage && !fileBase64) {
            return NextResponse.json({ error: "No file or message provided" }, { status: 400 });
        }

        const systemPrompt = `You are MediScan AI, an expert medical report analyzer. You analyze medical documents, lab reports, prescriptions, X-rays, and health records.

When analyzing a medical report, you:
1. Extract all key values (lab results, measurements, vitals, medications, dosages)
2. Compare values to normal reference ranges
3. Flag abnormal values clearly (HIGH/LOW/CRITICAL)
4. Explain findings in simple, patient-friendly language
5. Provide a structured summary with sections: Patient Info, Test Results, Abnormal Findings, Interpretation, and Recommendations

Always format your response in a clear, structured way with sections and use emojis to make it easy to read.
If asked follow-up questions, answer clearly based on the report context.
IMPORTANT: Always remind users to consult a real doctor for medical decisions.`;

        const messages: any[] = [
            { role: "system", content: systemPrompt },
            ...((conversationHistory as any[]) || []),
        ];

        if (fileBase64) {
            // Include the file as a vision message
            const userContent: any[] = [
                {
                    type: "text",
                    text: userMessage || "Please analyze this medical report in detail. Extract all important values, identify any abnormal results, and provide a clear explanation in simple language.",
                },
            ];

            // Add image if it's an image type
            if (fileType?.startsWith("image/")) {
                userContent.push({
                    type: "image_url",
                    image_url: {
                        url: `data:${fileType};base64,${fileBase64}`,
                    },
                });
            } else if (fileType === "application/pdf") {
                // For PDFs, we pass the base64 as text context
                userContent[0].text = `${userContent[0].text}\n\n[PDF Document: ${fileName}]\nNote: Please analyze this medical PDF document. The file has been uploaded. Extract and analyze all medical information visible.`;
            }

            messages.push({ role: "user", content: userContent });
        } else {
            messages.push({ role: "user", content: userMessage });
        }

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages,
            max_tokens: 2000,
            temperature: 0.3,
        });

        const responseText = completion.choices[0]?.message?.content || "Unable to analyze the report.";

        return NextResponse.json({
            response: responseText,
            usage: completion.usage,
        });
    } catch (error: any) {
        console.error("❌ Medical report scan error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze report" },
            { status: 500 }
        );
    }
}
