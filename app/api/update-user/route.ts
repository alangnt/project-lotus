import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { put } from '@vercel/blob';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('avatar_url') as File | null;
        const username = formData.get('username') as string | null;
        const first_name = formData.get('first_name') as string | null;
        const last_name = formData.get('last_name') as string | null;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        let avatarUrl = null;
        if (file) {
            const filename = `${username}-${Date.now()}${path.extname(file.name)}`;
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

        // Remove trailing comma and add WHERE clause
        query = query.slice(0, -1) + ` WHERE username = $${paramCount} RETURNING avatar_url, first_name, last_name`;
        values.push(username);

        // Only proceed with the update if there are fields to update
        if (values.length > 1) {
            const result = await pool.query(query, values);
            console.log(`Database updated for user: ${username}`);
            return NextResponse.json(result.rows[0]);
        } else {
            return NextResponse.json({ message: 'No fields to update' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        if (error instanceof Error) {
            return NextResponse.json({ 
                error: `Failed to update user: ${error.message}`,
                stack: error.stack 
            }, { status: 500 });
        }
        return NextResponse.json({ error: 'Failed to update user: Unknown error' }, { status: 500 });
    }
}