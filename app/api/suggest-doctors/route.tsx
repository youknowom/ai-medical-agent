// import { NextRequest, NextResponse } from "next/server";
// import openai from "@/config/OpenAiModel";
// import { AIDoctorAgents } from "@/shared/list";

// export async function POST(req: NextRequest) {
//   const { notes } = await req.json();
//   try {
//     console.log("🟢 Received notes:", notes);

//     const completion = await openai.chat.completions.create({
//       model: "google/gemini-2.5-flash-lite",
//       messages: [
//         { role: "system", content: JSON.stringify(AIDoctorAgents) },
//         {
//           role: "user",
//           content: `User Notes/Symptoms: ${notes}, Based on these, please suggest doctors in JSON format.`,
//         },
//       ],
//     });

//     const rawContent = completion.choices[0].message.content ?? "";

//     // Clean up code block wrappers (```json ... ```)
//     const cleanedJsonString = rawContent
//       .trim()
//       .replace(/^```json/, "")
//       .replace(/```$/, "")
//       .trim();

//     const parsedJSON = JSON.parse(cleanedJsonString);

//     return NextResponse.json({ message: parsedJSON });
//   } catch (e) {
//     return NextResponse.json(
//       {
//         error: true,
//         message: (e as Error).message || "Something went wrong",
//       },
//       { status: 500 }
//     );
//   }
// }
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
        {
          role: "system",
          content: JSON.stringify(AIDoctorAgents),
        },
        {
          role: "user",
          content: `You are a smart assistant that selects doctors based on user symptoms from the list provided in the system message. User Notes: "${notes}". Return only a raw JSON array of doctor objects, without markdown or explanations.`,
        },
      ],
    });

    const rawContent = completion.choices[0].message.content ?? "";
    console.log("📦 Raw AI content:", rawContent);

    const cleanedJsonString = rawContent
      .trim()
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();

    let parsedJSON;
    try {
      parsedJSON = JSON.parse(cleanedJsonString);
    } catch (jsonError) {
      console.error("❌ JSON parse error:", jsonError);
      return NextResponse.json(
        {
          error: true,
          message: "AI response was not valid JSON.",
          raw: rawContent, // helpful for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: parsedJSON });
  } catch (e) {
    console.error("❌ suggest-doctors API error:", e);
    return NextResponse.json(
      {
        error: true,
        message: (e as Error).message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
