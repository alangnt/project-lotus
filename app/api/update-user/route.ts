import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import path from 'path';
import { requireAuth } from '@/lib/auth';
import { getPool } from '@/lib/db';
import { updateUserSchema } from '@/lib/validations';
import { errorResponse, successResponse, handleValidationError } from '@/lib/utils';

const pool = getPool();

export async function POST(request: NextRequest) {
    try {
        // Require authentication
        const user = await requireAuth();

        const formData = await request.formData();
        const file = formData.get('avatarUrl') as File | null;
        const first_name = formData.get('firstName') as string | null;
        const last_name = formData.get('lastName') as string | null;

        // Validate input
        const validationResult = updateUserSchema.safeParse({
            username: user.username,
            first_name: first_name || undefined,
            last_name: last_name || undefined,
        });

        if (!validationResult.success) {
            return handleValidationError(validationResult.error);
        }

        // Validate file if provided
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                return errorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.', 400);
            }

            if (file.size > maxSize) {
                return errorResponse('File size exceeds 5MB limit', 400);
            }
        }

        let avatarUrl = null;
        if (file) {
            const filename = `${user.username}-${Date.now()}${path.extname(file.name)}`;
            const blob = await put(filename, file, {
                access: 'public',
            });
            avatarUrl = blob.url;
        }

        // Prepare the query and values dynamically based on provided information
        let query = 'UPDATE users_lotus SET';
        const values = [];
        let paramCount = 1;

        if (first_name) {
            query += ` first_name = $${paramCount},`;
            values.push(first_name);
            paramCount++;
        }
        if (last_name) {
            query += ` last_name = $${paramCount},`;
            values.push(last_name);
            paramCount++;
        }
        if (avatarUrl) {
            query += ` avatar_url = $${paramCount},`;
            values.push(avatarUrl);
            paramCount++;
        }

        // No fields to update
        if (values.length === 0) {
            return successResponse({ message: 'No fields to update' });
        }

        // Remove trailing comma and add WHERE clause
        query = query.slice(0, -1) + ` WHERE username = $${paramCount} RETURNING avatar_url, first_name, last_name`;
        values.push(user.username);

        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return errorResponse('User not found', 404);
        }

        return successResponse(result.rows[0]);
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return errorResponse('Unauthorized', 401);
        }
        console.error('Error updating user:', error);
        
        if (error instanceof Error) {
            return errorResponse(`Failed to update user: ${error.message}`, 500);
        }
        return errorResponse('Failed to update user: Unknown error', 500);
    }
}