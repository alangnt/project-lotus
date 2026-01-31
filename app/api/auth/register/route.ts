import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { registrationSchema } from '@/lib/validations';
import { errorResponse, successResponse, handleValidationError } from '@/lib/utils';

const pool = getPool();

async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

// Handle registration request
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, email, password } = body;
        
        // Validate input with Zod (includes password strength check)
        const validationResult = registrationSchema.safeParse({ username, email, password });
        
        if (!validationResult.success) {
            return handleValidationError(validationResult.error);
        }

        const validData = validationResult.data;

        // Check if user already exists
        const checkUserQuery = "SELECT id FROM users_lotus WHERE email = $1 OR username = $2";
        const checkUserResult = await pool.query(checkUserQuery, [validData.email, validData.username]);

        if (checkUserResult.rows.length > 0) {
            return errorResponse('User with this email or username already exists', 400);
        }

        // Hash the password
        const hashedPassword = await hashPassword(validData.password);

        // Insert new user
        const insertUserQuery = `
            INSERT INTO users_lotus (
                username, email, password, points
            ) VALUES ($1, $2, $3, $4) 
            RETURNING id, email, username
        `;
        const insertUserResult = await pool.query(insertUserQuery, [
            validData.username,
            validData.email, 
            hashedPassword, 
            0
        ]);

        const newUser = insertUserResult.rows[0];

        return successResponse({ 
            message: 'User registered successfully', 
            user: { id: newUser.id, email: newUser.email, username: newUser.username } 
        }, 201);
    } catch (err) {
        console.error('Registration error:', err);
        return errorResponse('Internal Server Error', 500);
    }
}