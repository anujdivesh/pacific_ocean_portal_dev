import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";

export async function GET(req: NextRequest) {
  try {
    // Get the session cookie from the request
    const cookie = req.cookies.get("session")?.value;

    // Decrypt the session
    const session = await decrypt(cookie);

    // Return the session status
    return NextResponse.json({ isLoggedin: !!session?.userId, userId: session?.userId,countryId: session?.countryId });
  } catch (error) {
    console.error("Error in /api/session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}