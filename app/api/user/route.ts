import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthorized } from '@/lib/auth';
import { getPool } from '@/lib/db';
import { userIdSchema } from '@/lib/validations';
import { errorResponse, successResponse, handleValidationError } from '@/lib/utils';

const pool = getPool();

export async function GET(request: NextRequest) {
    try {
        // Require authentication
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const idParam = searchParams.get('id');

        // Validate user ID
        const validationResult = userIdSchema.safeParse(idParam);
        if (!validationResult.success) {
            return handleValidationError(validationResult.error);
        }

        const id = validationResult.data;

        // Check authorization - users can only access their own data
        if (!(await isAuthorized(id))) {
            return errorResponse('Forbidden: You can only access your own user data', 403);
        }

        // Explicitly exclude password from query
        const userQuery = `
            SELECT id, username, email, points, first_name, last_name, avatar_url, created_at
            FROM users_lotus 
            WHERE id = $1
        `;
        const userResult = await pool.query(userQuery, [id]);

        if (userResult.rows.length === 0) {
            return errorResponse('User not found', 404);
        }

        return successResponse(userResult.rows[0]);
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401);
        }
        console.error('Error fetching user:', error);
        return errorResponse('Internal Server Error', 500);
    }
}