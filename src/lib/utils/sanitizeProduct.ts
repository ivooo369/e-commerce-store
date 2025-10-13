import type { Serializable, SerializableObject } from "@/lib/types/types";
import type { Product } from "@/lib/types/interfaces";

const ensureDateString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
  ) {
    return value;
  }

  try {
    const dateValue = value instanceof Date ? value : new Date(String(value));
    const date = isNaN(dateValue.getTime()) ? new Date() : dateValue;
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    throw new Error("Възникна грешка при парсване на данните:", value);
  }

  return undefined;
};

function makeSerializable<T>(obj: T): Serializable {
  if (obj === null || typeof obj !== "object") {
    return obj as Serializable;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => makeSerializable(item));
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  const result: SerializableObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "createdAt" || key === "updatedAt") {
      const dateStr = ensureDateString(value);
      if (dateStr !== undefined) {
        result[key] = dateStr;
      } else if (value !== undefined) {
        result[key] = value as Serializable;
      }
    } else if (value && typeof value === "object") {
      result[key] = makeSerializable(value);
    } else {
      result[key] = value as Serializable;
    }
  }

  return result;
}

export function sanitizeProduct<T>(product: T): T {
  if (product === null || product === undefined) {
    return product;
  }
  try {
    const serialized = JSON.parse(JSON.stringify(product));
    return makeSerializable(serialized) as unknown as T;
  } catch {
    return product;
  }
}

export const serializeProductDates = (product: Product): Product => ({
  ...product,
  createdAt:
    product.createdAt instanceof Date
      ? product.createdAt.toISOString()
      : product.createdAt,
  updatedAt:
    product.updatedAt instanceof Date
      ? product.updatedAt.toISOString()
      : product.updatedAt,
});
