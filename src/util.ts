// eslint-disable-next-line import/prefer-default-export
export function getenv(variableName: string, defaultValue?: string): string {
  const value = process.env[variableName] || defaultValue;

  if (value == null) {
    throw new Error(`${variableName} not found in environment`);
  }
  return value;
}
