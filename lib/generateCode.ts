// lib/generateCode.ts
const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateCode(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * ALPHANUM.length);
    result += ALPHANUM[idx];
  }
  return result;
}
