import NextAuth, { NextAuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            email: string;
            username: string;
            points: string;
            first_name: string;
            last_name: string;
            avatar_url: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: number;
        email: string;
        username: string;
        points: string;
        first_name: string;
        last_name: string;
        avatar_url: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required");
                }

                try {
                    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    });

                    if (res.ok) {
                        const user = await res.json();
                        return {
                            id: user.id,
                            email: user.email,
                            username: user.username,
                            points: user.points.toString(),
                            first_name: user.first_name,
                            last_name: user.last_name,
                            avatar_url: user.avatar_url,
                        };
                    } else {
                        const errorText = await res.text();
                        console.error('Login failed:', errorText);
                        throw new Error(errorText || 'Login failed');
                    }
                } catch (error) {
                    console.error('Authorization error:', error);
                    throw new Error('An error occurred during authentication');
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 30, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.username = user.username;
                token.points = user.points;
                token.first_name = user.first_name;
                token.last_name = user.last_name;
                token.avatar_url = user.avatar_url;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as number;
                session.user.email = token.email as string;
                session.user.username = token.username as string;
                session.user.points = token.points as string;
                session.user.first_name = token.first_name as string;
                session.user.last_name = token.last_name as string;
                session.user.avatar_url = token.avatar_url as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
    },
    secret: process.env.NEXTAUTH_SECRET as string,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };