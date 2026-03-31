import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Standard error response format
 */
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard success response format
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Handle validation errors from Zod
 */
export function handleValidationError(error: z.ZodError) {
  const firstError = error.issues[0];
  if (!firstError) {
    return errorResponse('Validation error', 400);
  }
  return errorResponse(firstError.message, 400);
}

/**
 * Exclude fields from an object
 */
export function exclude<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
