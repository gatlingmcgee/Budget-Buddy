import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Expenses() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "" });

  // Protect route
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status]);

  // Fetch expenses
  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    if (session) fetchExpenses();
  }, [session]);

  // Form change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit new expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", amount: "", category: "" });
    fetchExpenses();
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="expenses-page">
      <h1> Expense Tracker</h1>

      {/* ADD EXPENSE FORM */}
      <form onSubmit={handleSubmit} className="expense-form">
        <input
          name="title"
          placeholder="Expense name"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <input
          name="category"
          placeholder="Category (Food, Bills...)"
          value={form.category}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Expense</button>
      </form>

      {/* EXPENSE LIST */}
      <div className="expense-list">
        <h2>All Expenses</h2>
        {expenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.title}</td>
                  <td>{exp.category}</td>
                  <td>${exp.amount}</td>
                  <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}