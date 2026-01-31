import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthorized } from '@/lib/auth';
import { getPool } from '@/lib/db';
import { userIdSchema } from '@/lib/validations';
import { errorResponse, successResponse, handleValidationError } from '@/lib/utils';
import { z } from 'zod';

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

        // Check authorization - users can only access their own points
        if (!(await isAuthorized(id))) {
            return errorResponse('Forbidden: You can only access your own points', 403);
        }

        const query = 'SELECT points FROM users_lotus WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return errorResponse('User not found', 404);
        }

        const points = result.rows[0].points;
        return successResponse({ points });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401);
        }
        console.error('Error fetching points:', error);
        return errorResponse('Internal Server Error', 500);
    }
}

export async function POST(request: NextRequest) {
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

        // Check authorization - users can only update their own points
        if (!(await isAuthorized(id))) {
            return errorResponse('Forbidden: You can only update your own points', 403);
        }
        
        const getQuery = 'SELECT points FROM users_lotus WHERE id = $1';
        const getResult = await pool.query(getQuery, [id]);

        if (getResult.rows.length === 0) {
            return errorResponse('User not found', 404);
        }

        const currentPoints = getResult.rows[0].points;
        const newPoints = currentPoints + 100;

        const updateQuery = 'UPDATE users_lotus SET points = $1 WHERE id = $2 RETURNING points';
        const updateResult = await pool.query(updateQuery, [newPoints, id]);

        return successResponse({ 
            message: 'Points updated successfully', 
            points: updateResult.rows[0].points 
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401);
        }
        console.error('Error updating points:', error);
        return errorResponse('Internal Server Error', 500);
    }
}