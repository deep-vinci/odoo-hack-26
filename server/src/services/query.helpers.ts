export const round = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const addDateParams = (
  from: string | null,
  to: string | null,
  values: unknown[],
): { fromIdx: number; toIdx: number } => {
  let fromIdx = 0;
  let toIdx = 0;
  if (from) {
    values.push(from);
    fromIdx = values.length;
  }
  if (to) {
    values.push(to);
    toIdx = values.length;
  }
  return { fromIdx, toIdx };
};

export const dateRangeClause = (column: string, fromIdx: number, toIdx: number): string =>
  (fromIdx ? ` AND ${column} >= $${fromIdx}::date` : "") +
  (toIdx ? ` AND ${column} < ($${toIdx}::date + INTERVAL '1 day')` : "");
