export const normalizeDates = (date: string): string => {
  const [month, day, year] = date.split("/");
  return day + "/" + month + "/" + year;
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const normalizeOptionalISODate = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();

  if (!s) return null;

  // common "bad" / "open ended" values
  const lower = s.toLowerCase();
  if (lower === "present" || lower === "current" || lower === "now")
    return null;
  if (lower === "invalid date" || lower === "invalid") return null;

  // only allow strict YYYY-MM-DD
  if (!ISO_DATE_RE.test(s)) return null;

  return s;
};
