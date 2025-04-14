import { ZodError } from 'zod';

export function formatZodError(zoderr: ZodError) {
  const errormap = zoderr.format();
  for (const key in errormap) {
    const val = errormap[key];
    if (isArray(val)) {
      errormap[key] = flattenArray(val);
    }
    if (isObject(val)) {
      errormap[key] = iterate(val);
    }
  }
  return errormap;
}

function iterate(errormap: Record<string, any>): Record<string, any> {
  for (const key in errormap) {
    const val = errormap[key];
    if (isArray(val)) {
      errormap[key] = flattenArray(val);
    }
    if (isObject(val)) {
      errormap[key] = iterate(val);
    }
  }
  return errormap;
}

function flattenArray(array: string[]): string {
  if (array.length < 1) {
    return '';
  }
  return array[0];
}

function isObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): boolean {
  return Array.isArray(value);
}
