import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    console.log("Received text from frontend:", text);
    if (!text) {
      console.error("No text provided");
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey) {
      console.error("OpenRouter API key not set");
      return NextResponse.json(
        { error: "OpenRouter API key not set" },
        { status: 500 },
      );
    }

    // Use a free/open model (e.g., meta-llama/llama-3-8b-instruct)
    const model = "meta-llama/llama-3-8b-instruct";
    const prompt = `Extract all medical symptoms from this text: "${text}". Return ONLY a JSON array of symptom strings, no explanation.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are a medical entity extraction assistant.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 256,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenRouter API error:", error);
      return NextResponse.json(
        { error: error.error?.message || "OpenRouter API error" },
        { status: 500 },
      );
    }

    const data = await response.json();
    console.log("OpenRouter API response:", JSON.stringify(data));
    // Try to parse the model's response as a JSON array
    let entities: string[] = [];
    try {
      const content = data.choices?.[0]?.message?.content || "";
      console.log("Model content:", content);
      entities = JSON.parse(content);
    } catch (err) {
      // fallback: try to extract array from text
      const content = data.choices?.[0]?.message?.content || "";
      const match = content.match(/\[.*\]/s);
      if (match) {
        try {
          entities = JSON.parse(match[0]);
        } catch (e) {
          console.error("JSON parse fallback error:", e);
        }
      } else {
        console.error("No array found in model content");
      }
    }
    console.log("Extracted entities:", entities);
    return NextResponse.json({ entities });
  } catch (error) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
