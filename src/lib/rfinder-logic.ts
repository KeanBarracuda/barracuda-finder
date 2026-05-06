// Pure logic ported 1:1 from the Python source: matches_method() + helpers.
import { FIRST_NAME_TOKENS, YEAR_ID_RANGES } from "./rfinder-data";

const isDigit = (ch: string) => ch >= "0" && ch <= "9";
const isAlpha = (ch: string) => /^[a-zA-Z]$/.test(ch);

export function countTrailingDigits(s: string): number {
  let c = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    if (isDigit(s[i])) c++;
    else break;
  }
  return c;
}

function endsInExactNDigits(uname: string, n: number): boolean {
  if (uname.length < n) return false;
  const tail = uname.slice(-n);
  for (const ch of tail) if (!isDigit(ch)) return false;
  if (uname.length > n && isDigit(uname[uname.length - n - 1])) return false;
  return true;
}

export function usernameMatchesMethod(
  username: string,
  method: string,
): { ok: boolean; reason: string } {
  const uname = username;
  const lower = uname.toLowerCase();

  if (method === "random") return { ok: true, reason: "method=random" };

  if (method === "numberless") {
    const hasDigit = [...uname].some(isDigit);
    return hasDigit
      ? { ok: false, reason: "contains digits" }
      : { ok: true, reason: "no digits" };
  }

  if (method === "numbers") {
    const hasDigit = [...uname].some(isDigit);
    return hasDigit
      ? { ok: true, reason: "has digit" }
      : { ok: false, reason: "no digits" };
  }

  if (method === "ends_in_123") {
    return uname.endsWith("123")
      ? { ok: true, reason: "ends with 123" }
      : { ok: false, reason: "no 123" };
  }

  if (method === "ends_in_1_digit")
    return endsInExactNDigits(uname, 1)
      ? { ok: true, reason: "ends in 1 digit" }
      : { ok: false, reason: "" };

  if (method === "ends_in_2_digits")
    return endsInExactNDigits(uname, 2)
      ? { ok: true, reason: "ends in 2 digits" }
      : { ok: false, reason: "" };

  if (method === "ends_in_4_digits")
    return endsInExactNDigits(uname, 4)
      ? { ok: true, reason: "ends in 4 digits" }
      : { ok: false, reason: "" };

  if (method === "4digits_real_name") {
    const trailing = countTrailingDigits(lower);
    if (trailing !== 4) return { ok: false, reason: "need exactly 4 trailing digits" };
    const namePart = lower.slice(0, -4);
    if (!namePart || ![...namePart].every(isAlpha))
      return { ok: false, reason: "name part not pure letters" };
    if (!FIRST_NAME_TOKENS.has(namePart))
      return { ok: false, reason: `'${namePart}' not a real name` };
    return { ok: true, reason: `real name '${namePart}' + 4 digits` };
  }

  if (method === "year") {
    if (uname.length < 4) return { ok: false, reason: "too short" };
    const last4 = uname.slice(-4);
    if (![...last4].every(isDigit)) return { ok: false, reason: "no 4-digit tail" };
    if (uname.length > 4 && isDigit(uname[uname.length - 5]))
      return { ok: false, reason: "more than 4 trailing digits" };
    const year = parseInt(last4, 10);
    if (year >= 1970 && year <= 2017) return { ok: true, reason: `year ${year}` };
    return { ok: false, reason: `year ${year} out of range` };
  }

  if (method === "double") {
    if (!uname.length || !isDigit(uname[uname.length - 1]))
      return { ok: false, reason: "must end with digits" };
    const digitsLen = countTrailingDigits(uname);
    if (digitsLen < 1) return { ok: false, reason: "no trailing digits" };
    const core = uname.slice(0, -digitsLen);
    const letterRepeat = core.match(/([A-Za-z]{3,})\1/);
    if (letterRepeat) return { ok: true, reason: `repeated '${letterRepeat[1]}'` };
    const digitRepeat = core.match(/(\d{2})\1/);
    if (digitRepeat) return { ok: true, reason: `repeated '${digitRepeat[1]}'` };
    return { ok: false, reason: "no repeated chunk" };
  }

  if (method === "double_real_name") {
    let i = lower.length;
    while (i > 0 && isDigit(lower[i - 1])) i--;
    const base = lower.slice(0, i);
    const lettersOnly = [...base].filter(isAlpha).join("");
    if (!lettersOnly) return { ok: false, reason: "no letters" };
    for (const name of FIRST_NAME_TOKENS) {
      if (lettersOnly === name + name)
        return { ok: true, reason: `doubled real name '${name}'` };
    }
    return { ok: false, reason: "not a doubled real name" };
  }

  if (method === "real_name") {
    let endingType: string;
    if (lower.endsWith("123")) {
      endingType = "123";
    } else {
      const trailing = countTrailingDigits(lower);
      if (trailing < 2 || trailing > 4)
        return { ok: false, reason: `${trailing} trailing digits (need 2–4 or '123')` };
      endingType = `${trailing}_digits`;
    }
    const lettersOnly = [...lower].filter(isAlpha).join("");
    if (!lettersOnly) return { ok: false, reason: "no letters" };
    const allHits: { name: string; start: number; end: number }[] = [];
    for (const name of FIRST_NAME_TOKENS) {
      let start = 0;
      while (true) {
        const idx = lettersOnly.indexOf(name, start);
        if (idx === -1) break;
        allHits.push({ name, start: idx, end: idx + name.length });
        start = idx + 1;
      }
    }
    if (!allHits.length) return { ok: false, reason: "no name token" };
    allHits.sort((a, b) => b.end - b.start - (a.end - a.start));
    const n = lettersOnly.length;
    const covered = new Array(n).fill(false);
    const tokens = new Set<string>();
    for (const { name, start, end } of allHits) {
      let newCov = false;
      for (let i = start; i < end; i++) if (!covered[i]) { newCov = true; break; }
      if (!newCov) continue;
      for (let i = start; i < Math.min(end, n); i++) covered[i] = true;
      tokens.add(name);
    }
    if (!tokens.size) return { ok: false, reason: "no token contributed" };
    let extra = 0;
    for (let i = 0; i < n; i++) if (!covered[i]) extra++;
    if (extra < 1) return { ok: false, reason: `extra_letters=${extra}` };
    return { ok: true, reason: `tokens=${[...tokens].sort()} +${extra} letters, ${endingType}` };
  }

  if (method === "nonstop") return { ok: true, reason: "nonstop" };

  return { ok: true, reason: "fallback" };
}

export function randomIdForYear(year: string): number {
  const range = YEAR_ID_RANGES[year] ?? YEAR_ID_RANGES["Any year"];
  const [lo, hi] = range;
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}
