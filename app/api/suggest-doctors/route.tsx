import { NextRequest, NextResponse } from "next/server";
import openai from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";

export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  try {
    console.log("🟢 Received notes:", notes);

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: JSON.stringify(AIDoctorAgents) },
        {
          role: "user",
          content: `User Notes/Symptoms: ${notes}, Based on these, please suggest doctors in JSON format.`,
        },
      ],
    });

    const rawContent = completion.choices[0].message.content ?? "";

    // Clean up code block wrappers (```json ... ```)
    const cleanedJsonString = rawContent
      .trim()
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();

    const parsedJSON = JSON.parse(cleanedJsonString);

    return NextResponse.json({ message: parsedJSON });
  } catch (e) {
    return NextResponse.json(
      {
        error: true,
        message: (e as Error).message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}
