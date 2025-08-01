// // // // // // import { db } from "@/config/db";
// // // // // // import { SessionChatTable } from "@/config/schema";
// // // // // // import { v4 as uuidv4 } from "uuid";
// // // // // // import { NextRequest, NextResponse } from "next/server";
// // // // // // import { currentUser } from "@clerk/nextjs/server";

// // // // // // export async function POST(req: NextRequest) {
// // // // // //   const { notes, selectedDoctor } = await req.json();
// // // // // //   const user = await currentUser();

// // // // // //   if (!user || !user.primaryEmailAddress?.emailAddress) {
// // // // // //     return NextResponse.json(
// // // // // //       { error: "User not authenticated" },
// // // // // //       { status: 401 }
// // // // // //     );
// // // // // //   }

// // // // // //   try {
// // // // // //     const sessionId = uuidv4();

// // // // // //     const result = await db
// // // // // //       .insert(SessionChatTable)
// // // // // //       .values({
// // // // // //         sessionId,
// // // // // //         createdBy: user.primaryEmailAddress.emailAddress,
// // // // // //         notes,
// // // // // //         selectedDoctor,
// // // // // //         createdOn: new Date().toISOString(),
// // // // // //       })
// // // // // //       .returning();

// // // // // //     return NextResponse.json(result[0]);
// // // // // //   } catch (error) {
// // // // // //     return NextResponse.json(
// // // // // //       { error: (error as Error).message },
// // // // // //       { status: 500 }
// // // // // //     );
// // // // // //   }
// // // // // // }
// // // // // import { db } from "@/config/db";
// // // // // import { SessionChatTable } from "@/config/schema";
// // // // // import { v4 as uuidv4 } from "uuid";
// // // // // import { NextRequest, NextResponse } from "next/server";
// // // // // import { currentUser } from "@clerk/nextjs/server";

// // // // // export async function POST(req: NextRequest) {
// // // // //   const { notes, selectedDoctor } = await req.json();
// // // // //   const user = await currentUser();

// // // // //   if (!user || !user.primaryEmailAddress?.emailAddress) {
// // // // //     return NextResponse.json(
// // // // //       { error: "User not authenticated" },
// // // // //       { status: 401 }
// // // // //     );
// // // // //   }

// // // // //   try {
// // // // //     const sessionId = uuidv4();

// // // // //     const result = await db
// // // // //       .insert(SessionChatTable)
// // // // //       .values({
// // // // //         sessionId,
// // // // //         createdBy: user.primaryEmailAddress.emailAddress,
// // // // //         notes,
// // // // //         selectedDoctor: JSON.stringify(selectedDoctor), // ✅ fix here
// // // // //         createdOn: new Date().toISOString(),
// // // // //       })
// // // // //       .returning();

// // // // //     return NextResponse.json(result[0]);
// // // // //   } catch (error) {
// // // // //     console.error("❌ Session insert error:", error);
// // // // //     return NextResponse.json(
// // // // //       { error: (error as Error).message },
// // // // //       { status: 500 }
// // // // //     );
// // // // //   }
// // // // // }
// // // // // app/api/session/route.ts
// // // // import { db } from "@/config/db";
// // // // import { SessionChatTable } from "@/config/schema";
// // // // import { v4 as uuidv4 } from "uuid";
// // // // import { NextRequest, NextResponse } from "next/server";
// // // // import { currentUser } from "@clerk/nextjs/server";
// // // // import { eq } from "drizzle-orm";

// // // // export async function POST(req: NextRequest) {
// // // //   const { notes, selectedDoctor } = await req.json();
// // // //   const user = await currentUser();

// // // //   if (!user || !user.primaryEmailAddress?.emailAddress) {
// // // //     return NextResponse.json(
// // // //       { error: "User not authenticated" },
// // // //       { status: 401 }
// // // //     );
// // // //   }

// // // //   try {
// // // //     const sessionId = uuidv4();

// // // //     const result = await db
// // // //       .insert(SessionChatTable)
// // // //       .values({
// // // //         sessionId,
// // // //         createdBy: user.primaryEmailAddress.emailAddress,
// // // //         notes,
// // // //         selectedDoctor, // ✅ store as object
// // // //         conversation: [], // ✅ optional: safe default
// // // //         report: {}, // ✅ optional: safe default
// // // //         createdOn: new Date().toISOString(), // ✅ or use .defaultNow() in schema
// // // //       })
// // // //       .returning();

// // // //     return NextResponse.json(result[0]);
// // // //   } catch (error) {
// // // //     console.error("❌ Session insert error:", error);
// // // //     return NextResponse.json(
// // // //       { error: (error as Error).message },
// // // //       { status: 500 }
// // // //     );
// // // //   }
// // // // }
// // // // export async function GET(req: NextRequest) {
// // // //   const { searchParams } = new URL(req.url);
// // // //   const sessionId = searchParams.get("sessionId");
// // // //   const user = await currentUser();

// // // //   const result = await db
// // // //     .select()
// // // //     .from(SessionChatTable)
// // // //     //@ts-ignore
// // // //     .where(eq(SessionChatTable.sessionId, sessionId));
// // // //   return NextResponse.json(result[0]);
// // // // }
// // // import { NextRequest, NextResponse } from "next/server";
// // // import openai from "@/config/OpenAiModel";
// // // import { AIDoctorAgents } from "@/shared/list";

// // // export async function POST(req: NextRequest) {
// // //   const { notes } = await req.json();
// // //   console.log("🟢 Received notes:", notes);

// // //   try {
// // //     const completion = await openai.chat.completions.create({
// // //       model: "google/gemini-2.5-flash-lite",
// // //       messages: [
// // //         {
// // //           role: "system",
// // //           content: `You are a smart AI assistant that suggests the right doctor for a patient's symptoms from a given doctor list.`,
// // //         },
// // //         {
// // //           role: "user",
// // //           content: `Given the following symptoms: "${notes}", return a valid JSON array of matching doctors from the system list.

// // // Here is the system list of doctors: ${JSON.stringify(AIDoctorAgents)}

// // // Respond ONLY with raw JSON. No markdown. No explanation. No text before or after the JSON.`,
// // //         },
// // //       ],
// // //       temperature: 0.5,
// // //     });

// // //     const rawContent = completion.choices[0].message.content ?? "";
// // //     console.log("🟡 Raw AI Response:\n", rawContent);

// // //     // Clean rawContent to remove ```json or ``` wrappers if present
// // //     let cleanedJsonString = rawContent.trim();

// // //     if (
// // //       cleanedJsonString.startsWith("```json") ||
// // //       cleanedJsonString.startsWith("```")
// // //     ) {
// // //       cleanedJsonString = cleanedJsonString
// // //         .replace(/^```json/, "")
// // //         .replace(/^```/, "")
// // //         .replace(/```$/, "")
// // //         .trim();
// // //     }

// // //     let parsedJSON;
// // //     try {
// // //       parsedJSON = JSON.parse(cleanedJsonString);
// // //     } catch (err) {
// // //       console.error("❌ JSON parse error:", err);
// // //       return NextResponse.json(
// // //         {
// // //           error: true,
// // //           message: "AI did not return valid JSON",
// // //           raw: rawContent,
// // //         },
// // //         { status: 500 }
// // //       );
// // //     }

// // //     console.log("✅ Parsed JSON:", parsedJSON);
// // //     return NextResponse.json(parsedJSON, { status: 200 });
// // //   } catch (error) {
// // //     console.error("🔴 Error during suggestion fetch:", error);
// // //     return NextResponse.json(
// // //       { error: true, message: "Internal Server Error" },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }
// // // app/api/session-chat/route.ts
// // import { db } from "@/config/db";
// // import { SessionChatTable } from "@/config/schema";
// // import { v4 as uuidv4 } from "uuid";
// // import { NextRequest, NextResponse } from "next/server";
// // import { currentUser } from "@clerk/nextjs/server";

// // export async function POST(req: NextRequest) {
// //   const { notes, selectedDoctor } = await req.json();
// //   const user = await currentUser();

// //   if (!user || !user.primaryEmailAddress?.emailAddress) {
// //     return NextResponse.json(
// //       { error: "User not authenticated" },
// //       { status: 401 }
// //     );
// //   }

// //   try {
// //     const sessionId = uuidv4();

// //     const result = await db
// //       .insert(SessionChatTable)
// //       .values({
// //         sessionId,
// //         createdBy: user.primaryEmailAddress.emailAddress,
// //         notes,
// //         selectedDoctor: JSON.stringify(selectedDoctor), // Store as string
// //         createdOn: new Date().toISOString(),
// //       })
// //       .returning();

// //     // Return the sessionId in the response
// //     return NextResponse.json({
// //       sessionId: result[0].sessionId,
// //     });
// //   } catch (error) {
// //     console.error("❌ Session insert error:", error);
// //     return NextResponse.json(
// //       { error: (error as Error).message },
// //       { status: 500 }
// //     );
// //   }
// // }
// // app/api/session-chat/route.ts
// import { db } from "@/config/db";
// import { SessionChatTable } from "@/config/schema";
// import { v4 as uuidv4 } from "uuid";
// import { NextRequest, NextResponse } from "next/server";
// import { currentUser } from "@clerk/nextjs/server";

// export async function POST(req: NextRequest) {
//   const { notes, selectedDoctor } = await req.json();
//   const user = await currentUser();

//   if (!user || !user.primaryEmailAddress?.emailAddress) {
//     return NextResponse.json(
//       { error: "User not authenticated" },
//       { status: 401 }
//     );
//   }

//   try {
//     const sessionId = uuidv4();

//     const result = await db
//       .insert(SessionChatTable)
//       .values({
//         sessionId,
//         createdBy: user.primaryEmailAddress.emailAddress,
//         notes,
//         selectedDoctor: JSON.stringify(selectedDoctor),
//         createdOn: new Date().toISOString(),
//       })
//       .returning();

//     // Explicitly return the sessionId
//     return NextResponse.json({
//       sessionId: result[0].sessionId,
//     });
//   } catch (error) {
//     console.error("❌ Session insert error:", error);
//     return NextResponse.json(
//       { error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

// 🚀 POST: Create a new session
export async function POST(req: NextRequest) {
  const { notes, selectedDoctor } = await req.json();
  const user = await currentUser();

  if (!user || !user.primaryEmailAddress?.emailAddress) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const sessionId = uuidv4();

    const result = await db
      .insert(SessionChatTable)
      .values({
        sessionId,
        createdBy: user.primaryEmailAddress.emailAddress,
        notes,
        selectedDoctor: JSON.stringify(selectedDoctor),
        createdOn: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      sessionId: result[0].sessionId,
    });
  } catch (error) {
    console.error("❌ Session insert error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ✅ GET: Fetch session by sessionId
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (!result.length) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("❌ GET session error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
