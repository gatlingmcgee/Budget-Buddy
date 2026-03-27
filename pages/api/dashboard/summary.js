import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      console.error("Invalid userId from session:", session.user.id);
      return res.status(500).json({ message: "Invalid user session" });
    }

    const { month, year } = req.query;

    const expenseFilter = { user_id: userId };
    const budgetFilter = { user_id: userId };

    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (!isNaN(m) && !isNaN(y)) {
        expenseFilter.date = {
          gte: new Date(y, m - 1, 1),
          lt: new Date(y, m, 1),
        };
        budgetFilter.month = m;
        budgetFilter.year = y;
      }
    }

    const budgets = await prisma.budget.findMany({ where: budgetFilter });
    const expenses = await prisma.expense.findMany({ where: expenseFilter });

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const remaining = totalBudget - totalExpenses;

    return res.status(200).json({ totalBudget, totalExpenses, remaining });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}