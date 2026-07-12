const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const toCsv = (
  columns: string[],
  rows: Record<string, unknown>[],
): string => {
  const header = columns.map(escapeCsvValue).join(",");
  const body = rows.map((row) => columns.map((col) => escapeCsvValue(row[col])).join(","));
  return [header, ...body].join("\n");
};
