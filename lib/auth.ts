import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

/**
 * Require authentication for API routes
 * Throws an error if the user is not authenticated
 * @returns The authenticated user object
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  
  return session.user;
}

/**
 * Check if a user is authorized to access a specific resource
 * @param userId - The user ID from the request
 * @returns true if authorized, false otherwise
 */
export async function isAuthorized(userId: number): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return false;
  }
  
  // User can only access their own resources
  // Use Number() to ensure consistent type comparison (JWT may store id as string)
  return Number(session.user.id) === Number(userId);
}

/**
 * Get the current session or null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions);
}
