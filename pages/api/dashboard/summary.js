import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

/**
 * Dashboard Summary API Endpoint.
 * Computes and returns aggregated metrics for a specific month/year, 
 * including total budget, total expenses, remaining budget, percentage used,
 * and the top spending category.
 */

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
          gte: new Date(Date.UTC(y, m - 1, 1)),
          lt: new Date(Date.UTC(y, m, 1)),
        };
        budgetFilter.month = m;
        budgetFilter.year = y;
      }
    }

    const budgets = await prisma.budget.findMany({
      where: budgetFilter,
    });

    const expenses = await prisma.expense.findMany({
      where: expenseFilter,
      orderBy: [
        { date: "desc" },
        { created_at: "desc" },
      ],
    });

    const totalBudget = budgets.reduce((sum, b) => {
      return sum + Number(b.amount);
    }, 0);

    const totalExpenses = expenses.reduce((sum, e) => {
      return sum + Number(e.amount);
    }, 0);

    const remaining = totalBudget - totalExpenses;

    const budgetUsedPercent =
      totalBudget > 0
        ? Number(((totalExpenses / totalBudget) * 100).toFixed(1))
        : 0;

    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category || "Other";
      acc[category] = (acc[category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    let topCategory = null;

    if (Object.keys(categoryTotals).length > 0) {
      const [name, amount] = Object.entries(categoryTotals).sort(
        (a, b) => b[1] - a[1]
      )[0];

      topCategory = {
        name,
        amount: Number(amount.toFixed(2)),
      };
    }

    return res.status(200).json({
      totalBudget,
      totalExpenses,
      remaining,
      budgetUsedPercent,
      topCategory,
      recentExpensesCount: expenses.length,
    });

  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}