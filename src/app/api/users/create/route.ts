
import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/userService';
import { pseudoHashPassword } from '@/context/AuthContext';
import type { StoredUser } from '@/types';
import { z } from 'zod';

const signupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parseResult = signupSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ message: "Invalid input", errors: parseResult.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, email, password } = parseResult.data;
        const formattedEmail = email.toLowerCase();

        const existingUser = await findUserByEmail(formattedEmail);
        if (existingUser) {
            return NextResponse.json({ message: "This email address is already registered." }, { status: 409 }); // 409 Conflict
        }

        const passwordHash = pseudoHashPassword(password);
        const newUser: Omit<StoredUser, 'id'> = { name, email: formattedEmail, passwordHash };

        const createdUser = await createUser(newUser);

        if (createdUser) {
            const { passwordHash: _, ...userToReturn } = createdUser;
            return NextResponse.json(userToReturn, { status: 201 });
        } else {
            throw new Error("User could not be created in the database.");
        }

    } catch (error) {
        console.error("Signup API error:", error);
        return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
    }
}
