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
      const expenses = await prisma.expense.findMany({
        where: { user_id: userId },
        orderBy: [
          { date: "desc" },
          { created_at: "desc" },
        ],
        take: 5,
      });

      return res.status(200).json(expenses);
    }

    if (req.method === "POST") {
      const { name, amount, category, date } = req.body;

      if (!name || amount === undefined || !category || !date) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newExpense = await prisma.expense.create({
        data: {
          user_id: userId,
          name,
          amount: parseFloat(amount),
          category,
          date: new Date(date),
        },
      });

      return res.status(201).json(newExpense);
    }
    
    if (req.method === "PUT") {
      const { id, name, amount, category, date } = req.body;

      if (!id || !name || amount === undefined || !category || !date) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const expense = await prisma.expense.findUnique({ where: { id: parseInt(id, 10) } });
      if (!expense || expense.user_id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedExpense = await prisma.expense.update({
        where: { id: parseInt(id, 10) },
        data: {
          name,
          amount: parseFloat(amount),
          category,
          date: new Date(date),
        },
      });

      return res.status(200).json(updatedExpense);
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) return res.status(400).json({ message: "Expense ID is required" });

      const expense = await prisma.expense.findUnique({ where: { id: parseInt(id, 10) } });
      if (!expense || expense.user_id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await prisma.expense.delete({ where: { id: parseInt(id, 10) } });
      return res.status(200).json({ message: "Deleted successfully" });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Expenses API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}