export function createZodError(obj: Record<string, string>) {
  const result: Record<string, any> = {};
  for (const key in obj) {
    result[key] = {
      _errors: obj[key],
    };
  }
}
