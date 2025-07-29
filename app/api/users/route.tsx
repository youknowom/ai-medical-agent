// import { db } from "@/config/db";
// import { usersTable } from "@/config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// import { db } from "@/config/db";
// import { usersTable } from "@/config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const user = await currentUser();

//   if (!user?.primaryEmailAddress?.emailAddress) {
//     return NextResponse.json(
//       { error: "User email not found" },
//       { status: 400 }
//     );
//   }

//   try {
//     const users = await db
//       .select()
//       .from(usersTable)
//       .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress));

//     if (users.length === 0) {
//       const inserted = await db
//         .insert(usersTable)
//         .values({
//           name: user.fullName || "",
//           email: user.primaryEmailAddress.emailAddress,
//           credits: 10,
//         })
//         .returning();

//       return NextResponse.json(inserted[0]);
//     }

//     return NextResponse.json(users[0]);
//   } catch (error) {
//     console.error("User insert error:", error);
//     return NextResponse.json(
//       { error: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }
// import { db } from "@/config/db";
// import { usersTable } from "@/config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const user = await currentUser();
//   try {
//     //check if user already exists
//     const Users = await db
//       .select()
//       .from(usersTable)
//       //@ts-ignore
//       .where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress));
//     if (Users?.length == 0) {
//       const result = await db
//         .insert(usersTable)
//         .values({
//           //@ts-ignore
//           name: user?.fullName,
//           email: user?.primaryEmailAddress?.emailAddress,
//           redits: 10,
//           //@ts-ignore
//         })
//         .returning({ usersTable });
//       return NextResponse.json(result[0]?.userTable);
//     }
//     return NextResponse.json(Users[0]);
//   } catch (e) {
//     return NextResponse.json(e);
//   }
// }

// import { db } from "@/config/db";
// import { usersTable } from "@/config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const user = await currentUser();

//   const email = user?.primaryEmailAddress?.emailAddress;
//   const name = user?.fullName;

//   if (!email || !name) {
//     return NextResponse.json({ error: "Missing user data." }, { status: 400 });
//   }

//   try {
//     const existingUsers = await db
//       .select()
//       .from(usersTable)
//       .where(eq(usersTable.email, email));

//     if (existingUsers.length === 0) {
//       const newUser = await db
//         .insert(usersTable)
//         .values({
//           name,
//           email,
//           credits: 10,
//         })
//         .returning();

//       return NextResponse.json(newUser[0]);
//     }

//     return NextResponse.json(existingUsers[0]);
//   } catch (error) {
//     console.error("Error inserting user:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    const email = user?.primaryEmailAddress?.emailAddress;
    const name = user?.fullName;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Incomplete user data" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUsers.length === 0) {
      const newUser = await db
        .insert(usersTable)
        .values({
          name,
          email,
          credits: 10, // Fixed typo
        })
        .returning(); // Returns inserted row(s)

      return NextResponse.json(newUser[0]); // Return inserted user
    }

    // User already exists
    return NextResponse.json(existingUsers[0]);
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
