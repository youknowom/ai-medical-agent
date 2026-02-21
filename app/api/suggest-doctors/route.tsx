import { NextRequest, NextResponse } from "next/server";
import openai from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";

export async function POST(req: NextRequest) {
  try {
    // Parse body inside try so malformed JSON is caught
    const body = await req.json();
    const { notes } = body;

    if (!notes || typeof notes !== "string" || !notes.trim()) {
      return NextResponse.json(
        { error: true, message: "Missing or empty notes field." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        {
          role: "system",
          content: JSON.stringify(AIDoctorAgents),
        },
        {
          role: "user",
          content: `You are a smart assistant that selects doctors based on user symptoms from the list provided in the system message. User Notes: "${notes.trim()}". Return only a raw JSON array of doctor objects (max 3), without markdown or explanations.`,
        },
      ],
      max_tokens: 512,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    // Strip markdown code fences if present
    const cleanedJson = rawContent
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(cleanedJson);
    } catch {
      console.error("❌ JSON parse error. Raw content:", rawContent);
      return NextResponse.json(
        { error: true, message: "AI response was not valid JSON." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: parsedJSON });
  } catch (error) {
    console.error("❌ suggest-doctors API error:", error);
    return NextResponse.json(
      { error: true, message: (error as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
