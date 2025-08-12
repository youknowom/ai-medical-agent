// import { db } from "@/config/db";
// import { SessionChatTable } from "@/config/schema";
// import { v4 as uuidv4 } from "uuid";
// import { NextRequest, NextResponse } from "next/server";
// import { currentUser } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm";

// // 🚀 POST: Create a new session
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

// // ✅ GET: Fetch session by sessionId
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const sessionId = searchParams.get("sessionId");
//   const user = awit currentUser();

//   if (!sessionId) {
//     return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
//   }

//   try {
//     const result = await db
//       .select()
//       .from(SessionChatTable)
//       .where(eq(SessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress));

//     if (!result.length) {
//       return NextResponse.json({ error: "Session not found" }, { status: 404 });
//     }

//     return NextResponse.json(result[0]);
//   } catch (error) {
//     console.error("❌ GET session error:", error);
//     return NextResponse.json(
//       { error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
// //

import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";

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
  const user = await currentUser();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  if (!user || !user.primaryEmailAddress?.emailAddress) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const result = await db
      .select()
      .from(SessionChatTable)
      .where(
        eq(SessionChatTable.createdBy, user.primaryEmailAddress.emailAddress)
      )
      .orderBy(desc(SessionChatTable.id));

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
