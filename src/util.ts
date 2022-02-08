import path from "path";
export function getenv(variableName: string, defaultValue?: string): string {
  const value = process.env[variableName] || defaultValue;

  if (value == null) {
    throw new Error(`${variableName} not found in environment`);
  }
  return value;
}

export function findDirectory(category: string, hash: string) {
  return path.join(category, hash.substring(0, 2), hash.substring(2, 4));
}
