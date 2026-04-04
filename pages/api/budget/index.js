import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = parseInt(session.user.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // =========================
    // GET - Fetch budgets
    // =========================
    if (req.method === "GET") {
      const { month, year } = req.query;

      const whereClause = { user_id: userId };

      if (month) {
        const m = parseInt(month, 10);
        if (!isNaN(m)) whereClause.month = m;
      }

      if (year) {
        const y = parseInt(year, 10);
        if (!isNaN(y)) whereClause.year = y;
      }

      const budgets = await prisma.budget.findMany({
        where: whereClause,
        orderBy: [
          { year: "desc" },
          { month: "desc" },
          { created_at: "desc" },
        ],
      });

      return res.status(200).json(budgets);
    }

    // =========================
    // POST - Create / Update (Upsert)
    // =========================
    if (req.method === "POST") {
      const { amount, month, year, category } = req.body;

      if (amount === undefined || !month || !year) {
        return res.status(400).json({
          message: "Amount, month, and year are required",
        });
      }

      const parsedAmount = parseFloat(amount);
      const parsedMonth = parseInt(month, 10);
      const parsedYear = parseInt(year, 10);

      if (
        isNaN(parsedAmount) ||
        isNaN(parsedMonth) ||
        isNaN(parsedYear)
      ) {
        return res.status(400).json({
          message: "Invalid numeric values",
        });
      }

      const budgetCategory = category || "Overall";

      const budget = await prisma.budget.upsert({
        where: {
          user_id_month_year_category: {
            user_id: userId,
            month: parsedMonth,
            year: parsedYear,
            category: budgetCategory,
          },
        },
        update: {
          amount: parsedAmount,
        },
        create: {
          user_id: userId,
          amount: parsedAmount,
          month: parsedMonth,
          year: parsedYear,
          category: budgetCategory,
        },
      });

      return res.status(200).json(budget);
    }

    // =========================
    // DELETE - Remove budget
    // =========================
    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          message: "Budget ID is required",
        });
      }

      const parsedId = parseInt(id, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({
          message: "Invalid budget ID",
        });
      }

      // Check ownership
      const budget = await prisma.budget.findUnique({
        where: { id: parsedId },
      });

      if (!budget || budget.user_id !== userId) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      await prisma.budget.delete({
        where: { id: parsedId },
      });

      return res.status(200).json({
        message: "Deleted successfully",
      });
    }

    // =========================
    // ❌ Method Not Allowed
    // =========================
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error("Budget API Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}