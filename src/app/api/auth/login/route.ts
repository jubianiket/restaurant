
import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/userService';
import { pseudoHashPassword } from '@/context/AuthContext';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: "Invalid input", errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = parseResult.data;
    const passwordHash = pseudoHashPassword(password);

    const foundUser = await findUserByEmail(email.toLowerCase());

    if (foundUser && foundUser.passwordHash === passwordHash) {
      // Don't send password hash to the client
      const { passwordHash: _, ...userToReturn } = foundUser;
      return NextResponse.json(userToReturn);
    } else {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}
