import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { v4 as uuid } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { notes, selectedDoctor } = await req.json();
  const user = await currentUser();
  //31.36
  try {
    const sessionId = uuid();
    const result = await db
      .insert(SessionChatTable)
      .values({
        sessionId: sessionId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        notes: notes,
        selectedDoctor: selectedDoctor,
        createdOn: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message });
  }
}
