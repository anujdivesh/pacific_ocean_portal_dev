import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is not set.");
}
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(countryId: string, userId: string) {
  //const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
  const expiresAt = new Date(Date.now() + 23 * 60 * 60 * 1000);
  //const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  const session = await encrypt({ countryId, userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies only in production
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

type SessionPayload = {
  countryId: string;
  userId: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Match the cookie expiration
    .sign(encodedKey);
}

/*
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Failed to verify session:", error);
    return null;
  }
}*/

/*
export async function decrypt(session: string | undefined = "") {
  try {
    // Check if the session token is provided
    if (!session) {
      //console.error("Session token is missing or empty.");
      return null;
    }

    // Log the session token for debugging
    console.log("Session Token:", session);

    // Verify and decode the JWT
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    // Log the decoded payload for debugging
   // console.log("Decoded Payload:", payload);

    return payload;
  } catch (error) {
 console.log(error)

    return null;
  }
}*/

export async function decrypt(session: string | undefined = "") {
  try {
    if (!session) {
     //console.error("Session token is missing or empty.");
      return null;
    }


    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });


    return payload;
  } catch  {
    return null;
  }
}