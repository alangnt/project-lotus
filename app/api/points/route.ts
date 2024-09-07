import pg from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const query = 'SELECT points FROM users_lotus WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const points = result.rows[0].points;
        return NextResponse.json({ points });
    } catch (error) {
        console.error('Error fetching points:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    try {
        const getQuery = 'SELECT points FROM users_lotus WHERE id = $1';
        const getResult = await pool.query(getQuery, [id]);

        if (getResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentPoints = getResult.rows[0].points;
        const newPoints = currentPoints + 100;

        const updateQuery = 'UPDATE users_lotus SET points = $1 WHERE id = $2';
        await pool.query(updateQuery, [newPoints, id]);

        return NextResponse.json({ message: 'Points updated successfully', newPoints });
    } catch (error) {
        console.error('Error updating points:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}