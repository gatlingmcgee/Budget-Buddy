import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = parseInt(session.user.id, 10);

    if (req.method === "GET") {
      const { month, year } = req.query;

      const whereClause = { user_id: userId };
      if (month) whereClause.month = parseInt(month, 10);
      if (year) whereClause.year = parseInt(year, 10);

      const budgets = await prisma.budget.findMany({
        where: whereClause,
      });

      return res.status(200).json(budgets);
    } 
    
    if (req.method === "POST") {
      const { amount, month, year, category } = req.body;

      if (amount === undefined || !month || !year) {
        return res.status(400).json({ message: "Amount, month, and year are required" });
      }

      const budgetCategory = category || "Overall";

      // Upsert: Create or Update based on unique constraint
      const budget = await prisma.budget.upsert({
        where: {
          user_id_month_year_category: {
            user_id: userId,
            month: parseInt(month, 10),
            year: parseInt(year, 10),
            category: budgetCategory,
          },
        },
        update: {
          amount: parseFloat(amount),
        },
        create: {
          user_id: userId,
          amount: parseFloat(amount),
          month: parseInt(month, 10),
          year: parseInt(year, 10),
          category: budgetCategory,
        },
      });

      return res.status(200).json(budget);
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Budget API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
