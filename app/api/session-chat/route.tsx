import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq, and } from "drizzle-orm";

// ── POST: Create a new session ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notes, selectedDoctor } = body;

    if (!notes || !selectedDoctor) {
      return NextResponse.json(
        { error: "Missing notes or selectedDoctor" },
        { status: 400 }
      );
    }

    const user = await currentUser();
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

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

    return NextResponse.json({ sessionId: result[0].sessionId });
  } catch (error) {
    console.error("❌ Session insert error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── GET: Fetch sessions for the current user ────────────────────────────────
// ?sessionId=all  → returns all sessions for the user
// ?sessionId=<id> → returns the specific session (must belong to user)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const user = await currentUser();
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const email = user.primaryEmailAddress.emailAddress;

    // Return ALL sessions for this user
    if (sessionId === "all") {
      const results = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, email))
        .orderBy(desc(SessionChatTable.id));

      return NextResponse.json(results);
    }

    // Return a single specific session (validate ownership)
    const results = await db
      .select()
      .from(SessionChatTable)
      .where(
        and(
          eq(SessionChatTable.sessionId, sessionId),
          eq(SessionChatTable.createdBy, email)
        )
      )
      .orderBy(desc(SessionChatTable.id));

    if (!results.length) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    console.error("❌ GET session error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
