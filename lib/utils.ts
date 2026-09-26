/*
 * utils.ts
 * Provides utility functions for combining and merging Tailwind CSS classes.
 * Ensures predictable class precedence across all design system components.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
