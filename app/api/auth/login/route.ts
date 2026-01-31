import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { errorResponse, successResponse, handleValidationError } from '@/lib/utils';

const pool = getPool();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;
        
        // Validate input
        const validationResult = loginSchema.safeParse({ email, password });
        
        if (!validationResult.success) {
            return handleValidationError(validationResult.error);
        }

        const validData = validationResult.data;

        // Query user - include password for verification but will not return it
        const userQuery = "SELECT id, username, email, password, points, first_name, last_name, avatar_url FROM users_lotus WHERE email = $1";
        const userResult = await pool.query(userQuery, [validData.email]);

        if (userResult.rows.length === 0) {
            return errorResponse('Invalid credentials', 401);
        }

        const user = userResult.rows[0];

        if (!user.password) {
            console.error('User found but password hash is missing');
            return errorResponse('Internal Server Error', 500);
        }

        const isPasswordValid = await bcrypt.compare(validData.password, user.password);

        if (!isPasswordValid) {
            return errorResponse('Invalid credentials', 401);
        }

        // Return user data WITHOUT password
        return successResponse({ 
            message: 'Login successful',
            id: user.id,
            username: user.username,
            email: user.email,
            points: user.points,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
        });
    } catch (err) {
        console.error('Login error:', err);
        return errorResponse('Internal Server Error', 500);
    }
}