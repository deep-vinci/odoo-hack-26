import type { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import {
  parseExpenseListQuery,
  validateCreateExpense,
} from "../validators/expense.validator";
import {
  createExpense as createExpenseService,
  deleteExpense as deleteExpenseService,
  listExpenses as listExpensesService,
} from "../services/expense.service";

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const input = validateCreateExpense(req.body);
  const expense = await createExpenseService(input, req.user.user_id);
  sendSuccess(res, 201, { expense });
});

export const listExpenses = asyncHandler(async (req: Request, res: Response) => {
  const query = parseExpenseListQuery(req.query as Record<string, unknown>);
  const result = await listExpensesService(query);
  sendSuccess(res, 200, result);
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  await deleteExpenseService(String(req.params.id));
  sendSuccess(res, 200, { message: "Expense deleted successfully" });
});
