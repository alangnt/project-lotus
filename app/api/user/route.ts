import pg from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || id === 'undefined') {
        return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
    }

    try {
        const userQuery = "SELECT * FROM users_lotus WHERE id = $1";
        const userResult = await pool.query(userQuery, [id]);

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        } else {
            return NextResponse.json({ 
                message: 'Login successful',
                id: userResult.rows[0].id,
                username: userResult.rows[0].username,
                email: userResult.rows[0].email,
                points: userResult.rows[0].points,
                first_name: userResult.rows[0].first_name,
                last_name: userResult.rows[0].last_name,
                avatar_url: userResult.rows[0].avatar_url,
            }, { status: 200 });
        }
    }
    catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}