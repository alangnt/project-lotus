import pg from 'pg';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();
    
    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    try {
        const userQuery = "SELECT * FROM users_lotus WHERE email = $1";
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = userResult.rows[0];

        if (!user.password) {
            console.error('User found but password hash is missing');
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return NextResponse.json({ 
            message: 'Login successful',
            id: user.id,
            username: user.username,
            email: user.email,
            points: user.points,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
        }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}