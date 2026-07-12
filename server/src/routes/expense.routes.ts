import { Router } from "express";

import {
  createExpense,
  deleteExpense,
  listExpenses,
} from "../controllers/expense.controller";
import { authenticate, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, requirePermission("POST /expenses"), createExpense);
router.get("/", authenticate, listExpenses);
router.delete("/:id", authenticate, requirePermission("DELETE /expenses/:id"), deleteExpense);

export default router;
