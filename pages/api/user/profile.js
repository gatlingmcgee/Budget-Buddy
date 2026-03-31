import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = parseInt(session.user.id, 10);

    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      });
      return res.status(200).json(user);
    }

    if (req.method === "PUT") {
      const { username, email, first_name, last_name, new_password } = req.body;

      // Basic validation
      if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
      }

      // Check if new username or email is already taken by ANOTHER user
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username, id: { not: userId } },
            { email: email, id: { not: userId } },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({ message: "Username is already taken" });
        }
        if (existingUser.email === email) {
          return res.status(400).json({ message: "Email is already taken" });
        }
      }

      // Prepare data for update
      const dataToUpdate = {
        username,
        email,
        first_name: first_name || null,
        last_name: last_name || null,
      };

      // If user wants to change password
      if (new_password && new_password.trim() !== "") {
        dataToUpdate.password = await bcrypt.hash(new_password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
          username: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      });

      return res.status(200).json({
        message: "Profile updated successfully!",
        user: updatedUser,
      });
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Profile API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
