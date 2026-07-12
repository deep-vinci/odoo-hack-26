export const EXPENSE_TYPES = ["toll", "parking", "fine", "misc"] as const;

export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export const isExpenseType = (value: unknown): value is ExpenseType =>
  typeof value === "string" && (EXPENSE_TYPES as readonly string[]).includes(value);
