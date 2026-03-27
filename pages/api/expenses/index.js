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

    if (req.method === "GET") {
      // Return all expenses for user
      const expenses = await prisma.expense.findMany({
        where: { user_id: userId },
        orderBy: { date: "desc" },
      });
      return res.status(200).json(expenses);
    }

    if (req.method === "POST") {
      const { title, amount, category, date } = req.body;

      if (!title || amount === undefined || !category) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newExpense = await prisma.expense.create({
        data: {
          user_id: userId,
          name: title,
          amount: parseFloat(amount),
          category,
          date: date ? new Date(date) : new Date(),
        },
      });

      return res.status(201).json(newExpense);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Expenses API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}